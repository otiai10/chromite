import type { Config } from "jest";

const config: Config = {
    testMatch: ["./**/*.spec.ts"],
    preset: "ts-jest",
    globals: { // TODO: mock chrome
        chrome: {},
    },
};

export default config;
