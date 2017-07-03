// There are three sections, Text Strings, Skill Code, and Helper Function(s).
// You can copy and paste the entire file contents as the code for a new Lambda function,
// or copy & paste section #3, the helper function, to the bottom of your existing Lambda code.

 // 1. Text strings =====================================================================================================
 //    Modify these strings and messages to change the behavior of your Lambda function

 var speechOutput;
 var reprompt;
 var welcomeOutput = "Welcome to Holidays.";
 var welcomeReprompt = "Let me know when you are ready?";

 // 2. Skill Code =======================================================================================================

'use strict';
var _ = require('lodash');
var Alexa = require('alexa-sdk');
var AWS = require('aws-sdk');

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

var caasHolidays = undefined;
var duration = undefined; //weeks
var extraActivity = undefined;

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
                this.emitWithState("searchHoliday");
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

// handle "holidays" intent
var startHolidaysHandlers = Alexa.CreateStateHandler(states.START_MODE, {
    'NewSession': function () {
        console.log("Intent NewSession - startHolidaysHandlers");
    },
    'searchHoliday': function() {
        console.log("Intent searchHoliday - startHolidaysHandlers");

        // AAM
        //aamHelper.getCRSFToken().then(function(token) {
        aamHelper.getUserDetails().then((userDetail) => {
            aamHelper.postVisitorIDToAAM(userDetail.visitorId).then((response) => {
                    console.log("[startHolidaysHandlers.postVisitorIDToAAM] AAM data saved: " + JSON.stringify(response));
                    var speechOutput = "If you are interested in a beach holiday, say beach. If you are interested in a city holiday, say city. If you are interested in both, say both.";
                    if(this.attributes["debug"] == "yes") {
                        console.log("Debugging Alexa ask - " + speechOutput);
                        this.emitWithState("holidayType");
                    } else{
                        this.emit(":ask", speechOutput, speechOutput);
                    }
                },
                (err) => {
                    console.log("requestedFinancialService.postVisitorIDToAAM: ERROR: "+err);
                });

        },
        (err) => {
            console.log("startHolidaysHandlers.getUserDetails: ERROR: "+err);
        });

        //}).catch(function(err) {
          //  console.log("startHolidaysHandlers.getCRSFToken: ERROR: "+err.statusCode);
        //});
    },
    'holidayType': function() {
        console.log("Intent holidayType - startHolidaysHandlers");
        var speechOutput = "How long would you like to stay for?";
        if(this.attributes["debug"] == "yes") {
            console.log("Debugging Alexa ask - " + speechOutput);
            this.emitWithState("durationStay");
        } else{
            this.emit(":ask", speechOutput, speechOutput);
        }
    },
    'durationStay': function() {
        console.log("Intent durationStay - startHolidaysHandlers");
        var speechOutput = caasHolidays["thailand-holiday"]["generalInfo"];
        if(this.attributes["debug"] == "yes") {
            console.log("Debugging Alexa ask - " + speechOutput);
            var durationOfStay =  this.event.request.intent.slots.duration.value;
            duration = durationOfStay;
            this.emitWithState("extraActivity");
        } else{
            var filledSlots = delegateSlotCollection.call(this);
            console.log("current dialogState - test : "+this.event.request.dialogState);
            if(this.event.request.dialogState == "COMPLETED"){
                var durationOfStay =  this.event.request.intent.slots.duration.value;
                duration = durationOfStay;
                this.emit(":ask", speechOutput, speechOutput);
            }
        }
    },
    'extraActivity': function() {
        console.log("Intent extraActivity - startHolidaysHandlers");
        var caasPathExtraActivity = caasHolidays["thailand-holiday"]["extraActivities"][0]["path"] + ".caas.json";
        var destination = caasHolidays["thailand-holiday"]["destination"];
        caasDataHelper.getCAASExtraActivity(caasPathExtraActivity).then((acivity) => {
            extraActivity = acivity;
            var totalCost = (duration * 5) * caasHolidays["thailand-holiday"]["costPerNight"] * extraActivity["offerCost"];
            var speechOutput = "our price for " + (duration * 5) + " nights " + " in " + destination + " and " + extraActivity["offerTitle"] + " is " + totalCost + " dollars.";
            if(this.attributes["debug"] == "yes") {
                console.log("Debugging Alexa ask - " + speechOutput);
                this.emitWithState("moreInfo");
            } else{
                this.emit(":ask", speechOutput, speechOutput);
            }
        },
        (err) => {
            console.log("Can't get caas extra activity" + err);
            this.emit(':tell', "Can't get caas extra activity", "Can't get caas extra activity");
        });
    },
    'moreInfo': function() {
        console.log("Intent moreInfo - startHolidaysHandlers");
        var speechOutput = "A link has been sent to your registered phone";
        acsHelper.postEmailContent().then((result) => {
            console.log("ACS Email Success: " + JSON.stringify(result));
            if(this.attributes["debug"] == "yes") {
                console.log("Debugging Alexa ask - " + speechOutput);
            } else{
                this.emit(":tell", speechOutput, speechOutput);
            }
        },
        (err) => {
            console.log("Can't send acs email" + err);
        });
    },
    'SessionEndedRequest': function () {
        console.log('Intent SessionEndedRequest startHolidaysHandlers - session ended!');
    },
    'AMAZON.StopIntent': function(){
        this.emit(':tell', "Bye - Holidays");
    },
    'Unhandled': function() {
        this.handler.state = states.START_MODE;
        console.log("Intent Unhandled - startHolidaysHandlers");
        console.log(this.event);
        this.emit(':ask', "Unhandled startHolidaysHandlers", "Unhandled startHolidaysHandlers");
    }
});

exports.handler = (event, context) => {
    var alexa = Alexa.handler(event, context);
    console.log("appId: " + event.session.application.applicationId);
    alexa.appId = event.session.application.applicationId;
    APP_ID = alexa.appId;
    caasDataHelper.setAEMEndPoint(process.env.aemPublish);
    acsHelper.setEmail(process.env.acsMail);
    console.log("Environment Variable aemPublish: " + JSON.stringify(process.env.aemPublish));
    console.log("Environment Variable acsMail: " + JSON.stringify(process.env.acsMail));
    alexa.registerHandlers(newSessionHandlers, startHolidaysHandlers);
    alexa.execute();
};

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