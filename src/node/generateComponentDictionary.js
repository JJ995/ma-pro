
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
                directChildComponents: [],
                children: []
            };

            // Check for subcomponents
            if (module.default.components !== undefined && Object.keys(module.default.components).length) {
                for (const key of Object.keys(module.default.components)) {
                    componentObject.directChildComponents.push(module.default.components[key].name);
                }
            }

            components.push(componentObject);
        }).catch((err) => {
            if (err) throw err;
        });
    }

    // Get all children of each component
    components.forEach((component) => {
        getChildren(component);

    });

    // Remove duplicates
    components.forEach((component) => {
        component.children = [...new Set(component.children)];
    });

    // Recursively iterate component dictionary to retrieve all dependencies of each component
    function getChildren(component) {
        if (component.directChildComponents !== undefined && component.directChildComponents.length !== 0) {
            component.directChildComponents.forEach((childComponent) => {
                for (let i = 0; i < components.length; i++) {
                    if (components[i].name === childComponent) {
                        return component.children = component.children.concat(getChildren(components[i]));
                    }
                }
            });
            return component.children.concat([component.name]);
        } else {
            return [component.name];
        }
    }

    // Write components JSON-file with routes
    fs.writeFileSync('./src/data/components.json', JSON.stringify(components));

    console.log('Component dictionary written');
}
