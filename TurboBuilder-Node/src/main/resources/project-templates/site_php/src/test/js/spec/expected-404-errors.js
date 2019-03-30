#!/usr/bin/env node

'use strict';


/**
 * Contains tests that check urls which must not give a 200 ok result
 */

const utils = require('../sitephp-test-utils');
const path = require('path');
const { FilesManager } = require('turbodepot-node');
const fm = new FilesManager(require('fs'), require('os'), path, process);
const { ArrayUtils, HTTPManager, HTTPManagerGetRequest } = require('turbocommons-ts');


describe('expected-404-errors', function() {


    beforeAll(function() {

        // HTTPManager class requires XMLHttpRequest which is only available on browser but not on node.
        // The xhr2 library emulates this class so it can be used on nodejs projects. We declare it globally here
        global.XMLHttpRequest = require('xhr2');
        
        // This value is set to disable the ssl bad certificate errors on nodejs
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
        
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;
        
        this.httpManager = new HTTPManager();
    });

    
    afterAll(function() {

        jasmine.DEFAULT_TIMEOUT_INTERVAL = this.originalTimeout;
    });
    
    
    beforeEach(function() {

    });
    
    
    afterEach(function() {

    });
    
    
    it('should correctly execute all the 404 expected error requests', function(done) {
    
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
            
            let request = new HTTPManagerGetRequest(url);
            
            request.errorCallback = (errorMsg, errorCode) => {
            
                expect(true).toBe(true);
                
                recursiveCaller(urls, done);
            };
            
            request.successCallback = (response) => {
            
                expect(false).toBe(true, 'Http request expected 404 error but was 200:  ' + url);
            
                recursiveCaller(urls, done);
            };
            
            this.httpManager.execute(request);
        }
        
        recursiveCaller(list, done);
    });
});