'use strict';
var _ = require('lodash');
var rp = require('request-promise');

var AEM_ENDPOINT = 'https://publish964.adobedemo.com';
var headers = {Authorization: 'Basic YWRtaW46YWRtaW4='};

var HOLIDAYS_CAAS_QUERY = '/content/entities/we_holidays/holidays.caas.1.json';

function CaaSHelper() {
}

CaaSHelper.prototype.setAEMEndPoint = function(aemServer) {
    console.log('START - [CaaSHelper.setAEMEndPoint]');
    if(aemServer){
        AEM_ENDPOINT = aemServer;
    }
};

CaaSHelper.prototype.getCAASHolidays = function() {
    console.log('START - [CaaSHelper.getCAASHolidays]');
    
    var url = AEM_ENDPOINT + HOLIDAYS_CAAS_QUERY;
    var options = {
        uri: url,
        headers: headers,
        json: true // Automatically parses the JSON string in the response
    };

    return rp(options);
};

CaaSHelper.prototype.getCAASExtraActivity = function(path) {
    console.log('START - [CaaSHelper.getCAASExtraActivity]' + path);
    
    var url = AEM_ENDPOINT + path;
    var options = {
        uri: url,
        headers: headers,
        json: true // Automatically parses the JSON string in the response
    };

    return rp(options);
};

module.exports = CaaSHelper;

