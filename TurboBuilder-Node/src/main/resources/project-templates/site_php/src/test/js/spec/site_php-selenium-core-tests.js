#!/usr/bin/env node

'use strict';


/**
 * All those tests are check that a site_php project type works as expected.
 * Any site_php project that is up to date must pass all of these tests.
 * 
 * No multi browser is necessary as we are only testing url behaviours, so we will use only
 * the chromedriver for these tests. 
 */


const webdriver = require('selenium-webdriver');
const { StringUtils, FilesManager } = require('turbocommons-ts');


let fm = new FilesManager(require('fs'), require('os'), require('path'), process);


describe('site_php-selenium-core-tests', function() {

    beforeAll(function() {
        
        this.siteSetup = JSON.parse(fm.readFile('src/main/turbosite.json'));
        
        this.host = 'localhost';
        
        this.homeURI = '/' + this.siteSetup.locales[0].split('_')[0] + '/' + this.siteSetup.homeView;
        
        this.driver = new webdriver.Builder().forBrowser('chrome').build();
    });

    
    afterAll(function() {

        this.driver.quit(); 
    });

    
    it('should redirect http://host to https://host/locale/homeview/', function(done) {
        
        this.driver.get('http://' + this.host).then(() => {
            
            this.driver.getCurrentUrl().then((url) => {
                expect(url).toBe('https://' + this.host + this.homeURI + '/');
                done();
            });
        });
    });
    
    
    it('should redirect http://www.host to https://host/locale/homeview/', function(done) {
        
        this.driver.get('http://www.' + this.host).then(() => {
            
            this.driver.getCurrentUrl().then((url) => {
                expect(url).toBe('https://' + this.host + this.homeURI + '/');
                done();
            });
        });
    });  

    
    it('should redirect http://host/locale/homeview/ to https://host/locale/homeview/', function(done) {
        
        this.driver.get('http://' + this.host + this.homeURI + '/').then(() => {
            
            this.driver.getCurrentUrl().then((url) => {
                expect(url).toBe('https://' + this.host + this.homeURI + '/');
                done();
            });
        });
    });
    
    
    it('should redirect https://www.host/locale/homeview/ to https://host/locale/homeview/', function(done) {
        
        this.driver.get('https://www.' + this.host + this.homeURI + '/').then(() => {
            
            this.driver.getCurrentUrl().then((url) => {
                expect(url).toBe('https://' + this.host + this.homeURI + '/');
                done();
            });
        });
    });
    
    
    it('should redirect https://www.host/locale/homeview to https://host/locale/homeview/', function(done) {
        
        this.driver.get('https://www.' + this.host + this.homeURI).then(() => {
            
            this.driver.getCurrentUrl().then((url) => {
                expect(url).toBe('https://' + this.host + this.homeURI + '/');
                done();
            });
        });
    });
    
    
    it('should open robots.txt root file', function(done) {
        
        this.driver.get('https://' + this.host + '/robots.txt').then(() => {
            
            this.driver.getPageSource().then((source) => {
                expect(source).toContain('User-agent:');
                done();
            });
        });
    });
    
    
//    it('should open global.css root file', function(done) {
//        
//        this.driver.get('https://' + this.host + '/global.css').then(() => {
//            
//            this.driver.getPageSource().then((source) => {
//                expect(StringUtils.isEmpty(source)).toBe(false);
//                done();
//            });
//        });
//    });
//    
//    
//    it('should open global.js root file', function(done) {
//        
//        this.driver.get('https://' + this.host + '/global.js').then(() => {
//            
//            this.driver.getPageSource().then((source) => {
//                expect(StringUtils.isEmpty(source)).toBe(false);
//                done();
//            });
//        });
//    });
    
    
    it('should show 404 for non existing root file', function(done) {
        
        this.driver.get('https://' + this.host + '/somenonexistingfile.txt').then(() => {
            
            this.driver.getTitle().then((title) => {                
                expect(title.indexOf('404 Not Found') >= 0 || title.indexOf('Error 404') >= 0)
                    .toBe(true);
                done();
            });
        });
    });
    
    
    it('should show 404 for non existing resources file', function(done) {
        
        this.driver.get('https://' + this.host + '/resources/somenonexistingfile.txt').then(() => {
            
            this.driver.getTitle().then((title) => {
                expect(title.indexOf('404 Not Found') >= 0 || title.indexOf('Error 404') >= 0)
                    .toBe(true);
                done();
            });
        });
    });
    
    
    it('should show contents of a resources static file', function(done) {
        
        this.driver.get('https://' + this.host + '/resources/fonts/TODO').then(() => {
            
            this.driver.getPageSource().then((source) => {
                expect(source).toContain('Place project fonts here');
                done();
            });
        });
    });
});


//    https://localhost - Must direct to the home page
//    X https://localhost/resources/.. - Must direct to the resources folder
//    https://localhost/global.css - must show the css global file
//    https://localhost/global.js - must show the jss global file
//    X https://localhost/robots.txt - must show the file
//    X https://localhost/somenonexistingfile.txt - must show 404 error
//    https://localhost/app must redirect to index
//    https://localhost/app/ must redirect to index
//    https://localhost/storage/ must redirect to the storage folder
//    https://localhost/storage must redirect to the storage folder
//    https://localhost/site/index.php must fail with 404
//    https://localhost/site/http/service.php must fail with 404
//    ...
//    
//Test that site works also inside a subfolder of the web server: https://localhost/somefolder/global.js