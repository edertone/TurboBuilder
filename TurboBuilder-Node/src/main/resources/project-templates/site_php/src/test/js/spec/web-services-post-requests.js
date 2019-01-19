#!/usr/bin/env node

'use strict';


/**
 * TODO
 */

const utils = require('../test-utils');
const path = require('path');
const { HTTPManager, HTTPManagerPostRequest } = require('turbocommons-ts');

describe('web-services-post-requests', function() {


    beforeAll(function() {

        // HTTPManager class requires XMLHttpRequest which is only available on browser but not on node.
        // The xhr2 library emulates this class so it can be used on nodejs projects. We declare it globally here
        global.XMLHttpRequest = require('xhr2');
        
        // This value is set to disable the ssl bad certificate errors on nodejs
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    });

    
    afterAll(function() {

        
    });
    
    
    beforeEach(function() {

        this.httpManager = new HTTPManager();
        
        this.request = new HTTPManagerPostRequest(utils.replaceWildCardsOnText("https://$host/api/site/example/example-service-with-post-params"));
    });
    
    
    afterEach(function() {

        
    });
    
    
    it('should correctly load the ExampleServiceWithPostParams web service when a simple string is passed into params variable', function(done) {
        
        this.request.parameters = {
            "params": "simple-string"
        };
        
        this.request.errorCallback = (errorMsg) => {
        
            expect(false).toBe(true, 'Error with http request ' + errorMsg);
            
            done();
        };
        
        this.request.successCallback = (response) => {
        
            expect(response).toBe('{"info":"this object is returned as a json string with the received POST parameters object","received-params":"simple-string"}');
            
            done();
        };
        
        this.httpManager.execute(this.request);
    });
    
    
    it('should correctly load the ExampleServiceWithPostParams web service when a json object is passed into params variable', function(done) {
        
        this.request.parameters = {
            "params": '{"param-1": "value1", "param-2": 45, "param-3": [1,2,"3"]}'
        };
        
        this.request.errorCallback = (errorMsg) => {
        
            expect(false).toBe(true, 'Error with http request ' + errorMsg);
            
            done();
        };
        
        this.request.successCallback = (response) => {
        
            expect(response).toBe('{"info":"this object is returned as a json string with the received POST parameters object","received-params":"{\\"param-1\\": \\"value1\\", \\"param-2\\": 45, \\"param-3\\": [1,2,\\"3\\"]}"}');
            
            done();
        };
        
        this.httpManager.execute(this.request);
    });
});