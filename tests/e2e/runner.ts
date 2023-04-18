// This is a runner script for e2e tests.
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
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://example.com");
    await page.screenshot({ path: "./tests/e2e/output/example.png" });
    await browser.close();
})();