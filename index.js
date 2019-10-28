const fs = require('fs')

const core = require('@actions/core')
const fetch = require('node-fetch')

const testSingle = async ({ test, url, selector } = {}) => {
  const inputTest = test || core.getInput('test')
  const inputUrl = url || core.getInput('url')
  const inputSelector = selector || core.getInput('selector')

  const req = new URL('https://web.scraper.workers.dev')
  req.searchParams.set('url', inputUrl)
  req.searchParams.set('selector', inputSelector)

  const res = await fetch(req)
  let json = await res.json()

  let { result } = json

  if (Array.isArray(result)) {
    result = result[0]
  } else if (typeof result === 'object') {
    core.setFailed(
      `Multi-selector tests aren't implemented yet! Try passing a simple single selector to this action.`,
    )
  }

  if (result != inputTest) {
    core.setFailed(
      `Check failed: ${inputSelector} at ${inputUrl}, expected ${inputTest} but got ${result}`,
    )
  }
}

const testMultiple = file => {
  const data = fs.readFileSync(file, 'utf8')
  const tests = JSON.parse(data)
  tests.forEach(testSingle)
}

try {
  const file = core.getInput('file')

  if (file) {
    testMultiple(file)
  } else {
    testSingle()
  }
} catch (error) {
  core.setFailed(error.message)
}
