/* Static site generation global config */
module.exports = {
    componentDirectoryPath: './src/components/',
    frontMatterAttributes: ['title', 'author', 'date'],
    renderConfig: {
        defaultRenderer: 'jsDom',            // [jsDom, puppeteer]
        puppeteer: {
            // Options for debugging
            headless: true,
            devtools: false,
            // Limit concurrent routes
            maxConcurrentRoutes: 16,
            // Delay extraction until content is ready (fired in App.js)
            renderAfterDocumentEvent: 'content-rendered'
            /**
             * High numbers of concurrent routes (e.g.: 64) require setting the default
             * navigation timeout to infinite with 'await page.setDefaultNavigationTimeout(0);'
             * in renderer.js to prevent crashes due to long page loading times (default 30s).
             * [https://ourcodeworld.com/articles/read/1106/how-to-solve-puppeteer-timeouterror-navigation-timeout-of-30000-ms-exceeded]
             * However many concurrent routes yield worse performance!
             *
             * TEST: Normal test pages + 500 test .md-files
             *  4 concurrent routes: time to build: ~ 22s; total time: ~ 4m 55s;
             *  8 concurrent routes: time to build: ~ 22s; total time: ~ 4m 39s;
             * 16 concurrent routes: time to build: ~ 22s; total time: ~ 4m 39s;
             * 32 concurrent routes: time to build: ~ 22s; total time: ~ 4m 59s;
             */
        },
        jsDom: {
            // Limit concurrent routes (unlimited (0) might cause runtime issues)
            maxConcurrentRoutes: 256,
            // Enable asset loading and script execution
            resources: 'usable',
            runScripts: 'dangerously',
            // Delay extraction until content is ready (fired in App.js)
            renderAfterDocumentEvent: 'content-rendered'
            /**
             * TEST: normal test pages + 500 test .md-files
             * 128 concurrent routes: time to build: ~ 34s; total time: 1m 01s;
             * 256 concurrent routes: time to build: ~ 34s; total time: 0m 56s;
             * 512 concurrent routes: failed (hangs)
             */
        }
    },
    assets: {
        folders: ['css', 'img', 'js'],
        rootFiles: ['favicon.ico']
    }
};
