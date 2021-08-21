const DynamoDb = require('aws-sdk/clients/dynamodb')

const {
  IdempotencyItemAlreadyExistsError,
  IdempotencyItemNotFoundError
} = require('../common/errors')

class DynamoDbPersistenceLayer {
  constructor ({
    tableName,
    config = {},
    keyAttr = 'id',
    statusAttr = 'status',
    expiryAttr = 'expiration',
    dataAttr = 'data'
  }) {
    this.client = new DynamoDb(config)
    this.tableName = tableName
    this.keyAttr = keyAttr
    this.statusAttr = statusAttr
    this.expiryAttr = expiryAttr
    this.dataAttr = dataAttr
  }

  itemToRecord (item) {
    return {
      idempotencyKey: item[this.keyAttr],
      status: item[this.statusAttr],
      expiryTimestamp: item[this.expiryAttr] || null,
      data: item[this.dataAttr] || '{}'
    }
  }

  async putRecord (record) {
    const params = {
      TableName: this.tableName,
      Item: {
        [this.keyAttr]: { S: record.idempotencyKey },
        [this.expiryAttr]: { N: record.expiryTimestamp.toString() },
        [this.statusAttr]: { S: record.status }
      },
      ConditionExpression: 'attribute_not_exists(#id)',
      ExpressionAttributeNames: {
        '#id': this.keyAttr
      }
    }

    try {
      await this.client.putItem(params).promise()
    } catch (error) {
      if (error.code === 'ConditionalCheckFailedException') {
        throw new IdempotencyItemAlreadyExistsError()
      }
    }
  }

  async getRecord (idempotencyKey) {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.keyAttr]: { S: idempotencyKey }
      },
      ConsistentRead: true
    }

    const response = await this.client.getItem(params).promise()

    let item
    if ('Item' in response) {
      item = response.Item
    } else {
      throw new IdempotencyItemNotFoundError()
    }

    return this.itemToRecord(item)
  }

  async updateRecord (record) {
    const params = {
      TableName: this.tableName,
      Key: { [this.keyAttr]: { S: record.idempotencyKey } },
      UpdateExpression: 'SET #expiry = :expiry, #status = :status, #data = :data',
      ExpressionAttributeNames: {
        '#expiry': this.expiryAttr,
        '#status': this.statusAttr,
        '#data': this.dataAttr
      },
      ExpressionAttributeValues: {
        ':expiry': { N: record.expiryTimestamp.toString() },
        ':status': { S: record.status },
        ':data': { S: record.data }
      }
    }

    await this.client.updateItem(params).promise()
  }

  async deleteRecord (record) {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.keyAttr]: { S: record.idempotencyKey }
      }
    }

    await this.client.deleteItem(params).promise()
  }
}

module.exports = DynamoDbPersistenceLayer
