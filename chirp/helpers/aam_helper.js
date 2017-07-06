'use strict';
var _ = require('lodash');
var requestPromise = require('request-promise');

var ENDPOINT_PUBLISH = 'https://author964.adobedemo.com';
var AUTHORIZATION_KEY = 'Basic YWRtaW46SjJ2ZjFPV2I=';
var CSRF_TOKEN_ENDPOINT = '/libs/granite/csrf/token.json';

var ENDPOINT_PUBLISH_USER_PATH = '/home/users/connectedexperiences/'; 

var fredUser = 'aVqD4D7MC2SycbL7ghXs'; //aVqD4D7MC2SycbL7ghXs/profile

var AAM_ENDPOINT = 'http://demo-team.demdex.net/event?d_rtbd=json&c_interestedinholiday=true&d_cid_ic=demoteam'

function AAMHelper() {
}

AAMHelper.prototype.getCRSFToken = function() {

    console.log("[AAMHelper.getCRSFToken] STARTED: ");

    var options = {
        method: 'GET',
        headers: {
            Authorization: AUTHORIZATION_KEY
        },
        uri: ENDPOINT_PUBLISH+CSRF_TOKEN_ENDPOINT,
        json: true
    };
    return requestPromise(options);
};

AAMHelper.prototype.getUserDetails = function() {

    console.log("[AAMHelper.getUserDetails] STARTED: ");

    var headers = {
        "Authorization": AUTHORIZATION_KEY
    }

    var options = {
        method: 'GET',
        headers: headers,
        uri: ENDPOINT_PUBLISH+ENDPOINT_PUBLISH_USER_PATH+fredUser+'/profile.json',
        json: true
    };
    return requestPromise(options);
};

AAMHelper.prototype.getVisitorID = function(userDetails) {

    console.log("[AAMHelper.getVisitorID] STARTED: ");

    var template = _.template('${visitorID}');

    var visitorID = "";

    for (var attributename in userDetails){
        //console.log("[AAMHelper.getVisitorID] attributename: "+attributename+": "+userDetails[attributename]);

        if (attributename == "visitorId") {
            visitorID = userDetails[attributename]
        }

    }


    return template({
        visitorID: visitorID
    });

};

AAMHelper.prototype.postVisitorIDToAAM = function(visitorID) {

    console.log("[AAMHelper.postVisitorIDToAAM] visitorID: "+visitorID);

    var visitorIDString = '%01'+visitorID+'%011'; //%011493905074410%011
    
    console.log("[AAMHelper.postVisitorIDToAAM] AAM_ENDPOINT+visitorIDString: "+AAM_ENDPOINT+visitorIDString);

    var options = {
        method: 'GET',
        uri: AAM_ENDPOINT+visitorIDString
    };

    return requestPromise(options);

};


module.exports = AAMHelper;

