const core = require('@actions/core')
const fetch = require('node-fetch')

try {
  const makeRequest = async () => {
    const url = core.getInput('url')
    const selector = core.getInput('selector')
    const test = core.getInput('test') || ''

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

    if (result !== test) {
      core.setFailed(`Unable to validate ${selector} at ${url}, expected ${test} but got ${result}`)
    }
  }

  makeRequest()
} catch (error) {
  core.setFailed(error.message)
}
