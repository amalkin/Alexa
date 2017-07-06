'use strict';
var requestPromise = require('request-promise');
var acs = { 
            host: 'https://alastairmalkin-mkt-dev1-m.campaign-demo.adobe.com/rest/mcalastairmalkin/EVTAlexaMalkins',
            authorization: 'Basic bWNQdXNoOg==',
            defaultemail: 'no-reply@adobe.com'
};
function ACSHelper() {
}

ACSHelper.prototype.setEmail = function(email) {
    console.log('START - [CaaSHelper.setEmail]');
    if(email){
        acs.defaultemail = email;
    }
};

ACSHelper.prototype.postEmailContent = function() {
    console.log("[ACSHelper.postEmailContent] STARTED:" + acs.defaultemail);
    var payload = {
        "email": acs.defaultemail,
        "ctx": {
            "username":"Alastair Malkin",
            "message":"A custom message can go here"
        }
    }

    var headers = {
        "Authorization": acs.authorization,
        "content-type": "application/json",
        "Cache-Control": "no-cache"
    }

    var options = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
        uri: acs.host
    };


    return requestPromise(options);
};

module.exports = ACSHelper;