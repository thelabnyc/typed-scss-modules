import type { Config } from 'jest'
import { createDefaultEsmPreset } from "ts-jest";

const config: Config = {
  ...createDefaultEsmPreset(),
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  clearMocks: true,
  testMatch: ["**/__tests__/**/*.test.ts"],
  testPathIgnorePatterns: [
    "<rootDir>/dist/",
    "<rootDir>/node_modules/",
    "(.*).d.ts",
  ],
}

export default config
