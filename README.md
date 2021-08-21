<div align="center">
 
  <h1>Idempotency Middleware for Middy</h1>

  <img alt="Middy logo" src="https://raw.githubusercontent.com/middyjs/middy/master/docs/img/middy-logo.png"/>

  <blockquote>Make AWS Lambda Functions Idempotent using Middy</blockquote>

[![Version](https://img.shields.io/npm/v/middy-idempotency?label=latest%20version)](https://www.npmjs.com/package/middy-idempotency)&nbsp; &nbsp;[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)&nbsp; &nbsp;![GitHub issues by-label](https://img.shields.io/github/issues/rdt712/middy-idempotency/bug)

</div>

In programming, **idempotency** refers to the capacity of an application or component to identify repeated events and prevent duplicated, inconsistent, or lost data. Making your AWS Lambda function idempotent requires designing your function logic to treat duplicated events correctly.

Idempotent function logic can help to reduce the following issues:

- Unnecessary API calls
- Code processing time
- Data inconsistency
- Throttles
- Latency

[Middy](https://middy.js.org/) is a middleware framework that allows you to simplify your AWS Lambda code when using Node.js. This middleware aims to replicate the [AWS Lambda Powertools idempotency utility](https://awslabs.github.io/aws-lambda-powertools-python/develop/utilities/idempotency/) built in Python.

Other sources to learn about idempotency:

- [How do I make my Lambda function idempotent?](https://aws.amazon.com/premiumsupport/knowledge-center/lambda-function-idempotent/)
- [Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)

Other idempotency projects for Middy:

- [middy-idempotent](https://github.com/ibrahimcesar/middy-idempotent) - Uses ioredis and Upstash

## Install

To install this middleware you can use NPM:

```bash
npm install --save middy-idempotency
```

Requires @middy/core >= 2.0.0

## Usage

**middy-idempotency** requires a persistence store to save the current status of an AWS Lambda execution. Currently, only
DynamoDB is supported as a persistence store.

```javascript
const middy = require('@middy/core')
const idempotency = require('middy-idempotency')

const DynamoDbPersistenceLayer = require('middy-idempotency/persistence/dynamodb')

const processEvent = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'hello world',
    }),
  }
}

const dynamodb = new DynamoDbPersistenceLayer({
  tableName: 'myIdempotencyTable',
})

const lambdaHandler = middy(processEvent).use(idempotency({ PersistenceStore: dynamodb }))

module.exports = { lambdaHandler }
```

## TODO

- [ ] Improve documentation
- [ ] Add in-memory cache
- [ ] Add payload validation
- [ ] Add more advanced customization
- [ ] Add other persistence stores (i.e. Redis)
- [ ] Convert to TypeScript for type checking

## Contributing

Feel free to fork and make a PR for any enhancements or new features!

## MIT License

Copyright (c) 2021 Ryan Toler

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
