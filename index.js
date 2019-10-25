const fs = require('fs')

const core = require('@actions/core')
const fetch = require('node-fetch')

const DEBUG = core.getInput('debug') || false
const log = arg => DEBUG && core.debug(arg)

const testSingle = async ({ test, url, selector } = {}) => {
  const inputTest = test || core.getInput('test')
  const inputUrl = url || core.getInput('url')
  const inputSelector = selector || core.getInput('selector')

  log(`Testing ${inputTest}`)
  log(`URL is ${inputUrl}`)
  log(`Selector is ${inputSelector}`)

  const req = new URL('https://web.scraper.workers.dev')
  req.searchParams.set('url', url)
  req.searchParams.set('selector', selector)

  log(`Making request...`)

  const res = await fetch(req)
  let { result } = await res.json()

  log(`Scraper returned ${result}`)

  if (typeof result === 'array') {
    result = result[0]
  } else if (typeof result === 'object') {
    core.setFailed(
      `Multi-selector tests aren't implemented yet! Try passing a simple single selector to this action.`,
    )
  }

  log(`Comparing ${result} to ${test}`)

  if (result != test) {
    core.setFailed(`Unable to validate ${selector} at ${url}, expected ${test} but got ${result}`)
  }
}

const testMultiple = file => {
  const data = fs.readFileSync(file, 'utf8')
  log(`File ${file} read: ${data}`)
  const tests = JSON.parse(data)
  log(`Parsed as JSON: ${tests}`)
  tests.forEach(testSingle)
}

try {
  const makeRequest = async () => {
    const file = core.getInput('file')

    if (file) {
      log(`File detected: ${file}. Testing multiple`)
      testMultiple(file)
    } else {
      log(`Testing single`)
      testSingle()
    }
  }

  makeRequest()
} catch (error) {
  core.setFailed(error.message)
}
