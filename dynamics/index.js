import { Athena, S3 } from 'aws-sdk'
import { config } from 'config'
import moment from 'moment'
import _ from 'lodash'
import usersByDate from './sql/users_by_date.sql'
import ordersByDate from './sql/orders_by_date.sql'
import marketingByDate from './sql/marketing_by_date.sql'
import campaignsByDate from './sql/campaigns_by_date.sql'

import { sendCronConfirmationEmail } from 'service/email'

const athenaEndpoint = process.env.IS_OFFLINE || process.env.STAGE === 'dev' ? `https://athena.${config.aws.region}.amazonaws.com` : undefined
const s3Endpoint = process.env.IS_OFFLINE || process.env.STAGE === 'dev' ? `https://s3.${config.aws.region}.amazonaws.com` : undefined
const athena = new Athena({ ...config.aws, athenaEndpoint })
const s3 = new S3({...config.aws, s3Endpoint})
const service = process.env.SERVICE
const stage = process.env.STAGE === 'dev' ? 'staging' : process.env.STAGE
const bucket = `${service}-${stage}-dynamics`
const timeStamp = moment().unix()
const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD')
const today = moment().format('YYYY-MM-DD')

const queries = [
  {name: 'users', key: usersByDate},
  {name: 'orders', key: ordersByDate},
  {name: 'campaigns', key: campaignsByDate},
  {name: 'marketing', key: marketingByDate}
]

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
        Database: `${service}_${stage}-db`
      },
      ResultConfiguration: {
        OutputLocation: `s3://${bucket}`
      }
    }, responseHandler(resolve, reject))
  })

const getQueryExecution = (id) => {
  return new Promise(async (resolve, reject) => {
    await athena.getQueryExecution({
      QueryExecutionId: id
    }, (err, data) => {
      if (data) {
        const status = data['QueryExecution']['Status']['State']
        if (status === 'RUNNING' || status === 'QUEUED') {
          setTimeout(() => resolve(getQueryExecution(id)), 10000)
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
  })
}

const copyS3Object = (id, name) =>
  new Promise(async (resolve, reject) => {
    await s3.copyObject({
      Bucket: bucket,
      CopySource: encodeURIComponent(`${bucket}/${id}.csv`),
      Key: encodeURIComponent(`${name}_${timeStamp}.csv`)
    }, responseHandler(resolve, reject))
  })

const deleteS3Object = (id, extension) =>
  new Promise(async (resolve, reject) => {
    await s3.deleteObject({
      Bucket: bucket,
      Key: `${id}.${extension}`
    }, responseHandler(resolve, reject))
  })

export default () =>
  new Promise(async (resolve, reject) => {
    try {
      let results = []
      for (const query of queries) {
        const templated = _.template(query.key)
        const sqlString = templated({service: _.snakeCase(service), stage, yesterday, today})
        const result = await startQueryExecution(sqlString)
        const queryExecutionStatus = await getQueryExecution(result.QueryExecutionId)
        if (queryExecutionStatus === 'SUCCEEDED') {
          await copyS3Object(result.QueryExecutionId, query.name)
          await deleteS3Object(result.QueryExecutionId, 'csv')
          await deleteS3Object(result.QueryExecutionId, 'csv.metadata')
          results.push({ [query.name]: queryExecutionStatus })
        } else {
          reject(new Error(`Query ${queryExecutionStatus}, check Athena execution history error`))
        }
      }
      await sendCronConfirmationEmail('Dynamics Data Service', results)
      console.log(results)
      resolve(results)
    } catch (error) {
      await sendCronConfirmationEmail('Dynamics Data Service Error', error)
      console.log(error)
      reject(error)
    }
  })
