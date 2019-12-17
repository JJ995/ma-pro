/*
 * Recursive file tree reader with regex file-type filter: https://gist.github.com/kethinov/6658166
 */

import fs from 'fs';
import path from 'path';

/**
 * Parse given directory tree and return paths for given file-type
 * @param dir
 * @param filter
 * @param fileList
 * @returns {Array}
 */
export default function findInDir (dir, filter, fileList = []) {
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
