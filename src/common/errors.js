/*
Idempotency errors
*/
const { IDEMPOTENCY_ERROR_TYPE } = require('./constants')

// Item attempting to be inserted into idempotency store already exists and is not expired
class IdempotencyItemAlreadyExistsError extends Error {
  constructor (message) {
    super(message)
    this.name = 'IdempotencyItemAlreadyExistsError'
    this.type = IDEMPOTENCY_ERROR_TYPE
  }
}

// Item does not exist in idempotency store
class IdempotencyItemNotFoundError extends Error {
  constructor (message) {
    super(message)
    this.name = 'IdempotencyItemNotFoundError'
    this.type = IDEMPOTENCY_ERROR_TYPE
  }
}

// Execution with idempotency key is already in progress
class IdempotencyAlreadyInProgressError extends Error {
  constructor (message) {
    super(message)
    this.name = 'IdempotencyAlreadyInProgressError'
    this.type = IDEMPOTENCY_ERROR_TYPE
  }
}

// An invalid status was provided
class IdempotencyInvalidStatusError extends Error {
  constructor (message) {
    super(message)
    this.name = 'IdempotencyAlreadyInProgressError'
    this.type = IDEMPOTENCY_ERROR_TYPE
  }
}

// Payload does not match stored idempotency record
class IdempotencyValidationError extends Error {
  constructor (message) {
    super(message)
    this.name = 'IdempotencyValidationError'
    this.type = IDEMPOTENCY_ERROR_TYPE
  }
}

// State is inconsistent across multiple requests to idempotency store
class IdempotencyInconsistentStateError extends Error {
  constructor (message) {
    super(message)
    this.name = 'IdempotencyInconsistentStateError'
    this.type = IDEMPOTENCY_ERROR_TYPE
  }
}

// Unrecoverable error from idempotency store
class IdempotencyPersistenceLayerError extends Error {
  constructor (message) {
    super(message)
    this.name = 'IdempotencyPersistenceLayerError'
    this.type = IDEMPOTENCY_ERROR_TYPE
  }
}

// Payload does not contain a idempotent key
class IdempotencyKeyError extends Error {
  constructor (message) {
    super(message)
    this.name = 'IdempotencyKeyError'
    this.type = IDEMPOTENCY_ERROR_TYPE
  }
}

module.exports = {
  IdempotencyItemAlreadyExistsError,
  IdempotencyItemNotFoundError,
  IdempotencyAlreadyInProgressError,
  IdempotencyInvalidStatusError,
  IdempotencyValidationError,
  IdempotencyInconsistentStateError,
  IdempotencyPersistenceLayerError,
  IdempotencyKeyError
}
