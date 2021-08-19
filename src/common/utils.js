const crypto = require('crypto')

// Extract data from lambda event using event key path, and return a hashed representation
const getHashedIdempotencyKey = (event, context, eventKeyPath) => {
  let hash

  if (eventKeyPath) {
    hash = _generateHash(event[eventKeyPath])
  } else {
    hash = _generateHash(event)
  }

  return `${context.functionName}#${hash}`
}

// Generate a hash value from the provided data
const _generateHash = (data) => {
  return crypto.createHash('md5').update(JSON.stringify(data)).digest('base64')
}

// Unix timestamp of expiry date for idempotency record
const getExpiryTimestamp = (expiresAfterSeconds) => {
  return Date.now() + expiresAfterSeconds
}

module.exports = {
  getHashedIdempotencyKey,
  getExpiryTimestamp
}
