'use strict';
var _ = require('lodash');
var request = require('request'); // "Request" library
var requestPromise = require('request-promise');
var http = require('http');

var firebase = require("firebase-admin");
var fbpcfg = require('../config/fb_config');
var serviceAccount = require("../config/themalkins-5de0c-firebase-adminsdk-lielv-ec38cb4669.json");

var cfg = require('../config/utils_config');

function FirebaseHelper() {

    console.log("[FirebaseHelper] STARTED: ");

    firebase.initializeApp({
        credential: firebase.credential.cert(serviceAccount),
        databaseURL: fbpcfg.config.DATABASE_URL
    });

};

FirebaseHelper.prototype.initializeFBApp = function() {

    console.log("[FirebaseHelper.initializeApp] STARTED: ");

    firebase.initializeApp({
        credential: firebase.credential.cert(serviceAccount),
        databaseURL: fbpcfg.config.DATABASE_URL
    });

    var options = "Ran initializeApp";

    return requestPromise(options);
    
};

FirebaseHelper.prototype.queryFirebase = function(user) {

    console.log("[FirebaseHelper.pushToFirebase] STARTED: ");

    
    return requestPromise(options);
};


exports.handler = function( res, req ) {

    var url = ENDPOINT+'?eVar1=createMenu&eVar2=PageAlastair';

    http.post( url, function( response ) {

        response.on( 'data', function( data ) {
            var prompt = 'Your AA data has been posted';
            //output( prompt, context );

        } );

    } );

};


module.exports = FirebaseHelper;