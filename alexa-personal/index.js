// There are three sections, Text Strings, Skill Code, and Helper Function(s).
// You can copy and paste the entire file contents as the code for a new Lambda function,
// or copy & paste section #3, the helper function, to the bottom of your existing Lambda code.

 // 1. Text strings =====================================================================================================
 //    Modify these strings and messages to change the behavior of your Lambda function

 var speechOutput;
 var reprompt;
 var welcomeOutput = "Welcome to The Malkins.";
 var welcomeReprompt = "Let me know when you are ready?";

 // 2. Skill Code =======================================================================================================

'use strict';
var _ = require('lodash');
var Alexa = require('alexa-sdk');
var AWS = require('aws-sdk');

// Firebase connectivity
var firebase = require("firebase-admin");
var serviceAccount = require("./config/themalkins-5de0c-firebase-adminsdk-lielv-ec38cb4669.json");
var fbconfig = require('./config/fb_config');

var APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).
var states = {
    START_MODE: "START_MODE"
};

var CaaSHelper = require('./helpers/caas_helper');
var caasDataHelper = new CaaSHelper();

var ACSHelper = require('./helpers/acs_helper');
var acsHelper = new ACSHelper();

var AAMHelper = require('./helpers/aam_helper');
var aamHelper = new AAMHelper();

var AAHelper = require('./helpers/aa_helper');
var aaHelper = new AAHelper();

var caasHolidays = undefined;
var duration = undefined; //weeks
var extraActivity = undefined;

var friends = undefined;

/*firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: fbconfig.config.DATABASE_URL
});*/
var fbConfigDetails = {
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: fbconfig.config.DATABASE_URL
};

function getFBFriends() {
    var ref = firebase.app().database().ref();
    var usersRef = ref.child('friends');
    return usersRef.orderByKey().once('value').then(function(snapshot) {
        return snapshot.val();
    });
}

exports.handler = (event, context, callback) => {
    var alexa = Alexa.handler(event, context);

    console.log("appId: " + event.session.application.applicationId);

    context.callbackWaitsForEmptyEventLoop = false;

    alexa.appId = event.session.application.applicationId;
    APP_ID = alexa.appId;

    if (firebase.apps.length == 0) {
        firebase.initializeApp(fbConfigDetails);

        var ref = firebase.app().database().ref();
        var usersRef = ref.child('friends');
        /*usersRef.orderByKey().on('value', function(snap) {
            console.log("usersRefsss: "+snap.getKey(), snap.val());
            //firebase.database().goOffline();
        });*/

        /*usersRef.orderByKey().once('value').then(function(snap) {
            console.log("usersRefsss: "+snap.getKey(), snap.val());
        }, function(error) {
            console.error(error);
        });*/

        /*theFriends = getFBFriends();
        for (friend in theFriends) {
            console.log("theFriends: "+theFriends[friend].firstname);
        }
        console.log("usersRef: "+theFriends);

        getFBFriends().then((friends) => {
            console.log("[getFBFriends] friends: ");
            for (friend in friends) {
                console.log("[getFBFriends] friends: "+friends[friend].firstname);
            }
            
        })*/


    }

    caasDataHelper.setAEMEndPoint(process.env.aemPublish);
    acsHelper.setEmail(process.env.acsMail);
    console.log("Environment Variable aemPublish: " + JSON.stringify(process.env.aemPublish));
    console.log("Environment Variable acsMail: " + JSON.stringify(process.env.acsMail));

    alexa.registerHandlers(newSessionHandlers, startMalkinsHandlers);
    alexa.execute();
};

var newSessionHandlers = {
     // This will short-cut any incoming intent or launch requests and route them to this handler.
    'NewSession': function() {
        console.log("START - newSessionHandlers");
        this.handler.state = states.START_MODE;
        
        caasDataHelper.getCAASHolidays().then((holidays) => {
            caasHolidays = holidays;
            //console.log("JSON:" + JSON.stringify(caasHolidays));
            if(this.attributes["debug"] == "yes") {
                console.log("Debugging Alexa ask - " + welcomeOutput);
                this.emitWithState("sayName");
            } else{
                this.emit(":ask", welcomeOutput, welcomeOutput);
            }
        },
        (err) => {
            console.log("Can't get caas holidays" + err);
            this.emit(':tell', "Can't get caas holidays", "Can't get caas holidays");
        });

    },
    'Unhandled': function() {
        console.log("Unhandled - newSessionHandlers");
        console.log(this.event);
        this.emit(':ask', "Unhandled newSessionHandlers", "Unhandled newSessionHandlers");
    }
};

