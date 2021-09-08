import { Athena, S3 } from 'aws-sdk'
import fs from 'fs'
import path from 'path'
import { createRequestObject } from './createRequestObject'
import csv from 'csv'
import axios from 'axios'
import _ from 'lodash'
import queryConfig from './queryConfig'

const CWD = process.cwd()
const config = JSON.parse(fs.readFileSync(path.resolve(CWD, `config/production/config.json.config`)))

const athenaEndpoint = `https://athena.${config.aws.region}.amazonaws.com`
const s3Endpoint = `https://s3.${config.aws.region}.amazonaws.com`
const query = fs.readFileSync(path.resolve(CWD, `tool/unilever/query.sql`)).toString()
const athena = new Athena({ ...config.aws, athenaEndpoint })
const s3 = new S3({...config.aws, s3Endpoint})
const recordsToProcess = 'tool/unilever/unileverData.csv'
const processedRecordsNumber = 'tool/unilever/processedRecordsNumber.txt'
// const API = 'https://qaprm.unileverservices.com/cloud-marketing-api-qa/api/cloud_marketing_create' - QA API

const { headers, api } = queryConfig

const responseHandler = (resolve, reject) => (error, data) => {
  if (error) {
    reject(error)
  } else {
    resolve(data)
  }
}

const startQueryExecution = (query) =>
  new Promise(async (resolve, reject) => {
    await athena.startQueryExecution({
      QueryString: query,
      QueryExecutionContext: {
        Database: 'sendmeasample-blue_production-db'
      },
      ResultConfiguration: {
        OutputLocation: 's3://sendmeasample-unilever'
      }
    }, responseHandler(resolve, reject))
  }).catch(error => console.log(error))

const getQueryExecution = (id) =>
  new Promise(async (resolve, reject) => {
    await athena.getQueryExecution({
      QueryExecutionId: id
    }, (err, data) => {
      if (data) {
        const status = data['QueryExecution']['Status']['State']
        if (status === 'RUNNING' || status === 'QUEUED') {
          setTimeout(() => resolve(getQueryExecution(id)), 3000)
        } else if (status === 'SUCCEEDED') {
          resolve(status)
        } else {
          resolve(status)
        }
      } else {
        console.log(err)
        reject(err)
      }
    })
  }).catch(error => console.log(error))

const copyS3Object = (id, name) =>
  new Promise(async (resolve, reject) => {
    await s3.copyObject({
      Bucket: 'sendmeasample-unilever',
      CopySource: encodeURIComponent(`sendmeasample-unilever/${id}.csv`),
      Key: encodeURIComponent(`${name}.csv`)
    }, responseHandler(resolve, reject))
  }).catch(error => console.log(error))

const deleteS3Object = (id, extension) =>
  new Promise(async (resolve, reject) => {
    await s3.deleteObject({
      Bucket: 'sendmeasample-unilever',
      Key: `${id}.${extension}`
    }, responseHandler(resolve, reject))
  }).catch(error => console.log(error))

const getS3Object = (file) =>
  new Promise(async (resolve, reject) => {
    await s3.getObject({
      Bucket: 'sendmeasample-unilever',
      Key: file
    }, responseHandler(resolve, reject))
  }).catch(error => console.log(error))

const writeFile = (data) =>
  new Promise((resolve, reject) => {
    try {
      fs.writeFileSync(path.resolve(CWD, recordsToProcess), data.Body, 'utf8')
      console.log(`File is saved in ${path.resolve(CWD, recordsToProcess)}`)
      resolve(true)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  }).catch(error => console.log(error))

const readExecutedFie = async (file) =>
  new Promise((resolve, reject) => {
    try {
      const data = fs.readFileSync(file)
      data.toString('utf8') ? resolve(parseInt(data.toString('utf8'))) : resolve(0)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  }).catch(error => console.log(error))

const processFile = async (lineCounter = 0) => {
  console.log(`-> Records processing will start from ${lineCounter}`)
  return new Promise((resolve, reject) => {
    try {
      const records = []
      const csvRawFile = fs.readFileSync(path.resolve(CWD, recordsToProcess), 'utf8')
      csv.parse(csvRawFile, {
        auto_parse: true,
        columns: true,
        from: lineCounter || 1
      }, async (err, rows) => {
        if (err) {
          console.log('-> Error parsing file')
          return
        } else {
          if (rows.length) {
            for (let row of rows) {
              const unileverObj = createRequestObject(row, lineCounter++)
              await new Promise(async (resolve, reject) => {
                try {
                  const unileverResp = await axios.post(api, unileverObj, { headers })
                  await fs.writeFileSync(path.resolve(CWD, processedRecordsNumber), lineCounter)
                  console.log(`Response: ${unileverResp.data.statusMessage} / ${lineCounter}`)
                  records.push(unileverResp.data.statusMessage)
                  resolve(unileverResp)
                } catch (error) {
                  await fs.writeFileSync(path.resolve(CWD, processedRecordsNumber), lineCounter)
                  reject(error)
                }
              }).catch(error => console.log(error))
            }
          } else {
            resolve(false)
          }
        }
        resolve([...records, rows.length])
      })
    } catch (error) {
      reject(error)
    }
  }).catch(error => console.log(error))
}

const processUnileverRecords = () => {
  return new Promise(async (resolve, reject) => {
    const counterFile = await fs.existsSync(processedRecordsNumber)
    if (counterFile) {
      const counter = await readExecutedFie(processedRecordsNumber)
      const processResult = await processFile(counter)
      const rows = processResult.pop()
      console.log(`*** ${processResult.length} Records/${rows} Rows were processed ***`)
      if (processResult.length === rows) {
        fs.unlinkSync(recordsToProcess)
        fs.unlinkSync(processedRecordsNumber)
      }
      resolve()
    } else {
      try {
        const templated = _.template(query)
        const sqlString = templated({...queryConfig})
        const QueryExecutionResult = await startQueryExecution(sqlString)
        const queryExecutionStatus = await getQueryExecution(QueryExecutionResult.QueryExecutionId)
        if (queryExecutionStatus === 'SUCCEEDED') {
          await copyS3Object(QueryExecutionResult.QueryExecutionId, 'unileverData')
          await deleteS3Object(QueryExecutionResult.QueryExecutionId, 'csv')
          await deleteS3Object(QueryExecutionResult.QueryExecutionId, 'csv.metadata')
          const data = await getS3Object('unileverData.csv')
          const fileSaved = await writeFile(data)
          if (fileSaved) {
            const processResult = await processFile()
            if (processResult) {
              const rows = processResult.pop()
              console.log(`*** ${processResult.length} Records/${rows} Rows were processed ***`)
              if (processResult.length === rows) {
                fs.unlinkSync(recordsToProcess)
                fs.unlinkSync(processedRecordsNumber)
              }
              resolve()
            } else {
              console.log('-> No records returned for today')
              fs.unlinkSync(recordsToProcess)
              resolve()
            }
          } else {
            throw new Error('-> Error creating CSV file')
          }
        } else {
          throw new Error('-> QueryExecution was not successful, check Athena history')
        }
      } catch (error) {
        reject(error)
      }
    }
  }).catch(error => console.log(error))
}

processUnileverRecords()
