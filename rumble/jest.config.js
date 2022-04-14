/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  coveragePathIgnorePatterns: ["<rootDir>/build/", "<rootDir>/tests/", "<rootDir>/node_modules/"],
  preset: 'ts-jest',
  testEnvironment: 'node'
};