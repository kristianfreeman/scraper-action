const fs = require('fs')

const core = require('@actions/core')
const fetch = require('node-fetch')

const testSingle = async ({ test, url, selector } = {}) => {
  const inputTest = test || core.getInput('test')
  const inputUrl = url || core.getInput('url')
  const inputSelector = selector || core.getInput('selector')

  console.log(`Testing ${inputTest}`)
  console.log(`URL is ${inputUrl}`)
  console.log(`Selector is ${inputSelector}`)

  const req = new URL('https://web.scraper.workers.dev')
  req.searchParams.set('url', url)
  req.searchParams.set('selector', selector)

  console.log(`Making request...`)

  const res = await fetch(req)
  let { result } = await res.json()

  console.log(`Scraper returned ${result}`)

  if (typeof result === 'array') {
    result = result[0]
  } else if (typeof result === 'object') {
    core.setFailed(
      `Multi-selector tests aren't implemented yet! Try passing a simple single selector to this action.`,
    )
  }

  console.log(`Comparing ${result} to ${test}`)

  if (result != test) {
    core.setFailed(`Unable to validate ${selector} at ${url}, expected ${test} but got ${result}`)
  }
}

const testMultiple = file => {
  const data = fs.readFileSync(file, 'utf8')
  console.log(`File ${file} read: ${data}`)
  const tests = JSON.parse(data)
  console.log(`Parsed as JSON: ${tests}`)
  tests.forEach(testSingle)
}

try {
  const file = core.getInput('file')

  if (file) {
    console.log(`File detected: ${file}. Testing multiple`)
    testMultiple(file)
  } else {
    console.log(`Testing single`)
    testSingle()
  }
} catch (error) {
  core.setFailed(error.message)
}
