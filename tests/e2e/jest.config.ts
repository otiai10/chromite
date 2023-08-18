const config = {
    globalSetup: "./setup.js",
    globalTeardown: "./teardown.js",
    testEnvironment: "./puppeteer_environment.js",
    testMatch: ["./**/*.spec.ts"],
};

export default config;
