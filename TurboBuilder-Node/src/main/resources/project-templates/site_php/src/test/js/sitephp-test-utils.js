'use strict';


/**
 * Methods that help with performing the tests
 */

try {
    
    // Test that node_modules is installed by checking one of the custom modules (turbocommons)
    require.resolve("turbocommons-ts");
    
} catch(e) {
    
    console.log('\x1b[31m%s\x1b[0m', "Error: turbocommons-ts module not found. Did you run npm ci or npm install?");
    process.exit(1);
}

const path = require('path');
const { StringUtils } = require('turbocommons-ts');
const { FilesManager } = require('turbodepot-node');
const { TurboSiteTestsManager } = require('turbotesting-node');

const fm = new FilesManager();
const tsm = new TurboSiteTestsManager('./');


/**
 * Obtain an object containing all the wildcards that are used by the tests urls and their
 * replacement values
 * @deprecated
 */
exports.generateWildcards = function () {
    
    let turboBuilderSetup = JSON.parse(fm.readFile('turbobuilder.json'));
   
    // TODO - Projectname fails here if we are testing a release compiled version
    let projectName = (turboBuilderSetup.metadata.name === '') ?
        StringUtils.getPathElement(path.resolve('./')) :
        turboBuilderSetup.metadata.name;
    
    let siteSetup = tsm.getSetupFromIndexPhp('turbosite', 'target/' + projectName + '/dist/site/index.php');

    return {
        "$host": turboBuilderSetup.sync.remoteUrl.split('://')[1],
        "$locale": siteSetup.locales[0].split('_')[0],
        "$homeView": siteSetup.homeView,
        "$cacheHash": siteSetup.cacheHash,
        "$baseURL": siteSetup.baseURL === '' ? '' : '/' + siteSetup.baseURL
    };
}