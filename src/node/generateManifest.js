/*
 * Recursive file tree reader with regex file-type filter: https://gist.github.com/kethinov/6658166
 */

const fs = require('fs');
const path = require('path');

// Constants
const CONTENT_DIRECTORY_PATH = './content/';

/**
 * Generate JSON-file with router page data based on content directory
 */
module.exports = function generateManifest() {
    console.log('Start manifest generation');

    let routes = {};                    // Routes object (stores page path and page metadata)

    // Find all .md files in content directory
    let fileList = findInDir(CONTENT_DIRECTORY_PATH, /\.md$/);

    // Iterate file list
    fileList.forEach((fullPath) => {
        // Get page name and page path
        let page = fullPath.substring(fullPath.lastIndexOf('\\') + 1, fullPath.length - 3);
        let path = fullPath.substring(fullPath.indexOf('\\') + 1, fullPath.lastIndexOf('\\')).replace(/\\/g, '/');

        // Check if route already exists
        if (!routes[path]) {
            routes[path] = [];
        }

        // Add page object to route
        routes[path].push({
            "id": page,
            "title": page,
            "path": path
        });
    });

    // Write manifest JSON-file with routes
    let data = JSON.stringify(routes);
    fs.writeFileSync('./src/data/manifest.json', data);

    console.log('Manifest written');
};

/**
 * Parse given directory tree and return paths for given file-type
 * @param dir
 * @param filter
 * @param fileList
 * @returns {Array}
 */
function findInDir (dir, filter, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const fileStat = fs.lstatSync(filePath);

        if (fileStat.isDirectory()) {
            findInDir(filePath, filter, fileList);
        } else if (filter.test(filePath)) {
            fileList.push(filePath);
        }
    });

    return fileList;
}
