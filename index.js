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
  req.searchParams.set('url', inputUrl)
  req.searchParams.set('selector', inputSelector)

  console.log(`Making request...`)

  const res = await fetch(req)
  let json = await res.json()

  console.log(`Scraper returned ${JSON.stringify(json)}`)

  const { result } = json

  console.log(`Result is ${result}, which is an ${typeof result}`)

  if (typeof result === 'array') {
    result = result[0]
  } else if (typeof result === 'object') {
    core.setFailed(
      `Multi-selector tests aren't implemented yet! Try passing a simple single selector to this action.`,
    )
  }

  console.log(`Comparing ${result} to ${inputTest}`)

  if (result != inputTest) {
    core.setFailed(
      `Unable to validate ${inputSelector} at ${inputUrl}, expected ${inputTest} but got ${result}`,
    )
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
    console.log(`File detected: ${file}`)
    testMultiple(file)
  } else {
    testSingle()
  }
} catch (error) {
  core.setFailed(error.message)
}
