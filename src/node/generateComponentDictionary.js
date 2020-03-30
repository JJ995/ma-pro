
import fs from 'fs';
import findInDir from './findInDir.js';

import config from '../../ssg.config.js';

/**
 * Generate JSON-file with component data based on component directory
 */
export default async function () {
    console.log('Start component dictionary generation');

    let components = [];        // Components array (stores list of available Vue components and their children)

    // Find all .vue files in component directory
    let fileList = findInDir(config.componentDirectoryPath, /\.vue$/);

    // Iterate file list
    for (const fullPath of fileList) {
        // Get component path without file extensions
        let componentPath = fullPath.substring(0, fullPath.length - 4);

        // Import component script file
        await import('../../' + componentPath + '.mjs')
        .then((module) => {
            let componentObject = {
                name: module.default.name,
                path: componentPath,
                childComponents: []
            };

            // Check for subcomponents
            if (module.default.components !== undefined && Object.keys(module.default.components).length) {
                for (const key of Object.keys(module.default.components)) {
                    componentObject.childComponents.push(module.default.components[key].name);
                }
            }

            components.push(componentObject);
        }).catch((err) => {
            if (err) throw err;
        });
    }

    // Write components JSON-file with routes
    let data = JSON.stringify(components);
    fs.writeFileSync('./src/data/components.json', data);

    console.log('Component dictionary written');
}
