import moment from 'moment'

export default {
  api: 'https://gbprm.unileverservices.com/consumer-interaction-eu-100/api/consumer_interaction_create',
  brandGuid: '2c22fe72-570c-4d22-9f11-cdbc2b7ce87e',
  brandDisplayName: 'Street Style',
  productDisplayName: 'Thai Red Curry',
  today: moment().format('YYYY-MM-DD'),
  yesterday: moment().subtract(1, 'days').format('YYYY-MM-DD'),
  uniliverConfig: {
    Campaign_ID: 'PN000130',
    Campaign_Name: 'UK_PotNoodle_Street_Style_Sample',
    Service_ID: 'BRAND_GB_BF0688_EML',
    ULID_min: 911315068,
    ULID_max: 911335067,
    optinValue: 'BF0688',
    optinLevel: '3',
    brandCode: 'BF0688',
    productID: ''
  },
  headers: {
    'Content-Type': 'application/json',
    'Client_Id': '2bf71f03ebee41ea8266a0289be2d83b',
    'Client_Secret': '637BB26a7F0A4dE19950D6c9240812D5'
  }
}
