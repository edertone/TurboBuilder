#!/usr/bin/env node

'use strict';


/**
 * All those tests are check that a site_php project type works as expected.
 * Any site_php project that is up to date must pass all of these tests.
 * 
 * No multi browser is necessary as we are only testing url behaviours, so we will use only
 * the chromedriver for these tests. 
 */


const path = require('path');
const webdriver = require('selenium-webdriver');
const { StringUtils, FilesManager, ArrayUtils } = require('turbocommons-ts');


let fm = new FilesManager(require('fs'), require('os'), path, process);


describe('selenium-site_php-core-tests', function() {

    beforeAll(function() {
        
        this.originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;
        
        let projectName = StringUtils.getPathElement(path.resolve('./'));
        
        this.siteSetup = JSON.parse(fm.readFile('target/' + projectName + '/dist/site/turbosite.json'));
        
        // Aux method to replace all the wildcards on a provided url
        this.replaceWildCardsOnText = (url) => {
            
            return StringUtils.replace(url,
                    ['$host', '$locale', '$homeView', '$cacheHash'],
                    [this.siteSetup.testsSetup.host,
                     this.siteSetup.locales[0].split('_')[0],
                     this.siteSetup.homeView,
                     this.siteSetup.cacheHash]);
        }
        
        // Initialize the chrome driver with english language
        let chromeCapabilities = webdriver.Capabilities.chrome();
        
        var chromeOptions = {
            'args': ['--lang=en']
        };
        
        chromeCapabilities.set('chromeOptions', chromeOptions);
        this.driver = new webdriver.Builder().withCapabilities(chromeCapabilities).build();
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
                
                done();
            }
            
            let url = this.replaceWildCardsOnText(urls.shift());
            
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
                
                done();
            }
            
            let entry = urls.shift();
            entry.url = this.replaceWildCardsOnText(entry.url);
            entry.to = this.replaceWildCardsOnText(entry.to);
            
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
                
                done();
            }
            
            let entry = urls.shift();
            entry.url = this.replaceWildCardsOnText(entry.url);
            
            this.driver.get(entry.url).then(() => {
                
                this.driver.getTitle().then((title) => {
                
                    expect(title.indexOf('404 Not Found') >= 0 || title.indexOf('Error 404 page') >= 0)
                        .not.toBe(true, entry.url + ' should not throw 404 error');
                    
                    if(entry.title !== null){
                        
                        entry.title = this.replaceWildCardsOnText(entry.title);
                        
                        expect(title).toContain(entry.title, 'Coming from url: ' + entry.url);
                    }
                    
                    this.driver.getPageSource().then((source) => {
                        
                        if(entry.source !== null){
                            
                            if(ArrayUtils.isArray(entry.source)){
                            
                                for (let entrySourceElement of entry.source) {
                                    
                                    entrySourceElement = this.replaceWildCardsOnText(entrySourceElement);
                                    
                                    expect(source).toContain(entrySourceElement, 'Coming from url: ' + entry.url);
                                }
                                
                            }else{
                            
                                entry.source = this.replaceWildCardsOnText(entry.source);
                                
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

//    ...
//    
//Test that site works also inside a subfolder of the web server: https://localhost/somefolder/global.js