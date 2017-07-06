'use strict';
var requestPromise = require('request-promise');

var aaconfig = require('../config/aa_config');

var client_id = aaconfig.analytics.applicationclientId; // Your app id
var client_secret = aaconfig.analytics.application_secret_key; // Your app secret

var ENDPOINT = 'https://publish921.adobedemo.com';
var ENDPOINT_AUTHOR = 'https://author964.adobedemo.com';
var AUTHORIZATION_KEY = 'Basic YWRtaW46SjJ2ZjFPV2I=';
var ANALYTICS_SERVICE_ENDPOINT = '/bin/postanalyticsdata';

var CSRF_TOKEN_ENDPOINT = '/libs/granite/csrf/token.json';


var authOptions = {
    url: 'https://api.omniture.com/token',
    method: 'POST',
    headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
    },
    form: {
        grant_type: 'client_credentials'
    },
    json: true
};

function AAHelper() {
}

AAHelper.prototype.getCRSFToken = function() {

    console.log("[AAHelper.getCRSFToken] STARTED: ");

    var options = {
        method: 'GET',
        headers: {
            Authorization: AUTHORIZATION_KEY
        },
        uri: ENDPOINT_AUTHOR+CSRF_TOKEN_ENDPOINT,
        json: true
    };
    return requestPromise(options);
};

AAHelper.prototype.postAuthorAnalyticsData = function(access_token,params) {

    console.log("[AAHelper.postAuthorAnalyticsData] STARTED: ");

    var auth_key = "Bearer " + access_token

    var headers = {
        "Authorization": AUTHORIZATION_KEY,
        "CSRF-Token": access_token,
        "Cache-Control": "no-cache"
    }

    console.log("[AAHelper.postAuthorAnalyticsData] STARTED: params.pageName: "+params.pageName);
    console.log("[AAHelper.postAuthorAnalyticsData] STARTED: params.eVar1: "+params.eVar1);
    console.log("[AAHelper.postAuthorAnalyticsData] STARTED: params.eVar2: "+params.eVar2);

    var options = {
        method: 'POST',
        headers: headers,
        uri: ENDPOINT_AUTHOR+ANALYTICS_SERVICE_ENDPOINT+'?pagename='+params.pageName+'&eVar1='+params.eVar1+'&eVar2='+params.eVar2+'&eVar3='+params.eVar3+'prop1=Hello'
    };
    return requestPromise(options);
};

AAHelper.prototype.getAnalyticsCredentials = function() {
    console.log("[AAHelper.getAnalyticsCredentials] STARTED:");

    return requestPromise(authOptions);
};

AAHelper.prototype.postAnalytics = function(analyticsData) {
    console.log("[AAHelper.postAnalytics] STARTED:");

    console.log("[AAHelper.postAnalytics] analyticsData.pageName: ",analyticsData.pageName);

    var options = {
        method: 'POST',
        uri: aaconfig.analytics.endpointurl,
        form: {
            "ipAddress":"31.48.147.227",
            "pageName": analyticsData.pageName,
            "channel": "Tests",
            "prop1": "Alexa-one",
            "prop2": "alexa-two",
            "events": "event1",
            "evar1": analyticsData.eVar1,
            "evar2": analyticsData.eVar2,
            "eVar3": analyticsData.eVar3
        },
        "strictSSL": false,
        "json": true,
        "timeout": 50000
    };

    /*var options = {
        url: aaconfig.analytics.endpointurl,
        headers: {
            'Authorization': 'Bearer ' + token
        },
        body:  {
            "reportDescription":{
            "reportSuiteID":"almaTheMalkins",
            "dateFrom":"5 minutes ago",
            "dateTo":"now",
            "metrics":[
                {
                    "id":"instances"
                }
            ],
            "elements":[
                {
                "id":"product",
                "top":"15",
                "everythingElse":"false"
                }
            ],
            "source":"realtime",
            }
        },
        json: true
    };*/


    return requestPromise(options);
};

module.exports = AAHelper;