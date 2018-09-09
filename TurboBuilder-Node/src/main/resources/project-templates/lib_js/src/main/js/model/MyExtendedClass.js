"use strict";


/** @namespace */
var com_mydomain_projectName_namespacepath = com_mydomain_projectName_namespacepath || {};


/**
 * Inherited class javascript pattern
 *
 * @class
 */
com_mydomain_projectName_namespacepath.MyExtendedClass = function(){

    com_mydomain_projectName_namespace2path.MyBaseClass.call(this);

    // Extended property 1
    this.property1 = ''

    // Extended property 2
    this.property2 = ''

};

com_mydomain_projectName_namespacepath.MyExtendedClass.prototype = new com_mydomain_projectName_namespace2path.MyBaseClass();
com_mydomain_projectName_namespacepath.MyExtendedClass.prototype.constructor = com_mydomain_projectName_namespacepath.MyExtendedClass;


// Replace a method from the base class
com_mydomain_projectName_namespacepath.MyExtendedClass.prototype.baseMethod = function(){

};

// Create a new method for the extended class
com_mydomain_projectName_namespacepath.MyExtendedClass.prototype.newMethod = function(){

};

// Example

// Import namespace
var ns = com_mydomain_projectName_namespacepath;

var a = new ns.MyExtendedClass();
a.baseMethod();
a.newMethod();
