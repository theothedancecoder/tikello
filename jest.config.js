const path = require("path");

module.exports = {
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": ["babel-jest", { configFile: "./babel.config.test.js" }],
  },
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  moduleDirectories: ["node_modules", path.join(__dirname, "convex")],
  testMatch: [
    "**/__tests__/**/*.(ts|tsx|js|jsx)",
    "**/*.(test|spec).(ts|tsx|js|jsx)"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/babel.config.test.js"
  ],
};
