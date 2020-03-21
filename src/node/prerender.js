
import fs  from 'fs';
import fse  from 'fs-extra';
import path from 'path';
import mkdirp from 'mkdirp';
import PreRenderer from '@prerenderer/prerenderer';
import PuppeteerRenderer from '@prerenderer/renderer-puppeteer';
import JsDomRenderer from '@prerenderer/renderer-jsdom';

/**
 * Static site generation based on list of changed routes
 */
export default function () {
    console.log('Start static site generation');

    // Get command line arguments
    let args = process.argv.slice(1);

    // Get directory name
    const __dirname = path.resolve();

    // List of routes to render
    let routes = [];

    /* Instantiate renderers */

    // Puppeteer
    const puppeteer = new PuppeteerRenderer({
        // Options for debugging
        headless: true,
        devtools: false,
        // Limit concurrent routes
        maxConcurrentRoutes: 16
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
    });
    // JsDom
    const jsDom = new JsDomRenderer({
        // Limit concurrent routes (unlimited (0) might cause runtime issues)
        maxConcurrentRoutes: 256,
        // Enable asset loading and script execution
        resources: "usable",
        runScripts: "dangerously",
        // Delay rendering until app is running
        renderAfterTime: 10000
        /**
         * TEST: normal test pages + 500 test .md-files
         * 128 concurrent routes: time to build: ~ 34s; total time: 1m 01s;
         * 256 concurrent routes: time to build: ~ 34s; total time: 0m 56s;
         * 512 concurrent routes: failed (hangs)
         */
    });

    // Set renderer to use
    let renderer = jsDom;
    if (args[1] !== undefined) {
        switch (args[1]) {
            case 'fast':
                renderer = jsDom;
                console.log('Using fast JsDom renderer');
                break;
            case 'production':
                renderer = puppeteer;
                console.log('Using production puppeteer renderer');
                break;
            default:
                console.log('Unknown renderer argument - execute: npm run generate [full, incremental] [fast, production]');
                console.log('Using fast JsDom renderer as default');
        }
    } else {
        console.log('Renderer not specified - execute: npm run generate [full, incremental] [fast, production]');
        console.log('Using fast JsDom renderer as default');
    }

    const preRenderer = new PreRenderer({
        // Required - the path to the app to pre-render - should have an index.html and any other needed assets
        staticDir: path.join(__dirname, 'dist'),
        indexPath: path.join(__dirname, 'dist/index.html'),
        // The plugin that actually renders the page
        renderer: renderer
    });

    // Initialize is separate from the constructor for flexibility of integration with build systems
    preRenderer.initialize()
    .then(() => {
        switch (args[0]) {
            case 'incremental':
                console.log('Executing incremental build\n');

                // Get list of changed routes to pre-render
                routes = JSON.parse(fs.readFileSync('./src/data/changedRoutes.json', 'utf8'));

                break;
            case 'full':
                console.log('Executing full build\n');

                // Clear output directory on full build for clean state
                console.log('Clearing output directory');
                fse.emptyDirSync('./generated_static/');

                // All possible routes
                let allRoutes = [];
                // Get list of all possible routes to pre-render
                const sites = JSON.parse(fs.readFileSync('./src/data/sites.json', 'utf8'));

                // Create list of all routes
                Object.keys(sites).map(sitePath => {
                    sites[sitePath].map(site => {
                        allRoutes.push('/' + sitePath + '/' + site.id);
                    });
                });
                routes = allRoutes;

                break;
            default:
                console.log('Build type not specified - execute: npm run generate [full, incremental] [fast, production]');
        }

        // Add index route to generation
        routes.push('/');

        // List of routes to render
        return preRenderer.renderRoutes(routes);
    })
    .then(renderedRoutes => {
        // renderedRoutes is an array of objects in the format:
        // {
        //   route: String (The route rendered)
        //   html: String (The resulting HTML)
        // }
        renderedRoutes.forEach(renderedRoute => {
            try {
                // Generate static files
                const outputDir = path.join(__dirname, 'generated_static', renderedRoute.route);
                const outputFile = `${outputDir}/index.html`;

                mkdirp.sync(outputDir);
                fs.writeFileSync(outputFile, renderedRoute.html.trim());
            } catch (e) {
                console.error(e);
            }
        });

        // Shut down server and renderer
        preRenderer.destroy();

        // Clear list of changed routes
        fs.writeFileSync('./src/data/changedRoutes.json', JSON.stringify([]));

        console.log('Finished static site generation');

        /* Copy assets */

        // Read list of assets
        const assets = JSON.parse(fs.readFileSync('./src/assets.json', 'utf8'));
        console.log('\nStart asset copy');
        // Copy asset folders
        assets.folders.forEach(assetFolder => {
            // Clear asset folder
            fse.emptyDir('./generated_static/' + assetFolder)
            .then(() => {
                // Copy assets
                fse.copy('./dist/' + assetFolder, './generated_static/' + assetFolder, function (err) {
                    if (err) {
                        console.log('Error while copying ' + assetFolder + ' folder');
                        return console.error(err);
                    }
                    console.log('Copied ' + assetFolder + ' folder');
                });
            })
            .catch(err => {
                console.error(err);
            });
        });
        // Copy asset files
        assets.rootFiles.forEach(assetFile => {
            fs.copyFile('./dist/' + assetFile, './generated_static/' + assetFile, (err) => {
                if (err) throw err;
                console.log('Copied ' + assetFile);
            });
        });
    })
    .catch(err => {
        console.error(err);
        // Shut down server and renderer
        preRenderer.destroy();
    });
};
