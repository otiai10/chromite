/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-var-requires, @typescript-eslint/strict-boolean-expressions */
const { readFile } = require('fs').promises
const os = require('os')
const path = require('path')
const puppeteer = require('puppeteer')
const NodeEnvironment = require('jest-environment-node')

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup')

class PuppeteerEnvironment extends NodeEnvironment {
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

  async teardown () {
    if (this.global.__BROWSER_GLOBAL__?.disconnect) {
      this.global.__BROWSER_GLOBAL__.disconnect()
    }
    if (this.global.__BROWSER_GLOBAL__?.close) {
      this.global.__BROWSER_GLOBAL__.close()
    }
    await super.teardown()
  }

  getVmContext () {
    return super.getVmContext()
  }
}

module.exports = PuppeteerEnvironment
