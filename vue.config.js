/*
 * https://stackoverflow.com/questions/58325548/how-to-execute-my-own-script-after-every-webpacks-auto-build-in-watch-mode-of-v
 */


const Mode = require('frontmatter-markdown-loader/mode');
//const fs = require("fs");

const plugins = [];
const isDev = process.env.NODE_ENV === 'development';

const beforeRunHook = function(callback) {
    this.apply = function(compiler) {
        if (compiler.hooks && compiler.hooks.watchRun) {
            compiler.hooks.watchRun.tap('webpack-arbitrary-code', callback);
        }
    };
};

const generateManifest = function() {
    console.log('Implementing alien intelligence and more HELLO HELLO HELLO HELLO HELLO HELLO HELLO HELLO HELLO HELLO HELLO HELLO VHELLO HELLO HELLO');
    /*fs.readdir("../content/stories", files => {
        console.log(files);
        files.foreach(file => {
            fs.readFile(`../content/stories/${file}`, data => {
                console.log('HI DATA FOLLOWING');
                console.log(data);
            });
        });
    });*/
};

if (isDev) {
    plugins.push(new beforeRunHook(generateManifest));
}

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
        plugins
    }
};
