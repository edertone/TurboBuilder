#!/usr/bin/env node

'use strict';


/**
 * Contains tests that check the behaviour of a site_php web services by performing multiple request scenarios with different
 * POST and GET parameters
 */

const utils = require('../test-utils');
const { HTTPManager, HTTPManagerGetRequest, HTTPManagerPostRequest } = require('turbocommons-ts');


describe('web-services-post-requests', function() {


    beforeAll(function() {

        // HTTPManager class requires XMLHttpRequest which is only available on browser but not on node.
        // The xhr2 library emulates this class so it can be used on nodejs projects. We declare it globally here
        global.XMLHttpRequest = require('xhr2');
        
        // This value is set to disable the ssl bad certificate errors on nodejs
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
        
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;
        
        this.httpManager = new HTTPManager();
        
        // Aux function to generate the GET requests used by tests
        this.createGETRequest = (uri, done, expectedTexts) => {
        
            let request = new HTTPManagerGetRequest(utils.replaceWildCardsOnText("https://$host/api/site/example/" + uri));
            
            request.errorCallback = (errorMsg) => {
            
                expect(false).toBe(true, 'Error with http request:  ' + errorMsg);
                
                done();
            };
            
            request.successCallback = (response) => {
            
                for(let i = 0; i < expectedTexts.length; i++){
                
                    expect(response).toContain(expectedTexts[i]);
                }
            
                done();
            };
            
            return request;
        };
        
        // Aux function to generate the POST requests used by tests
        this.createPOSTRequest = (uri, done, expectedTexts) => {
        
            let request = new HTTPManagerPostRequest(utils.replaceWildCardsOnText("https://$host/api/site/example/" + uri));
            
            request.errorCallback = (errorMsg) => {
            
                expect(false).toBe(true, 'Error with http request:  ' + errorMsg);
                
                done();
            };
            
            request.successCallback = (response) => {
            
                for(let i = 0; i < expectedTexts.length; i++){
                
                    expect(response).toContain(expectedTexts[i]);
                }
            
                done();
            };
            
            return request;
        };
    });

    
    afterAll(function() {

        jasmine.DEFAULT_TIMEOUT_INTERVAL = this.originalTimeout;
    });
    
    
    beforeEach(function() {

    });
    
    
    afterEach(function() {

    });
    
    
    it('should correctly load the ExampleServiceWithoutParams when no parameters are passed', function(done) {
    
        let request = this.createGETRequest('example-service-without-params', done,
            ['Any value can be output by the service as a string (json or xml data, plain text, etc..)']);
    
        this.httpManager.execute(request);
    });
    
    
    it('should fail the ExampleServiceWithoutParams when GET parameters are passed', function(done) {

        let request = this.createGETRequest('example-service-without-params/param0/param1', done,
            ['turbosite-global-error-manager-problem',
             'Invalid number of GET parameters passed to service. Received 2 but expected 0']);
        
        this.httpManager.execute(request);
    });
    
    
    it('should fail the ExampleServiceWithoutParams when WRONG GET parameters are passed', function(done) {
    
        let request = this.createGETRequest('example-service-without-params/&& &&   /&&&  /-----???', done,
            ['turbosite-global-error-manager-problem',
             'Invalid number of GET parameters passed to service. Received 3 but expected 0']);
        
        this.httpManager.execute(request);
    });
    
    
    it('should fail the ExampleServiceWithoutParams when POST parameters are passed', function(done) {
    
        let request = this.createPOSTRequest('example-service-without-params', done,
            ['turbosite-global-error-manager-problem',
             'FATAL EXCEPTION<br>Received POST variables but POST not enabled on service']);
        
        request.parameters = {
            "data": "some arbitrary string"
        };
        
        this.httpManager.execute(request);
    });
    
    
    it('should fail the ExampleServiceWithoutParams when WRONG POST parameters are passed', function(done) {
    
        let request = this.createPOSTRequest('example-service-without-params', done,
            ['turbosite-global-error-manager-problem',
             'FATAL EXCEPTION<br>Received POST variables but POST not enabled on service']);
        
        request.parameters = {
            "data": "some arbitrary string",
            "extravariable": "some extra value"
        };
        
        this.httpManager.execute(request);
    });
    
    
    it('should fail the ExampleServiceWithGetParams when no parameters are passed', function(done) {
    
        let request = this.createGETRequest('example-service-with-get-params', done,
            ['turbosite-global-error-manager-problem',
             'FATAL EXCEPTION<br>Invalid number of GET parameters passed to service. Received 0 but expected 2']);
        
        this.httpManager.execute(request);
    });
    
    
    it('should correctly load the ExampleServiceWithGetParams when GET parameters are passed', function(done) {
    
        let request = this.createGETRequest('example-service-with-get-params/param1/param2', done,
            ['{"info":"this object is returned as a json string with the received GET parameters values","received-param-0-value":"param1","received-param-1-value":"param2"}']);
        
        this.httpManager.execute(request);
    });
    
    
    it('should fail the ExampleServiceWithGetParams when WRONG GET parameters are passed', function(done) {
    
        let request = this.createGETRequest('example-service-with-get-params/param1/param2/param3/param4', done,
            ['turbosite-global-error-manager-problem',
             'FATAL EXCEPTION<br>Invalid number of GET parameters passed to service. Received 4 but expected 2']);
        
        this.httpManager.execute(request);
    });
    
    
    it('should fail the ExampleServiceWithGetParams when POST parameters are passed', function(done) {
    
        let request = this.createPOSTRequest('example-service-with-get-params', done,
            ['turbosite-global-error-manager-problem',
             'FATAL EXCEPTION<br>Invalid number of GET parameters passed to service. Received 0 but expected 2']);
        
        request.parameters = {
            "data": "some arbitrary string"
        };
        
        this.httpManager.execute(request);
    });
    
    
    it('should fail the ExampleServiceWithGetParams when WRONG POST parameters are passed', function(done) {
    
        let request = this.createPOSTRequest('example-service-with-get-params/param1/param2', done,
            ['turbosite-global-error-manager-problem',
             'FATAL EXCEPTION<br>Received POST variables but POST not enabled on service']);
        
        request.parameters = {
            "data": "some arbitrary string",
            "extradata": "some extra value",
            "more extra data": "&&--!!..."
        };
        
        this.httpManager.execute(request);
    });
    
    
    it('should fail the ExampleServiceWithGetParams when GET and POST parameters are passed', function(done) {
    
        let request = this.createPOSTRequest('example-service-with-get-params/param1/param2', done,
            ['turbosite-global-error-manager-problem',
             'FATAL EXCEPTION<br>Received POST variables but POST not enabled on service']);
        
        request.parameters = {
            "data": "some arbitrary string"
        };
        
        this.httpManager.execute(request);
    });
    
    
    it('should correctly load the ExampleServiceWithGetParamsOptional when no parameters are passed', function(done) {
    
        let request = this.createGETRequest('example-service-with-get-params-optional', done,
            ['{"info":"this object is returned as a json string with the optionally received GET parameters values","received-param-0-value":"","received-param-1-value":"","received-param-2-value":"","received-param-3-value":""}']);
        
        this.httpManager.execute(request);
    });
    
    
    it('should correctly load the ExampleServiceWithGetParamsOptional when GET parameters are passed', function(done) {
    
        let request1 = this.createGETRequest('example-service-with-get-params-optional/param1', done,
            ['{"info":"this object is returned as a json string with the optionally received GET parameters values","received-param-0-value":"param1","received-param-1-value":"","received-param-2-value":"","received-param-3-value":""}']);
        
        this.httpManager.execute(request1);
        
        let request2 = this.createGETRequest('example-service-with-get-params-optional/param1/param2', done,
            ['{"info":"this object is returned as a json string with the optionally received GET parameters values","received-param-0-value":"param1","received-param-1-value":"param2","received-param-2-value":"","received-param-3-value":""}']);
        
        this.httpManager.execute(request2);
        
        let request3 = this.createGETRequest('example-service-with-get-params-optional/param1/param2/param3', done,
            ['{"info":"this object is returned as a json string with the optionally received GET parameters values","received-param-0-value":"param1","received-param-1-value":"param2","received-param-2-value":"param3","received-param-3-value":""}']);
        
        this.httpManager.execute(request3);
        
        let request4 = this.createGETRequest('example-service-with-get-params-optional/param1/param2/param3/param4', done,
            ['{"info":"this object is returned as a json string with the optionally received GET parameters values","received-param-0-value":"param1","received-param-1-value":"param2","received-param-2-value":"param3","received-param-3-value":"param4"}']);
        
        this.httpManager.execute(request4);
    });
    
    
    it('should fail the ExampleServiceWithGetParamsOptional when WRONG GET parameters are passed', function(done) {
    
        let request1 = this.createGETRequest('example-service-with-get-params-optional/param1/param2/param3/param4/param5', done,
            ['turbosite-global-error-manager-problem',
             'FATAL EXCEPTION<br>Invalid number of GET parameters passed to service. Received 5 but expected 4']);
        
        this.httpManager.execute(request1);
        
        let request2 = this.createGETRequest('example-service-with-get-params-optional/param1/param2/param3/param4/param5/param6/param7', done,
            ['turbosite-global-error-manager-problem',
             'FATAL EXCEPTION<br>Invalid number of GET parameters passed to service. Received 7 but expected 4']);
        
        this.httpManager.execute(request2);
    });
    
    
    it('should fail the ExampleServiceWithGetParamsOptional when POST parameters are passed', function(done) {
    
        let request = this.createPOSTRequest('example-service-with-get-params-optional', done,
            ['turbosite-global-error-manager-problem',
             'FATAL EXCEPTION<br>Received POST variables but POST not enabled on service']);
        
        request.parameters = {
            "data": "some arbitrary string"
        };
        
        this.httpManager.execute(request);
    });
    
    
    it('should fail the ExampleServiceWithGetParamsOptional when WRONG POST parameters are passed', function(done) {
    
        let request = this.createPOSTRequest('example-service-with-get-params-optional', done,
            ['turbosite-global-error-manager-problem',
             'FATAL EXCEPTION<br>Received POST variables but POST not enabled on service']);
        
        request.parameters = {
            "data": "some arbitrary string",
            "extradata": "some extra value",
            "more extra data": "&&--!!..."
        };
        
        this.httpManager.execute(request);
    });
    
    
    it('should fail the ExampleServiceWithGetParamsOptional when GET and POST parameters are passed', function(done) {
    
        let request = this.createPOSTRequest('example-service-with-get-params-optional/param1/param2', done,
            ['turbosite-global-error-manager-problem',
             'FATAL EXCEPTION<br>Received POST variables but POST not enabled on service']);
        
        request.parameters = {
            "data": "some arbitrary string"
        };
        
        this.httpManager.execute(request);
    });
    
    
    it('should fail the ExampleServiceWithPostParams when no parameters are passed', function(done) {
    
        let request = this.createPOSTRequest('example-service-with-post-params', done,
            ['turbosite-global-error-manager-problem',
             'FATAL EXCEPTION<br>This service expects POST data']);
       
        this.httpManager.execute(request);
    });
    
    
    it('should fail the ExampleServiceWithPostParams when GET parameters are passed', function(done) {
    
        let request = this.createPOSTRequest('example-service-with-post-params/param1/param2', done,
            ['turbosite-global-error-manager-problem',
             'FATAL EXCEPTION<br>Invalid number of GET parameters passed to service. Received 2 but expected 0']);
       
        this.httpManager.execute(request);
    });
    
    
    it('should fail the ExampleServiceWithPostParams when WRONG GET parameters are passed', function(done) {
    
        let request = this.createPOSTRequest('example-service-with-post-params/param1/param2/===$$$$!!!!!!/   ---', done,
            ['turbosite-global-error-manager-problem',
             'FATAL EXCEPTION<br>Invalid number of GET parameters passed to service. Received 4 but expected 0']);
       
        this.httpManager.execute(request);
    });
    
    
    it('should correctly load the ExampleServiceWithPostParams when POST parameters are passed', function(done) {
    
        let request1 = this.createPOSTRequest('example-service-with-post-params', done,
            ['{"info":"this object is returned as a json string with the received POST parameters","received-param1":"","received-param2":""}']);
       
        request1.parameters = {
            "param1": "",
            "param2": "",
        };
        
        this.httpManager.execute(request1);
    
        let request2 = this.createPOSTRequest('example-service-with-post-params', done,
            ['{"info":"this object is returned as a json string with the received POST parameters","received-param1":"some arbitrary string","received-param2":"param 2 value"}']);
       
        request2.parameters = {
            "param1": "some arbitrary string",
            "param2": "param 2 value"
        };
        
        this.httpManager.execute(request2);
    });
    
    
    it('should fail the ExampleServiceWithPostParams when WRONG POST parameters are passed', function(done) {
    
        let request = this.createPOSTRequest('example-service-with-post-params', done,
            ['turbosite-global-error-manager-problem',
             'FATAL EXCEPTION<br>Unexpected POST variables received']);
       
        request.parameters = {
            "param1": "some arbitrary string",
            "extradata": "some extra value"
        };
        
        this.httpManager.execute(request);
    });
    
    
    it('should fail the ExampleServiceWithPostParams when GET and POST parameters are passed', function(done) {
    
        let request = this.createPOSTRequest('example-service-with-post-params/param1/param2', done,
            ['turbosite-global-error-manager-problem',
             'FATAL EXCEPTION<br>Invalid number of GET parameters passed to service. Received 2 but expected 0']);
       
        request.parameters = {
            "data": "some arbitrary string"
        };
        
        this.httpManager.execute(request);
    });
        
    
    it('should fail the ExampleServiceWithPostAndGetParams when no parameters are passed', function(done) {
    
        let request = this.createPOSTRequest('example-service-with-post-and-get-params', done,
            ['turbosite-global-error-manager-problem',
             'FATAL EXCEPTION<br>Invalid number of GET parameters passed to service. Received 0 but expected 2']);
               
        this.httpManager.execute(request);
    });
    
    
    it('should fail the ExampleServiceWithPostAndGetParams when GET parameters are passed', function(done) {
    
        let request = this.createPOSTRequest('example-service-with-post-and-get-params/param1/param2', done,
            ['turbosite-global-error-manager-problem',
             'FATAL EXCEPTION<br>This service expects POST data']);
               
        this.httpManager.execute(request);
    });
    
    
    it('should fail the ExampleServiceWithPostAndGetParams when WRONG GET parameters are passed', function(done) {
    
        let request = this.createPOSTRequest('example-service-with-post-and-get-params/param1/param2/param3/param4', done,
            ['turbosite-global-error-manager-problem',
             'FATAL EXCEPTION<br>Invalid number of GET parameters passed to service. Received 4 but expected 2']);
               
        this.httpManager.execute(request);
    });
    
    
    it('should fail the ExampleServiceWithPostAndGetParams when POST parameters are passed', function(done) {
    
        let request = this.createPOSTRequest('example-service-with-post-and-get-params', done,
            ['turbosite-global-error-manager-problem',
             'FATAL EXCEPTION<br>Invalid number of GET parameters passed to service. Received 0 but expected 2']);
        
        request.parameters = {
            "data": "some arbitrary string"
        };
               
        this.httpManager.execute(request);
    });
    
    
    it('should fail the ExampleServiceWithPostAndGetParams when WRONG POST parameters are passed', function(done) {
    
        let request = this.createPOSTRequest('example-service-with-post-and-get-params', done,
            ['turbosite-global-error-manager-problem',
             'FATAL EXCEPTION<br>Invalid number of GET parameters passed to service. Received 0 but expected 2']);
        
        request.parameters = {
            "data": "some arbitrary string",
            "data2": "more data"
        };
               
        this.httpManager.execute(request);
    });
    
    
    it('should correctly load the ExampleServiceWithPostAndGetParams when GET and POST parameters are passed', function(done) {
    
        let request = this.createPOSTRequest('example-service-with-post-and-get-params/param1/param2', done,
            ['{"info":"this object is returned as a json string with the received GET and POST parameters values","received-GET-param-0-value":"param1","received-GET-param-1-value":"param2","received-POST-params":"some arbitrary string"}']);
        
        request.parameters = {
            "data": "some arbitrary string"
        };
               
        this.httpManager.execute(request);
    });
    
    
    it('should correctly load the ExampleServiceWithPostAndGetParamsOptional when no parameters are passed', function(done) {
    
        let request = this.createPOSTRequest('example-service-with-post-and-get-params-optional', done,
            ['{"info":"this object is returned as a json string with the optionally received GET and POST parameters values","received-GET-param-0-value":"","received-GET-param-1-value":"","received-GET-param-2-value":"","received-POST-param-data":""}']);
               
        this.httpManager.execute(request);
    });
    
    
    it('should correctly load the ExampleServiceWithPostAndGetParamsOptional when GET parameters are passed', function(done) {
    
        let request1 = this.createPOSTRequest('example-service-with-post-and-get-params-optional/param1', done,
            ['{"info":"this object is returned as a json string with the optionally received GET and POST parameters values","received-GET-param-0-value":"param1","received-GET-param-1-value":"","received-GET-param-2-value":"","received-POST-param-data":""}']);
               
        this.httpManager.execute(request1);
        
        let request2 = this.createPOSTRequest('example-service-with-post-and-get-params-optional/param1/param2', done,
            ['{"info":"this object is returned as a json string with the optionally received GET and POST parameters values","received-GET-param-0-value":"param1","received-GET-param-1-value":"param2","received-GET-param-2-value":"","received-POST-param-data":""}']);
               
        this.httpManager.execute(request2);
    });
    
    
    it('should fail the ExampleServiceWithPostAndGetParamsOptional when WRONG GET parameters are passed', function(done) {
    
        let request = this.createPOSTRequest('example-service-with-post-and-get-params-optional/param1/param2/param3/param4/param5', done,
            ['turbosite-global-error-manager-problem',
             'FATAL EXCEPTION<br>Invalid number of GET parameters passed to service. Received 5 but expected 3']);
                
        this.httpManager.execute(request);
    });
    
    
    it('should correctly load the ExampleServiceWithPostAndGetParamsOptional when POST parameters are passed', function(done) {
    
        let request = this.createPOSTRequest('example-service-with-post-and-get-params-optional', done,
            ['{"info":"this object is returned as a json string with the optionally received GET and POST parameters values","received-GET-param-0-value":"","received-GET-param-1-value":"","received-GET-param-2-value":"","received-POST-param-data":"some arbitrary string"}']);
        
        request.parameters = {
            "data": "some arbitrary string"
        };
                
        this.httpManager.execute(request);
    });
    
    
    it('should fail the ExampleServiceWithPostAndGetParamsOptional when WRONG POST parameters are passed', function(done) {
    
        let request = this.createPOSTRequest('example-service-with-post-and-get-params-optional', done,
            ['turbosite-global-error-manager-problem',
             'FATAL EXCEPTION<br>Unexpected POST variables received']);
            
        request.parameters = {
            "data": "some arbitrary string",
            "extradata": "some more data"
        };
            
        this.httpManager.execute(request);
    });
    
    
    it('should correctly load the ExampleServiceWithPostAndGetParamsOptional when GET and POST parameters are passed', function(done) {
    
        let request = this.createPOSTRequest('example-service-with-post-and-get-params-optional/param1/param2', done,
            ['{"info":"this object is returned as a json string with the optionally received GET and POST parameters values","received-GET-param-0-value":"param1","received-GET-param-1-value":"param2","received-GET-param-2-value":"","received-POST-param-data":"some arbitrary string"}']);
        
        request.parameters = {
            "data": "some arbitrary string"
        };
                
        this.httpManager.execute(request);
    });
    
    
    it('should correctly load the ExampleServiceThatCallsAnotherOne', function(done) {
    
        let request = this.createPOSTRequest('example-service-that-calls-another-one', done,
            ['ExampleServiceWithoutParams called. Result:',
             'Any value can be output by the service as a string (json or xml data, plain text, etc..)',
             'ExampleServiceWithGetParams called. Result:',
             '{"info":"this object is returned as a json string with the received GET parameters values","received-param-0-value":"param0","received-param-1-value":"param1"}',
             'ExampleServiceWithGetParamsOptional called. Result',
             '{"info":"this object is returned as a json string with the optionally received GET parameters values","received-param-0-value":"param0","received-param-1-value":"","received-param-2-value":"","received-param-3-value":""}',
             'ExampleServiceWithPostParams called. Result:',
             '{"info":"this object is returned as a json string with the received POST parameters","received-param1":"p1 value","received-param2":"p2 value"}',
             'ExampleServiceWithPostAndGetParams called. Result:',
             '{"info":"this object is returned as a json string with the received GET and POST parameters values","received-GET-param-0-value":"param0","received-GET-param-1-value":"param1","received-POST-params":"data from constructor"}',
             'ExampleServiceWithPostAndGetParamsOptional called. Result:',
             '{"info":"this object is returned as a json string with the optionally received GET and POST parameters values","received-GET-param-0-value":"","received-GET-param-1-value":"","received-GET-param-2-value":"","received-POST-param-data":""}',
             'ExampleServiceWithPostAndGetParamsOptional called 2. Result:',
             '{"info":"this object is returned as a json string with the optionally received GET and POST parameters values","received-GET-param-0-value":"p1","received-GET-param-1-value":"p2","received-GET-param-2-value":"","received-POST-param-data":"datavalue"}']);
                
        this.httpManager.execute(request);
    });
});