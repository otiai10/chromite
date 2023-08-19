import { Config } from "@jest/types";

const config: typeof Config = {
    testMatch: ["**/tests/spec/*.spec.ts"],
    preset: "ts-jest",
    setupFiles: ["./tests/spec/setup.ts"],
    collectCoverageFrom: [
        "./src/*.ts",
    ],
};

export default config;
