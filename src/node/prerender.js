
import fs  from 'fs';
import fse  from 'fs-extra';
import path from 'path';
import mkdirp from 'mkdirp';
import PreRenderer from '../node/vendor/prerenderer/prerenderer/es6/index.js';
import PuppeteerRenderer from '../node/vendor/prerenderer/renderer-puppeteer/es6/renderer.js';
import JsDomRenderer from '../node/vendor/prerenderer/renderer-jsdom/es6/renderer.js';

import config from '../../ssg.config.js';

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
    const puppeteer = new PuppeteerRenderer(config.renderConfig.puppeteer);
    // JsDom
    const jsDom = new JsDomRenderer(config.renderConfig.jsDom);

    // Set default renderer based on config if not specified
    let switchDefaultRenderer = function () {
        if (config.renderConfig.defaultRenderer !== undefined) {
            if (config.renderConfig.defaultRenderer === 'fast') {
                console.log('Using fast JsDom renderer as default');
            } else if (config.renderConfig.defaultRenderer === 'production') {
                console.log('Using production puppeteer renderer as default');
                renderer = puppeteer;
            }
        }
    };

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
                switchDefaultRenderer();
        }
    } else {
        console.log('Renderer not specified - execute: npm run generate [full, incremental] [fast, production]');
        switchDefaultRenderer();
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
        console.log('\nStart asset copy');
        // Copy asset folders
        config.assets.folders.forEach(assetFolder => {
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
        config.assets.rootFiles.forEach(assetFile => {
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
