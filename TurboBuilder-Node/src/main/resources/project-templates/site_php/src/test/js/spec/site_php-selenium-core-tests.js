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
        
        this.originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;
        
        // TODO - this is not a solution cause we won't be able to access it in a remote location!
        this.siteSetup = JSON.parse(fm.readFile('C:/turbosite-webserver-symlink/site/turbosite.json'));
        //this.siteSetup = JSON.parse(fm.readFile('src/main/turbosite.json'));
        
        this.host = 'localhost';
        
        this.defaultLocale = this.siteSetup.locales[0].split('_')[0];
        
        this.driver = new webdriver.Builder().forBrowser('chrome').build();
    });

    
    afterAll(function() {

        jasmine.DEFAULT_TIMEOUT_INTERVAL = this.originalTimeout;
        
        this.driver.quit(); 
    });
    
    
    it('should show 404 errors as defined in expected-404-errors.json', function(done) {
        
        let list = JSON.parse(fm.readFile('src/test/js/resources/site_php-selenium-core-tests/expected-404-errors.json'));
        
        // Load all the urls on the json file and perform a request for each one.
        let recursiveCaller = (urls, done) => {
            
            if(urls.length <= 0){
                
                done();
            }
            
            let url = StringUtils.replace(urls.pop(), '$host', this.host);
            
            this.driver.get(url).then(() => {
                
                this.driver.getTitle().then((title) => {
                    
                    expect(title.indexOf('404 Not Found') >= 0 || title.indexOf('Error 404 page') >= 0)
                        .toBe(true, url + ' should throw 404 error');
                    
                    recursiveCaller(urls, done);
                });
            });
        }
        
        recursiveCaller(list, done);
    });
    
    
    it('should redirect urls with 301 as defined in expected-301-redirects.json', function(done) {
        
        let list = JSON.parse(fm.readFile('src/test/js/resources/site_php-selenium-core-tests/expected-301-redirects.json'));
        
        // Load all the urls on the json file and perform a request for each one.
        let recursiveCaller = (urls, done) => {
            
            if(urls.length <= 0){
                
                done();
            }
            
            let entry = urls.pop();
            entry.url = StringUtils.replace(entry.url,
                    ['$host', '$locale', '$homeView'],
                    [this.host, this.defaultLocale, this.siteSetup.homeView]);
            
            entry.to = StringUtils.replace(entry.to,
                    ['$host', '$locale', '$homeView'],
                    [this.host, this.defaultLocale, this.siteSetup.homeView]);
            
            this.driver.get(entry.url).then(() => {
                      
                this.driver.getCurrentUrl().then((url) => {
                    
                    expect(url).toBe(entry.to, 'Coming from url: ' + entry.url);
                    
                    recursiveCaller(urls, done);
                });
            });
        }
        
        recursiveCaller(list, done);
    });

    
    it('should show 200 ok result with urls defined in expected-200-ok.json', function(done) {
        
        let list = JSON.parse(fm.readFile('src/test/js/resources/site_php-selenium-core-tests/expected-200-ok.json'));
        
        // Load all the urls on the json file and perform a request for each one.
        let recursiveCaller = (urls, done) => {
            
            if(urls.length <= 0){
                
                done();
            }
            
            let entry = urls.pop();
            entry.url = StringUtils.replace(entry.url,
                    ['$host', '$cacheHash'],
                    [this.host, this.siteSetup.cacheHash]);
            
            this.driver.get(entry.url).then(() => {
                
                this.driver.getTitle().then((title) => {
                
                    expect(title.indexOf('404 Not Found') >= 0 || title.indexOf('Error 404 page') >= 0)
                        .not.toBe(true, entry.url + ' should not throw 404 error');
                    
                    if(entry.title !== null){
                        
                        expect(title).toContain(entry.title);
                    }
                    
                    this.driver.getPageSource().then((source) => {
                        
                        if(entry.source !== null){
                            
                            expect(source).toContain(entry.source);
                        }
                        
                        recursiveCaller(urls, done);
                    });
                });
            });
        }
        
        recursiveCaller(list, done);
    });
});

//    https://localhost/app must redirect to index
//    https://localhost/app/ must redirect to index
//    https://localhost/storage/ must redirect to the storage folder
//    https://localhost/storage must redirect to the storage folder
//    ...
//    
//Test that site works also inside a subfolder of the web server: https://localhost/somefolder/global.js