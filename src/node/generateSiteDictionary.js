
import fs  from 'fs';
import fm from 'front-matter';
import directoryTree from 'directory-tree';

import findInDir from './findInDir.js';
import generateComponentDictionary from './generateComponentDictionary.js';

import config from '../../ssg.config.js';

// CONFIG
const CONTENT_DIRECTORY_PATH = './content/';

/**
 * Generate JSON-file with router page data based on content directory
 */
export default async function () {
    console.log('Start site dictionary generation');

    // Trigger component dictionary generation
    await generateComponentDictionary();

    let routes = {};                    // Routes object (stores page path and page metadata)

    // Find all .md files in content directory
    let fileList = findInDir(CONTENT_DIRECTORY_PATH, /\.md$/);

    // Get directory tree
    const tree = directoryTree(CONTENT_DIRECTORY_PATH, { extensions: /\.md$/ });

    // Get component list
    let componentsJson = fs.readFileSync('./src/data/components.json', 'utf8');
    let components = JSON.parse(componentsJson);

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
            if (content.attributes.components !== undefined && content.attributes.components !== 0) {
                for (let i = 0; i < components.length; i++) {
                    for (let j = 0; j < content.attributes.components.length; j++) {
                        if (components[i].name === content.attributes.components[j]) {
                            pageComponents.push(components[i]);
                        }
                    }
                }
            }

            // Add custom page attributes
            let customAttributes = {};
            if (config.frontMatterAttributes !== undefined && config.frontMatterAttributes.length !== 0) {
                config.frontMatterAttributes.forEach(attribute => {
                    customAttributes[attribute] = content.attributes[attribute];
                });
            }

            // Create page object with custom attributes
            let pageObject = {
                'id': page,
                'path': path,
                'components': pageComponents,
                ...customAttributes
            };

            // Add page object to route
            routes[path].push(pageObject);
        }).catch((err) => {
            if (err) throw err;
        });
    }

    // Write sites JSON-file with routes
    fs.writeFileSync('./src/data/sites.json', JSON.stringify(routes));

    // Write tree JSON-file
    fs.writeFileSync('./src/data/siteTree.json', JSON.stringify(tree));

    console.log('Site dictionary written');
};
