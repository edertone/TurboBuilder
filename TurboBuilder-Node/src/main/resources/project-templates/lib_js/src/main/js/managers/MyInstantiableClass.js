"use strict";


/** @namespace */
var com_mydomain_projectName_namespacepath = com_mydomain_projectName_namespacepath || {};


/**
 * Instantiable class javascript pattern
 *
 * @class
 */
com_mydomain_projectName_namespacepath.MyInstantiableClass = function(constructorParam1, constructorParam2){

    // Public property 1
    this.publicVar1 = constructorParam1;

    // Public property 2
    this.publicVar2 = constructorParam2;

    // Private property 1
    this._privateVar1 = constructorParam2;

    // Private property 2
    this._privateVar2 = '';

};


/**
 * Public method 1
 *
 * @returns
 */
com_mydomain_projectName_namespacepath.MyInstantiableClass.prototype.method1 = function(){

    return this.publicVar1;
};


/**
 * Private method 1
 *
 * @private
 */
com_mydomain_projectName_namespacepath.MyInstantiableClass.prototype._method1 = function(){

    return this._privateVar1;
};


// Example

// Import namespace
var ns = com_mydomain_projectName_namespacepath;

var a = new ns.MyInstantiableClass("1", "2");
var b = new ns.MyInstantiableClass("3", "4");

a.method1();
