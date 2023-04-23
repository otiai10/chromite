import type {Config} from "jest";

const config: Config = {
    globalSetup: "./setup.js",
    globalTeardown: "./teardown.js",
    testEnvironment: "./puppeteer_environment.js",
    testMatch: ["./**/*.spec.ts"],
};

export default config;
