/*
 * Hooks: https://stackoverflow.com/questions/58325548/how-to-execute-my-own-script-after-every-webpacks-auto-build-in-watch-mode-of-v
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
const beforeRunHook = function(callback) {
    this.apply = function(compiler) {
        if (compiler.hooks && compiler.hooks.watchRun) {
            compiler.hooks.watchRun.tap('webpack-arbitrary-code', callback);
        }
    };
};
// Add hook
plugins.push(new beforeRunHook(generateManifest));

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
