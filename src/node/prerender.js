
import fs  from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import PreRenderer from '@prerenderer/prerenderer';
import PuppeteerRenderer from '@prerenderer/renderer-puppeteer';

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

    const preRenderer = new PreRenderer({
        // Required - the path to the app to pre-render - should have an index.html and any other needed assets
        staticDir: path.join(__dirname, 'dist'),
        indexPath: path.join(__dirname, 'dist/index.html'),
        // The plugin that actually renders the page
        renderer: new PuppeteerRenderer({
            // Options for debugging
            headless: true,
            devtools: false,
            maxConcurrentRoutes: 16
        })
    });

    // Initialize is separate from the constructor for flexibility of integration with build systems
    preRenderer.initialize()
    .then(() => {
        switch (args[0]) {
            case 'incremental':
                console.log('Executing incremental build');

                // Get list of changed routes to pre-render
                routes = JSON.parse(fs.readFileSync('./src/data/changedRoutes.json', 'utf8'));

                break;
            case 'full':
                console.log('Executing full build');

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
                console.log('Build type not specified - execute: npm run generate [full, incremental]');
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

        // Print list of rendered routes
        console.log('Rendered routes:');
        for (let i = 0; i < routes.length; i++) {
            console.log(routes[i]);
        }

        // Clear list of changed routes
        fs.writeFileSync('./src/data/changedRoutes.json', JSON.stringify([]));

        console.log('Finished static site generation');
    })
    .catch(err => {
        // Shut down server and renderer
        preRenderer.destroy();
        console.error(err);
    });
};
