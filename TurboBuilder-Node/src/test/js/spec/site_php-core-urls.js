#!/usr/bin/env node

'use strict';


/**
 * Tests with selenium that a site_php project manages urls as expected. Any site_php project that is
 * up to date must pass this tests
 * No multi browser is necessary as we are only testing url behaviours, so we will use only
 * the chromedriver for these tests. 
 */


require('./../../../main/js/globals');
const utils = require('../test-utils');
const webdriver = require('selenium-webdriver');


describe('site_php-url-requests', function() {

    beforeAll(function() {
        
        // Todo - generate the project structure on an http server location
        
        this.driver = new webdriver.Builder().forBrowser('chrome').build();
    });

    
    afterAll(function() {

        this.driver.quit();     
    });

    
    it('should redirect http to https', function(done) {
        
        this.driver.get('http://localhost').then(() => {
            
            this.driver.getCurrentUrl().then((url) => {
                expect(url).toContain('https://localhost');
                done();
            });
        });
    });
    
    
    it('should open robots root file', function(done) {
        
        this.driver.get('https://localhost/robots.txt').then(() => {
            
            this.driver.getPageSource().then((source) => {
                expect(source).toContain('User-agent:');
                done();
            });
        });
    });
    
    
    it('should show 404 for non existing root file', function(done) {
        
        this.driver.get('https://localhost/somenonexistingfile.txt').then(() => {
            
            this.driver.getTitle().then((title) => {
                expect(title).toContain('Error 404');
                done();
            });
        });
    });
    
    
    it('should show 404 for non existing resources file', function(done) {
        
        this.driver.get('https://localhost/resources/somenonexistingfile.txt').then(() => {
            
            this.driver.getTitle().then((title) => {
                expect(title).toContain('Error 404');
                done();
            });
        });
    });
});