const fs = require('fs')

const core = require('@actions/core')
const fetch = require('node-fetch')

const testSingle = async ({ test, url, selector }) => {
  const inputTest = test || core.getInput('test')
  const inputUrl = url || core.getInput('url')
  const inputSelector = selector || core.getInput('selector')

  const req = new URL('https://web.scraper.workers.dev')
  req.searchParams.set('url', url)
  req.searchParams.set('selector', selector)

  const res = await fetch(req)
  let { result } = await res.json()

  if (typeof result === 'array') {
    result = result[0]
  } else if (typeof result === 'object') {
    core.setFailed(
      `Multi-selector tests aren't implemented yet! Try passing a simple single selector to this action.`,
    )
  }

  if (result != test) {
    core.setFailed(`Unable to validate ${selector} at ${url}, expected ${test} but got ${result}`)
  }
}

const testMultiple = file => {
  const data = fs.readFileSync(file)
  const tests = JSON.parse(data)
  tests.forEach(testSingle)
}

try {
  const makeRequest = async () => {
    const file = core.getInput('file')

    if (file) {
      testMultiple(file)
    } else {
      testSingle()
    }
  }

  makeRequest()
} catch (error) {
  core.setFailed(error.message)
}
