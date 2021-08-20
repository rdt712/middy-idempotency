const middy = require('@middy/core')
const idempotency = require('middy-idempotency')

const DynamoDbPersistenceLayer = require('middy-idempotency/persistence/dynamodb')

const processEvent = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'hello world'
    })
  }
}

const dynamodb = new DynamoDbPersistenceLayer({
  tableName: process.env.DYNAMO_IDEMPOTENCY_TABLE,
  options: {
    endpoint: 'http://host.docker.internal:8000',
    region: 'localhost',
    accessKeyId: 'access_key_id',
    secretAccessKey: 'secret_access_key'
  }
})

const lambdaHandler = middy(processEvent).use(idempotency({ PersistenceStore: dynamodb }))

module.exports = { lambdaHandler }
