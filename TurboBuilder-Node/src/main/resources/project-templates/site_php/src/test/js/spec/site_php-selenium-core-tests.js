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


describe('site_php-selenium-core-tests', function() {

    beforeAll(function() {
        
        this.originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;
        
        this.host = 'localhost';
        
        let projectName = StringUtils.getPathElement(path.resolve('./'));
        
        this.siteSetup = JSON.parse(fm.readFile('target/' + projectName + '/dist/site/turbosite.json'));
        
        // Aux method to replace all the wildcards on a provided url
        this.replaceWildCardsOnUrl = (url) => {
            
            return StringUtils.replace(url,
                    ['$host', '$locale', '$homeView', '$cacheHash'],
                    [this.host,
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
        
        let list = JSON.parse(fm.readFile('src/test/js/resources/site_php-selenium-core-tests/expected-404-errors.json'));
        
        // Fail if list has duplicate values
        expect(ArrayUtils.hasDuplicateElements(list))
            .toBe(false, 'duplicate urls: ' + ArrayUtils.getDuplicateElements(list).join(', '));
        
        // Load all the urls on the json file and perform a request for each one.
        let recursiveCaller = (urls, done) => {
            
            if(urls.length <= 0){
                
                done();
            }
            
            let url = this.replaceWildCardsOnUrl(urls.shift());
            
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
        
        // Fail if list has duplicate values
        expect(ArrayUtils.hasDuplicateElements(list.map(l => l.url)))
            .toBe(false, 'duplicate urls: ' + ArrayUtils.getDuplicateElements(list.map(l => l.url)).join(', '));
        
        // Load all the urls on the json file and perform a request for each one.
        let recursiveCaller = (urls, done) => {
            
            if(urls.length <= 0){
                
                done();
            }
            
            let entry = urls.shift();
            entry.url = this.replaceWildCardsOnUrl(entry.url);
            entry.to = this.replaceWildCardsOnUrl(entry.to);
            
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
        
        // Fail if list has duplicate values
        expect(ArrayUtils.hasDuplicateElements(list.map(l => l.url)))
            .toBe(false, 'duplicate urls: ' + ArrayUtils.getDuplicateElements(list.map(l => l.url)).join(', '));
        
        // Load all the urls on the json file and perform a request for each one.
        let recursiveCaller = (urls, done) => {
            
            if(urls.length <= 0){
                
                done();
            }
            
            let entry = urls.shift();
            entry.url = this.replaceWildCardsOnUrl(entry.url);
            
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

    404 expected ??
        "http://$host/robots.TXT",
        "http://$host/robots.txT",
        "http://$host/Robots.txt",
        "http://$host/robOts.txt",
        "http://$host/ROBOTS.txt",
        "http://$host/ROBOTS.TXT",
        "http://$host/global-$cacheHash.CSS",
        "http://$host/global-$cacheHash.Css",
        "http://$host/globAl-$cacheHash.css",
        "http://$host/global-$cacheHash.JS",
        "http://$host/global-$cacheHash.Js",
        "http://$host/Global-$cacheHash.js"

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