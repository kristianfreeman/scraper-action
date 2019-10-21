const core = require('@actions/core')
const fetch = require('node-fetch')

try {
  const makeRequest = async () => {
    const url = core.getInput('url')
    const selector = core.getInput('selector')
    const test = core.getInput('test') || ''

    const req = new URL("https://web.scraper.workers.dev")
    req.searchParams.set('url', url)
    req.searchParams.set('selector', selector)

    const res = await fetch(req)
    const json = await res.json()

    console.log(test)
    console.log(json)
  }

  makeRequest()
} catch (error) {
  core.setFailed(error.message)
}
