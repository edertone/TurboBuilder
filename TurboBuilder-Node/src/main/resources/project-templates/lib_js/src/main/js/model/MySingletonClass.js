"use strict";


/** @namespace */
var com_mydomain_projectName_namespacepath = com_mydomain_projectName_namespacepath || {};


/**
 * Singleton class javascript pattern
 *
 * @class
 */
com_mydomain_projectName_namespacepath.MySingletonClass = {

    _mySingletonClass : null,

    getInstance : function(){

        if(!this._mySingletonClass){

            this._mySingletonClass = {

                publicVar1 : '',

                publicVar2 : '',


                _privateVar1 : '',

                _privateVar2 : '',


                publicMethod1 : function(){

                },


                _privateMethod1 : function(){

                }
            };
        }

        return this._mySingletonClass;
    }
};


// Example

// Import namespace
var ns = com_mydomain_projectName_namespacepath;

ns.mySingletonClass.getInstance().publicMethod1();
