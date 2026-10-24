const { defineConfig } = require("@playwright/test");

const port = Number(process.env.TEST_PORT || 4180);

module.exports = defineConfig({
    testDir: "./tests",
    fullyParallel: true,
    workers: 2,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 1 : 0,
    reporter: "list",
    use: {
        baseURL: `http://127.0.0.1:${port}`,
        viewport: { width: 1440, height: 1000 },
        reducedMotion: "reduce",
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
    },
    webServer: {
        command: `python3 -m http.server ${port} --bind 127.0.0.1`,
        url: `http://127.0.0.1:${port}`,
        reuseExistingServer: false,
    },
});
