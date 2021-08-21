const { getHashedIdempotencyKey, getExpiryTimestamp } = require('./common/utils')
const { COMPLETED, IDEMPOTENCY_ERROR_TYPE, INPROGRESS } = require('./common/constants')
const {
  IdempotencyAlreadyInProgressError,
  IdempotencyInconsistentStateError,
  IdempotencyItemAlreadyExistsError,
  IdempotencyItemNotFoundError,
  IdempotencyKeyError,
  IdempotencyPersistenceLayerError,
  IdempotencyValidationError
} = require('./common/errors')

/*
eventKeyJMESPath: str, optional
  A jmespath expression to extract the idempotency key from the event record.
  More info at https://github.com/jmespath/jmespath.js/
expiresAfterSeconds: int, optional
    The number of seconds to wait before a record is expired.
hashFunction: str, optional
    Function to use for calculating hashes, by default md5.
*/
const defaults = {
  PersistenceStore: undefined,
  eventKeyJMESPath: undefined,
  expiresAfterSeconds: 3600, // 1 hour
  hashFunction: 'md5'
}

const idempotency = (opts = {}) => {
  const options = { ...defaults, ...opts }

  let client

  // Delete the idempotency record from persistence store
  const _deleteIdempotencyRecord = async (event, context, error) => {
    const idempotencyKey = getHashedIdempotencyKey(
      event,
      context,
      options.eventKeyJMESPath,
      options.hashFunction
    )
    await client.deleteRecord({ idempotencyKey })
  }

  // Retrieve the idempotency record from persistence store
  const _getIdempotencyRecord = async (event, context) => {
    let record
    try {
      const idempotencyKey = getHashedIdempotencyKey(
        event,
        context,
        options.eventKeyJMESPath,
        options.hashFunction
      )
      record = await client.getRecord(idempotencyKey)
    } catch (error) {
      if (error instanceof IdempotencyItemNotFoundError) {
        // This code path will only be triggered if the record is removed between _saveInProgress and _getIdempotencyRecord.
        throw new IdempotencyInconsistentStateError(
          '_saveInProgress and _getIdempotencyRecord return inconsistent results.'
        )
      } else if (error instanceof IdempotencyValidationError) {
        // Allow this exception to bubble up
        throw error
      } else {
        // Wrap remaining unhandled exceptions with IdempotencyPersistenceLayerError to ease exception handling for clients
        throw new IdempotencyPersistenceLayerError('Failed to get record from idempotency store')
      }
    }

    return record
  }

  // Take appropriate action based on event_record's status
  const _handleForStatus = (record) => {
    if (record.status.S === INPROGRESS) {
      throw new IdempotencyAlreadyInProgressError(
        `Execution already ${INPROGRESS} with idempotency key:`,
        { idempotencyKey: record.idempotencyKey.S }
      )
    }

    return record
  }

  // Save record of function's execution being INPROGRESS
  const _saveInProgress = async (event, context) => {
    const record = {
      idempotencyKey: getHashedIdempotencyKey(
        event,
        context,
        options.eventKeyJMESPath,
        options.hashFunction
      ),
      status: INPROGRESS,
      expiryTimestamp: getExpiryTimestamp(options.expiresAfterSeconds)
    }
    await client.putRecord(record)
  }

  const _saveSuccess = async (event, context, response) => {
    const record = {
      idempotencyKey: getHashedIdempotencyKey(
        event,
        context,
        options.eventKeyJMESPath,
        options.hashFunction
      ),
      status: COMPLETED,
      expiryTimestamp: getExpiryTimestamp(options.expiresAfterSeconds),
      data: JSON.stringify(response)
    }
    await client.updateRecord(record)
  }

  const idempotencyBefore = async (request) => {
    if (!client) {
      if (options.PersistenceStore === undefined) {
        throw new IdempotencyPersistenceLayerError('Persistence Store cannot be undefined')
      }
      client = options.PersistenceStore
    }

    try {
      await _saveInProgress(request.event, request.context)
    } catch (error) {
      if (error instanceof IdempotencyKeyError) {
        throw error
      } else if (error instanceof IdempotencyItemAlreadyExistsError) {
        // Now we know the item already exists, we can retrieve it
        const record = await _getIdempotencyRecord(request.event, request.context)
        return _handleForStatus(record)
      } else {
        throw new IdempotencyPersistenceLayerError(
          `Failed to update record state to ${INPROGRESS} in idempotency store`
        )
      }
    }
  }

  const idempotencyAfter = async (request) => {
    try {
      await _saveSuccess(request.event, request.context, request.response)
    } catch (error) {
      throw new IdempotencyPersistenceLayerError(
        `Failed to update record state to ${COMPLETED} in idempotency store`
      )
    }
  }

  const idempotencyOnError = async (request) => {
    if (request.error.type === IDEMPOTENCY_ERROR_TYPE) {
      return
    }

    // Only delete if the error was caused in the lambda handler
    try {
      await _deleteIdempotencyRecord(request.event, request.context, request.error)
    } catch (error) {
      throw new IdempotencyPersistenceLayerError('Failed to delete record from idempotency store')
    }
  }

  return {
    before: idempotencyBefore,
    after: idempotencyAfter,
    onError: idempotencyOnError
  }
}

module.exports = idempotency
