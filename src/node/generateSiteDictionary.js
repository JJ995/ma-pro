
const fs = require('fs');
const fm = require('front-matter');

const findInDir = require('./findInDir');
const generateComponentDictionary = require('./generateComponentDictionary');

// Constants
const CONTENT_DIRECTORY_PATH = './content/';

/**
 * Generate JSON-file with router page data based on content directory
 */
module.exports = async function generateSiteDictionary() {
    console.log('Start site dictionary generation');

    // Trigger component dictionary generation
    generateComponentDictionary();

    let routes = {};                    // Routes object (stores page path and page metadata)

    // Find all .md files in content directory
    let fileList = findInDir(CONTENT_DIRECTORY_PATH, /\.md$/);

    // Get component list
    let components = require("../data/components");

    // Iterate file list
    for (const fullPath of fileList) {
        // Get page name and page path
        let page = fullPath.substring(fullPath.lastIndexOf('\\') + 1, fullPath.length - 3);
        let path = fullPath.substring(fullPath.indexOf('\\') + 1, fullPath.lastIndexOf('\\')).replace(/\\/g, '/');

        // Check if route already exists
        if (!routes[path]) {
            routes[path] = [];
        }

        // Get front-matter page metadata
        await fs.promises.readFile(fullPath, 'utf8').then((data) => {
            let content = fm(data);
            let pageComponents = [];

            // Check for component occurrences
            for (let i = 0; i < components.length; i++) {
                if (data.indexOf('<' + components[i]) !== -1) {
                    pageComponents.push(components[i]);
                }
            }

            // Add page object to route
            routes[path].push({
                "id": page,
                "title": page,
                "description": content.attributes.description,
                "date": content.attributes.date,
                "path": path,
                "components": pageComponents
            });
        }).catch((err) => {
            if (err) throw err;
        });
    }

    // Write sites JSON-file with routes
    let data = JSON.stringify(routes);
    fs.writeFileSync('./src/data/sites.json', data);

    console.log('Site dictionary written');
};
