import type {Config} from "jest";

const config: Config = {
    verbose: true,
    globalSetup: "./tests/setup.js",
    globalTeardown: "./tests/teardown.js",
    testEnvironment: "./tests/puppeteer_environment.js",
    testMatch: [
        "**/tests/spec/**/*.spec.ts",
        "**/tests/e2e/**/*.spec.ts",
    ],
};

export default config;
