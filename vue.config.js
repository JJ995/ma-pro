/*
 * Hooks: https://stackoverflow.com/questions/58325548/how-to-execute-my-own-script-after-every-webpacks-auto-build-in-watch-mode-of-v
 * Get list of changed files: https://stackoverflow.com/questions/43140501/can-webpack-report-which-file-triggered-a-compilation-in-watch-mode
 * Merge arrays and remove duplicates (ES6): https://stackoverflow.com/a/48130841
 */

/* Includes */
const Mode = require('frontmatter-markdown-loader/mode');
const exec = require('child_process').exec;
const fs = require('fs');

const plugins = [];

/**
 * Initialize before run hook
 * @param callback
 */
const beforeRunHook = function (callback) {
    this.apply = function (compiler) {
        if (compiler.hooks && compiler.hooks.watchRun) {
            compiler.hooks.watchRun.tap('webpack-arbitrary-code', callback);
        }
    };
};

/**
 * Refresh trigger function - updates site and component dictionary
 */
const refresh = function () {
    exec('npm run refresh', (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
};

// Add hook for dictionary update
plugins.push(new beforeRunHook(refresh));

/**
 * Track file changes for content files (routes), components and views
 */
class WatchRunPlugin {
    apply(compiler) {
        compiler.hooks.watchRun.tap('WatchRun', (comp) => {
            // CONFIG
            const CONTENT_PATH = '\\content\\';
            const COMPONENT_PATH = '\\src\\components\\';
            const VIEW_PATH = '\\src\\views\\';

            const CHANGED_ROUTES_PATH = './src/data/changedRoutes.json';
            const SITES_PATH = './src/data/sites.json';

            // Get list of changed files
            const changedTimes = comp.watchFileSystem.watcher.mtimes;
            const changedFiles = Object.keys(changedTimes);
            if (changedFiles.length) {
                // List of routes to regenerate
                let changedRoutes = [];

                changedFiles.forEach((file) => {
                    // Extract relative file path
                    const relativePath = file.replace(__dirname, '');

                    /* Check file type */
                    if (relativePath.startsWith(CONTENT_PATH)) {                                // Route
                        // Extract route
                        let route = relativePath.replace(CONTENT_PATH, '');
                        // Strip file extension, replace backslash with forward slash
                        route = route.substring(0, route.length - 3).replace(/\\/g,'/');
                        // Add route to list of changed routes
                        changedRoutes.push('/' + route);
                    } else if (relativePath.startsWith(COMPONENT_PATH)) {                       // Component
                        // Get component name (containing folder *must* be named accordingly)
                        const componentPathElements = relativePath.split('\\');
                        const componentName = componentPathElements[componentPathElements.length - 2];

                        try {
                            // Get sites dictionary
                            const sites = JSON.parse(fs.readFileSync(SITES_PATH, 'utf8'));
                            // Check if changed component is included on site
                            Object.keys(sites).map(sitePath => {
                                sites[sitePath].map(site => {
                                    if (site.components.length !== 0) {
                                        site.components.forEach((component) => {
                                            if (component.name === componentName) {
                                                // Add route to list of changed routes
                                                changedRoutes.push('/' + site.path + '/' + site.id);
                                            }
                                            // Check child components
                                            if (component.childComponents !== undefined) {
                                                if (component.childComponents.includes(componentName)) {
                                                    // Add route to list of changed routes
                                                    changedRoutes.push('/' + sitePath + '/' + site.id);
                                                }
                                            }
                                        });
                                    }
                                });
                            });
                        } catch (err) { console.error(err); }
                    } else if (relativePath.startsWith(VIEW_PATH)) {                            // View
                        // Regenerate everything if a view changes
                        console.log('View changed: all routes marked to be regenerated');

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
                        changedRoutes = allRoutes;
                    }
                });

                // Write log file
                writeChangeLog(CHANGED_ROUTES_PATH, changedRoutes);
            }
        });
    }
}

/**
 * Write change log file - create a new file or append to existing file without duplicates
 * @param path
 * @param changes
 */
const writeChangeLog = function (path, changes) {
    try {
        // Check if change log already exists
        if (fs.existsSync(path)) {
            // Open existing change log
            const prevChanges = JSON.parse(fs.readFileSync(path, 'utf8'));
            // Merge existing list with list of new changes and remove duplicates
            const data = Array.from(new Set(prevChanges.concat(changes)));
            // Write route change log
            fs.writeFileSync(path, JSON.stringify(data));
        } else {
            // Create new change log and write data
            fs.writeFileSync(path, JSON.stringify(changes));
        }
    } catch (err) {
        console.error(err);
    }
};

// Add watcher plugin
plugins.push(new WatchRunPlugin());

module.exports = {
    chainWebpack: config => {
        config.module
        .rule('markdown')
        .test(/\.md$/)
        .use('frontmatter-markdown-loader')
        .loader('frontmatter-markdown-loader')
        .tap(options => {
            return {
                mode: [Mode.VUE_COMPONENT],
                // CONFIG
                vue: {
                    root: 'markdown-body'
                }
            }
        })
    },
    configureWebpack: {
        plugins,
        devServer: {
            watchOptions: {
                // CONFIG ignore list
                ignored: [
                    __dirname + '\\src\\data\\changedRoutes.json',
                    __dirname + '\\src\\data\\components.json',
                    __dirname + '\\src\\data\\sites.json',
                    __dirname + '\\.idea\\',
                    __dirname + '\\vue.config.js',
                ]
            }
        },
        externals: {
            puppeteer: 'require("puppeteer")',
        },
    }
};
