import { Config } from "@jest/types";

const config: typeof Config = {
    testMatch: ["./**/*.spec.ts"],
    preset: "ts-jest",
    setupFiles: ["./setup.ts"],
};

export default config;
