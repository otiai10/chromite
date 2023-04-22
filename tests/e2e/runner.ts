// https://pptr.dev/guides/chrome-extensions/
// https://tweak-extension.com/blog/complete-guide-test-chrome-extension-puppeteer
import * as puppeteer from "puppeteer";
import { mkdir } from "fs/promises";
import { join } from "path";

async function setup() {
    await createDirectoryIfNotExists();
}

async function createDirectoryIfNotExists() {
    const dir = join(__dirname, "output");
    await mkdir(dir, { recursive: true });
}

(async () => {
    await setup();
    const extention = join(__dirname, "app");
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            `--disable-extensions-except=${extention}`,
            `---load-extension=${extention}`,
        ]
    });
    const page = await browser.newPage();
    await page.goto("https://example.com");
    const bg = await browser.waitForTarget(t => t.type() === "service_worker");
    const worker = await bg.worker();
    console.log("worker", worker);
    await page.screenshot({ path: "./tests/e2e/output/example.png" });
    const res = await worker.evaluate("(() => globalThis.log)()")
    console.log('res', res);
    await browser.close();
})();