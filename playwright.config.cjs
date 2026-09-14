const { defineConfig, devices } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  timeout: 90000,
  expect: {timeout: 8000},
  fullyParallel: false,
  workers: 2,
  retries: 0,
  reporter: [['list'], ['html', {open:'never'}], ['json', {outputFile:'test-results/results.json'}]],
  use: {baseURL:'http://127.0.0.1:4173/Onex-landingPage/', trace:'retain-on-failure', screenshot:'only-on-failure'},
  projects: [
    {name:'chromium',use:{...devices['Desktop Chrome']}},
    {name:'firefox',use:{...devices['Desktop Firefox']}},
    {name:'webkit',use:{...devices['Desktop Safari']}},
    {name:'mobile-chrome',use:{...devices['Pixel 7']}},
    {name:'mobile-webkit',use:{...devices['iPhone 13']}}
  ],
  webServer:{command:'node scripts/serve.cjs',url:'http://127.0.0.1:4173/Onex-landingPage/',reuseExistingServer:false,env:{SITE_DIR:'dist'}}
});
