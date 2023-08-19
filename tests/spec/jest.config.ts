import { Config } from "@jest/types";

const config: typeof Config = {
    rootDir: "../../",
    testMatch: ["<rootDir>/tests/spec/*.spec.ts"],
    preset: "ts-jest",
    setupFiles: ["<rootDir>/tests/spec/setup.ts"],
    collectCoverageFrom: [
        "<rootDir>/src/*.ts",
    ],
};

export default config;
