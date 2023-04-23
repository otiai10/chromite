const {mkdir, writeFile} = require('fs').promises;
const os = require('os');
const path = require('path');
const puppeteer = require('puppeteer');

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

module.exports = async function () {
    const extention = path.join(__dirname, "app");
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            `--disable-extensions-except=${extention}`,
            `---load-extension=${extention}`,
        ]
    });

    const background = await browser.waitForTarget(
        target => target.type() === 'service_worker',
    );
    const worker = await background.worker();

    // store the browser instance so we can teardown it later
    // this global is only available in the teardown but not in TestEnvironments
    globalThis.__BROWSER_GLOBAL__ = browser;
    globalThis.__BACKGROUND_WORKER__ = worker;

    // use the file system to expose the wsEndpoint for TestEnvironments
    await mkdir(DIR, { recursive: true });
    await writeFile(path.join(DIR, 'wsEndpoint'), browser.wsEndpoint());
};