// handle "Malkins" intent
var startMalkinsHandlers = Alexa.CreateStateHandler(states.START_MODE, {
    'NewSession': function () {
        console.log("Intent NewSession - startMalkinsHandlers");
    },
    'sayName': function() {
        console.log("Intent sayName - startMalkinsHandlers");

        getFBFriends().then((friends) => {
            console.log("[getFBFriends] friends: ");
            for (friend in friends) {
                console.log("[getFBFriends] friends: "+friends[friend].firstname);
            }
            
        })

        var theFriends = getFBFriends();
        console.log("[sayName] theFriends: "+theFriends);
        for (friend in theFriends) {
            console.log("theFriends: "+theFriends[friend].firstname);
        }

        /*var ref = firebase.app().database().ref();
        var usersRef = ref.child('friends');
        usersRef.orderByKey().on('value', function(snap) {
            console.log("usersRef: "+snap.getKey(), snap.val());
            //firebase.database().goOffline();
        });

        var callback = function (snap) {
            console.log("usersRef: "+snap.getKey(), snap.val());
        }*/
        
        

        var accessToken = this.event.session.user.accessToken;
        console.log("[sayName] Access Token: " + this.event.session.user.accessToken);
        console.log("[sayName] Access userId: " + this.event.session.user.userId);

        var name = this.event.request.intent.slots.Name.value;
        console.log("[sayName] speechOutput - " + name);

        var analyticsData = {
            ipAddress:"31.48.147.227",
            pageName: "SayNameIntent",
            channel: "Tests",
            prop1: "Alexa-one",
            prop2: "alexa-two",
            events: "event1",
            eVar1: name,
            eVar2: "",
            eVar3: "Alastair"
        };

        /*aaHelper.getCRSFToken().then(function(token) {
            console.log("[aaHelper.getCRSFToken] Analytics data token: ");
            aaHelper.postAuthorAnalyticsData(token,analyticsData)
                .then(function(response) {
                    console.log("[aaHelper.postAuthorAnalyticsData] Analytics data saved: ");
                })
                .catch(function(err) {
                    console.log("[aaHelper.postAuthorAnalyticsData] Coming here in error: "+err.statusCode);
                });

        }).catch(function(err) {
            console.log("[aaHelper.getCRSFToken] Coming here in error: "+err);
        });*/

            
        aaHelper.postAnalytics(analyticsData).then((response) => {
            console.log("[sayName.postAnalytics] AA data saved: " + JSON.stringify(response));
            
        },
        (err) => {  
            console.log("sayName.postAnalytics: ERROR: "+err);
        });




        var speechOutput = "Hello " + name + ", how are you today?";
        if(this.attributes["debug"] == "yes") {
            console.log("Debugging Alexa ask - " + speechOutput);
            this.emitWithState("moreInfo");
        } else{
            this.emit(":tell", speechOutput, speechOutput);
        }

    },
    'moreInfo': function() {
        console.log("Intent moreInfo - startMalkinsHandlers");
        var speechOutput = "An email has been sent. Enjoy!";
        acsHelper.postEmailContent().then((result) => {
            console.log("ACS Email Success: " + JSON.stringify(result));
            if(this.attributes["debug"] == "yes") {
                console.log("Debugging Alexa ask - " + speechOutput);
            } else{
                this.emit(":tell", speechOutput, speechOutput);
            }
        },
        (err) => {
            console.log("Can't send ACS email" + err);
        });
    },
    'SessionEndedRequest': function () {
        console.log('Intent SessionEndedRequest startMalkinsHandlers - session ended!');
    },
    'AMAZON.StopIntent': function(){
        this.emit(':tell', "Bye - from The Malkins");
    },
    'Unhandled': function() {
        this.handler.state = states.START_MODE;
        console.log("Intent Unhandled - startMalkinsHandlers");
        console.log(this.event);
        this.emit(':ask', "Unhandled startMalkinsHandlers", "Unhandled startMalkinsHandlers");
    }
});

//    END of Intent Handlers {} ========================================================================================
// 3. Helper Function  =================================================================================================

function delegateSlotCollection(){
  console.log("in delegateSlotCollection");
  console.log("current dialogState: "+this.event.request.dialogState);
    if (this.event.request.dialogState === "STARTED") {
      console.log("in Beginning");
      var updatedIntent=this.event.request.intent;
      //optionally pre-fill slots: update the intent object with slot values for which
      //you have defaults, then return Dialog.Delegate with this updated intent
      // in the updatedIntent property
      this.emit(":delegate", updatedIntent);
    } else if (this.event.request.dialogState !== "COMPLETED") {
      console.log("in not completed");
      // return a Dialog.Delegate directive with no updatedIntent property.
      this.emit(":delegate");
    } else {
      console.log("in completed");
      console.log("returning: "+ JSON.stringify(this.event.request.intent));
      // Dialog is now complete and all required slots should be filled,
      // so call your normal intent handler.
      return this.event.request.intent;
    }
}