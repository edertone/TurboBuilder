#!/usr/bin/env node

'use strict';


/**
 * All those tests check that a site_php project type works as expected.
 * Any site_php project that is up to date must pass all of these tests.
 * 
 * No multi browser is necessary as we are only testing url behaviours, so we will use only
 * the chromedriver for these tests. 
 */

const utils = require('../test-utils');
const path = require('path');
const { execSync } = require('child_process');
const { StringUtils, FilesManager, ArrayUtils } = require('turbocommons-ts');
const webdriver = require('selenium-webdriver');
const fm = new FilesManager(require('fs'), require('os'), path, process);


describe('selenium-site_php-core-tests', function() {

    beforeAll(function() {
        
        utils.checkChromeDriverAvailable();
        
        this.originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;
        
        // Initialize the chrome driver with english language
        let chromeCapabilities = webdriver.Capabilities.chrome();
        
        let chromeOptions = {
            "args": ["--lang=en"]
        };
        
        chromeCapabilities.set('chromeOptions', chromeOptions);
        
        // Enable logs so the tests can read them
        let loggingPrefs = new webdriver.logging.Preferences();
        loggingPrefs.setLevel('browser', webdriver.logging.Level.ALL); 
        loggingPrefs.setLevel('driver', webdriver.logging.Level.ALL); 
        
        this.driver = new webdriver.Builder()
            .withCapabilities(chromeCapabilities)
            .setLoggingPrefs(loggingPrefs)
            .build();
    });

    
    afterAll(function() {

        jasmine.DEFAULT_TIMEOUT_INTERVAL = this.originalTimeout;
        
        this.driver.quit(); 
    });
    
    
    it('should show 404 errors as defined in expected-404-errors.json', function(done) {
        
        let list = JSON.parse(fm.readFile('src/test/js/resources/selenium-site_php-core-tests/expected-404-errors.json'));
        
        // Fail if list has duplicate values
        expect(ArrayUtils.hasDuplicateElements(list))
            .toBe(false, 'duplicate urls: ' + ArrayUtils.getDuplicateElements(list).join(', '));
        
        // Load all the urls on the json file and perform a request for each one.
        let recursiveCaller = (urls, done) => {
            
            if(urls.length <= 0){
                
                return done();
            }
            
            let url = utils.replaceWildCardsOnText(urls.shift());
            
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
        
        let list = JSON.parse(fm.readFile('src/test/js/resources/selenium-site_php-core-tests/expected-301-redirects.json'));
        
        // Fail if list has duplicate values
        expect(ArrayUtils.hasDuplicateElements(list.map(l => l.url)))
            .toBe(false, 'duplicate urls: ' + ArrayUtils.getDuplicateElements(list.map(l => l.url)).join(', '));
        
        // Load all the urls on the json file and perform a request for each one.
        let recursiveCaller = (urls, done) => {
            
            if(urls.length <= 0){
                
                return done();
            }
            
            let entry = urls.shift();
            entry.url = utils.replaceWildCardsOnText(entry.url);
            entry.to = utils.replaceWildCardsOnText(entry.to);
            
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
        
        let list = JSON.parse(fm.readFile('src/test/js/resources/selenium-site_php-core-tests/expected-200-ok.json'));
        
        // Fail if list has duplicate values
        expect(ArrayUtils.hasDuplicateElements(list.map(l => l.url)))
            .toBe(false, 'duplicate urls: ' + ArrayUtils.getDuplicateElements(list.map(l => l.url)).join(', '));
        
        // Load all the urls on the json file and perform a request for each one.
        let recursiveCaller = (urls, done) => {
            
            if(urls.length <= 0){
                
                return done();
            }
            
            let entry = urls.shift();
            entry.url = utils.replaceWildCardsOnText(entry.url);
            
            this.driver.get(entry.url).then(() => {
                
                this.driver.manage().logs().get('browser').then((logs) => {
                    
                    // If specified on the entry, check that there are no SEVERE error logs on the browser
                    if(!entry.skipLogsTest){
                        
                        for (let logEntry of logs) {
                        
                            expect(logEntry.level.name).not.toBe('SEVERE', 'TESTED URL: ' + entry.url + ' BROWSER ERROR: ' + logEntry.message);
                        }
                    }
                    
                    this.driver.getTitle().then((title) => {
                    
                        expect(title.indexOf('404 Not Found') >= 0 || title.indexOf('Error 404 page') >= 0)
                            .not.toBe(true, entry.url + ' should not throw 404 error');
                        
                        if(entry.title !== null){
                            
                            entry.title = utils.replaceWildCardsOnText(entry.title);
                            
                            expect(title).toContain(entry.title, 'Coming from url: ' + entry.url);
                        }
                        
                        this.driver.getPageSource().then((source) => {
                            
                            if(entry.startWith !== null){
                                
                                expect(source.startsWith(entry.startWith))
                                    .toBe(true, entry.url + ' expected to start with ' + entry.startWith + ' but started with ' + source.substr(0, 40));
                            }
                            
                            if(entry.endWith !== null){
                            
                                expect(source.endsWith(entry.endWith))
                                    .toBe(true, entry.url + ' expected to end with ' + entry.endWith + ' but ended with ' + source.substr(source.length - 40));
                            }
                            
                            if(entry.notContains !== null){
                                
                                expect(source).not.toContain(entry.notContains, 'tested url: ' + entry.url);
                            }
                            
                            if(entry.source !== null){
                                
                                if(ArrayUtils.isArray(entry.source)){
                                
                                    for (let entrySourceElement of entry.source) {
                                        
                                        entrySourceElement = utils.replaceWildCardsOnText(entrySourceElement);
                                        
                                        expect(source).toContain(entrySourceElement, 'Coming from url: ' + entry.url);
                                    }
                                    
                                }else{
                                
                                    entry.source = utils.replaceWildCardsOnText(entry.source);
                                    
                                    expect(source).toContain(entry.source, 'Coming from url: ' + entry.url);
                                }
                            }
                            
                            this.driver.getCurrentUrl().then((url) => {
                                
                                expect(url).toBe(entry.url, 'Coming from url: ' + entry.url);
                                
                                recursiveCaller(urls, done);
                            });
                        });
                    });
                });
            });
        }
        
        recursiveCaller(list, done);
    });
});


/*

    test links between pages and custom texts

    404 expected ??
        "http://$host/robots.TXT",
        "http://$host/robots.txT",
        "http://$host/Robots.txt",
        "http://$host/robOts.txt",
        "http://$host/ROBOTS.txt",
        "http://$host/ROBOTS.TXT",
        "http://$host/glob-$cacheHash.CSS",
        "http://$host/glob-$cacheHash.Css",
        "http://$host/glob-$cacheHash.css",
        "http://$host/glob-$cacheHash.JS",
        "http://$host/glob-$cacheHash.Js",
        "http://$host/Glob-$cacheHash.js"

    https://localhost/app must load single parameter view
    https://localhost/app/ must load single parameter view
    https://localhost/storage/ must redirect to the storage folder
    https://localhost/storage must redirect to the storage folder
    
    - que pasa amb un caracter ? alla on no toca? es/home?/
    
    - Que pasa amb més de un ? en la mateixa url? i dins de parametres? /xxx?xxx/
 */