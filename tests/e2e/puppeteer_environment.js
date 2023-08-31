/* eslint-disable @typescript-eslint/no-var-requires */
const { readFile } = require('fs').promises
const os = require('os')
const path = require('path')
const puppeteer = require('puppeteer')
const NodeEnvironment = require('jest-environment-node')

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup')

class PuppeteerEnvironment extends NodeEnvironment {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async setup () {
    await super.setup()
    // get the wsEndpoint
    const wsEndpoint = await readFile(path.join(DIR, 'wsEndpoint'), 'utf8')
    if (wsEndpoint === '') {
      throw new Error('wsEndpoint not found')
    }

    // connect to puppeteer
    this.global.__BROWSER_GLOBAL__ = await puppeteer.connect({
      browserWSEndpoint: wsEndpoint
    })

    // console.log(this.global.__BACKGROUND_WORKER__);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async teardown () {
    if (typeof this.global.__BROWSER_GLOBAL__?.disconnect === 'function') {
      this.global.__BROWSER_GLOBAL__.disconnect()
    }
    if (typeof this.global.__BROWSER_GLOBAL__?.close === 'function') {
      this.global.__BROWSER_GLOBAL__.close()
    }
    await super.teardown()
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  getVmContext () {
    return super.getVmContext()
  }
}

module.exports = PuppeteerEnvironment
