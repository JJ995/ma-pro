
const fs = require('fs');
const findInDir = require('./findInDir');

// Constants
const COMPONENT_DIRECTORY_PATH = './src/components/';

/**
 * Check for component imports in Vue-files? Mark them as child components in dictionary?
 */

/**
 * Generate JSON-file with router page data based on content directory
 */
module.exports = function generateComponentDictionary() {
    console.log('Start component dictionary generation');

    let components = [];        // Components array (stores list of available Vue components)

    // Find all .vue files in component directory
    let fileList = findInDir(COMPONENT_DIRECTORY_PATH, /\.vue$/);

    // Iterate file list
    for (const fullPath of fileList) {
        // Get component name
        let component = fullPath.substring(fullPath.lastIndexOf('\\') + 1, fullPath.length - 4);
        components.push(component);
    }

    // Write components JSON-file with routes
    let data = JSON.stringify(components);
    fs.writeFileSync('./src/data/components.json', data);

    console.log('Component dictionary written');
};
