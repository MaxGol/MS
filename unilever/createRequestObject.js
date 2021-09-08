import moment from 'moment'
import SHA256Hash from 'sha256'
import queryConfig from './queryConfig'

const { uniliverConfig } = queryConfig

export const createRequestObject = (data, index) => {
  const genUnileverId = uniliverConfig.ULID_min + index
  return {
    'Profile': {
      'identity': {
        'unileverId': genUnileverId,
        'hashedUnileverId': SHA256Hash(`WelcomeTo ${genUnileverId} Unilever`),
        'language': 'EN',
        'country': 'GB',
        'origin': 'Send Me a Sample',
        'identity': {
          'firstName': data['name.first_name'],
          'lastName': data['name.last_name'],
          'honorificPrefix': data['name.title']
        },
        'gender': data['gender'],
        'contactDetail': [
          {
            'channelType': {
              'channel': 'EM'
            },
            'id': data['email']
          }
        ],
        'address': {
          'addressLine1': JSON.parse(data.address).line_1,
          'addressLine2': JSON.parse(data.address).line_2,
          'cityName': JSON.parse(data.address).city,
          'postalCode': JSON.parse(data.address).postcode,
          'stateOrProvince': JSON.parse(data.address).county,
          'country': JSON.parse(data.address).country
        },
        'optInStatus': [
          {
            'serviceId': uniliverConfig.Service_ID,
            'channelType': {
              'channel': 'EM'
            },
            'optinLevel': 3,
            'optinValue': uniliverConfig.optinValue,
            'subscribed': JSON.parse(data['consent'])
          }
        ]
      }
    },
    'campaign': {
      'campaignProfile': {
        'brand': {
          'brandCode': uniliverConfig.brandCode,
          'brandDescription': data['display.brand']
        },
        'campaignDescription': uniliverConfig.Campaign_Name,
        'campaignID': uniliverConfig.Campaign_ID,
        'endDate': moment.unix(data['end_on'] / 1000).utc().format(),
        'startDate': moment.unix(data['start_on'] / 1000).utc().format()
      },
      'product': {
        'productID': uniliverConfig.productID,
        'productDescription': data['display.product']
      },
      'responseDetail': [
        {
          'lineItem': 1,
          'attributeID': 1320,
          'responseID': [1021]
        },
        {
          'lineItem': 2,
          'attributeID': 1418,
          'responseID': [JSON.parse(data['over_18']) ? 1021 : 1022]
        }
      ]
    }
  }
}
