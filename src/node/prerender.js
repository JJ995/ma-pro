
import fs  from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import PreRenderer from '@prerenderer/prerenderer';
import PuppeteerRenderer from '@prerenderer/renderer-puppeteer';

/**
 *
 */
export default function () {
    console.log('Start static site generation');

    const __dirname = path.resolve();

    const preRenderer = new PreRenderer({
        // Required - The path to the app to pre-render. Should have an index.html and any other needed assets.
        staticDir: path.join(__dirname, 'dist'),
        indexPath: path.join(__dirname, 'dist/index.html'),
        // The plugin that actually renders the page.
        renderer: new PuppeteerRenderer({
            headless: false,
            devtools: true
        })
    });

    // Initialize is separate from the constructor for flexibility of integration with build systems.
    preRenderer.initialize()
    .then(() => {
        // List of routes to render.
        return preRenderer.renderRoutes([ '/', '/stories/test1' ])
    })
    .then(renderedRoutes => {
        // renderedRoutes is an array of objects in the format:
        // {
        //   route: String (The route rendered)
        //   html: String (The resulting HTML)
        // }
        renderedRoutes.forEach(renderedRoute => {
            try {
                // A smarter implementation would be required, but this does okay for an example.
                // Don't copy this directly!!!
                const outputDir = path.join(__dirname, 'rendered', renderedRoute.route);
                const outputFile = `${outputDir}/index.html`;

                mkdirp.sync(outputDir);
                fs.writeFileSync(outputFile, renderedRoute.html.trim())
            } catch (e) {
                // Handle errors.
            }
        });

        // Shut down the file server and renderer.
        preRenderer.destroy()
    })
    .catch(err => {
        // Shut down the server and renderer.
        preRenderer.destroy()
        // Handle errors.
    });

    console.log('Finished static site generation');
};
