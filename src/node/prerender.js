
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

    const __dirname = path.resolve();

    const preRenderer = new PreRenderer({
        // Required - the path to the app to pre-render - should have an index.html and any other needed assets
        staticDir: path.join(__dirname, 'dist'),
        indexPath: path.join(__dirname, 'dist/index.html'),
        // The plugin that actually renders the page
        renderer: new PuppeteerRenderer({
            // Options for debugging
            headless: false,
            devtools: true
        })
    });

    // Initialize is separate from the constructor for flexibility of integration with build systems
    preRenderer.initialize()
    .then(() => {
        // Get list of changed routes to pre-render
        const changedRoutes = JSON.parse(fs.readFileSync('./src/data/changedRoutes.json', 'utf8'));

        // Add index route to generation
        changedRoutes.push('/');

        // List of routes to render
        return preRenderer.renderRoutes(changedRoutes);
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
    })
    .catch(err => {
        // Shut down server and renderer
        preRenderer.destroy();
        console.error(err);
    });

    console.log('Finished static site generation');
};
