/*
 * Hooks: https://stackoverflow.com/questions/58325548/how-to-execute-my-own-script-after-every-webpacks-auto-build-in-watch-mode-of-v
 * Get list of changed files: https://stackoverflow.com/questions/43140501/can-webpack-report-which-file-triggered-a-compilation-in-watch-mode
 */

// Includes
const Mode = require('frontmatter-markdown-loader/mode');
const path = require('path');

// Import custom modules
const generateManifest = require('./src/node/generateManifest');

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
// Add hook
plugins.push(new beforeRunHook(generateManifest));

/**
 * Print list of changed files since last build to console
 */
class WatchRunPlugin {
    apply(compiler) {
        compiler.hooks.watchRun.tap('WatchRun', (comp) => {
            const changedTimes = comp.watchFileSystem.watcher.mtimes;
            const changedFiles = Object.keys(changedTimes)
            .map(file => `\n  ${file}`)
            .join('');
            if (changedFiles.length) {
                console.log("====================================");
                console.log('NEW BUILD FILES CHANGED:', changedFiles);
                console.log("====================================");
            }
        });
    }
}
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
                // Ignore
                ignored: [
                    path.resolve(__dirname, 'src/data/manifest.json')
                ]
            }
        },
    }
};
