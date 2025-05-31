module.exports = {
  preset: 'react-scripts',
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    "node_modules/(?!(axios|react-router|@remix-run)/)"
  ],
  moduleNameMapper: {
    '^axios$': '<rootDir>/node_modules/axios/dist/axios.js'
  }
};