const crypto = require('crypto')
const jmespath = require('jmespath')

// Extract data from lambda event using event key path, and return a hashed representation
const getHashedIdempotencyKey = (event, context, eventKeyPath, hashFunction) => {
  let hash

  if (eventKeyPath) {
    const data = jmespath.search(event, eventKeyPath)
    hash = _generateHash(data, hashFunction)
  } else {
    hash = _generateHash(event, hashFunction)
  }

  return `${context.functionName}#${hash}`
}

// Generate a hash value from the provided data
const _generateHash = (data, hashFunction) => {
  return crypto.createHash(hashFunction).update(JSON.stringify(data)).digest('base64')
}

// Unix timestamp of expiry date for idempotency record
const getExpiryTimestamp = (expiresAfterSeconds) => {
  return Math.round(Date.now() / 1000) + expiresAfterSeconds
}

module.exports = {
  getHashedIdempotencyKey,
  getExpiryTimestamp
}
