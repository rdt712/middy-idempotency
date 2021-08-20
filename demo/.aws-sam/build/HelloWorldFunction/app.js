const middy = require('@middy/core')
const idempotency = require('middy-idempotency')

const processEvent = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'hello world',
    }),
  }
}

const lambdaHandler = middy(processEvent).use(
  idempotency({
    tableName: process.env.DYNAMO_IDEMPOTENCY_TABLE,
    awsClientOptions: {
      endpoint: 'http://docker.for.mac.localhost:8000',
      region: 'localhost',
      accessKeyId: 'access_key_id',
      secretAccessKey: 'secret_access_key',
    },
  })
)

module.exports = { lambdaHandler }
