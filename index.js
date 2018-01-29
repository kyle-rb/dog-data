var Alexa = require('alexa-sdk');
var APP_ID = "amzn1.ask.skill.<skill id here>";
var TABLE_NAME = "DOG_DATA_ATTRIBUTES";
var DATA_POINTS = {
  FEED: { attribute: 'fedTime',      awaiting: 'shouldFeed' },
  MED:  { attribute: 'medGivenTime', awaiting: 'shouldGiveMed' },
  OUT:  { attribute: 'letOutTime',   awaiting: 'shouldLetOut' },
  WALK: { attribute: 'walkedTime',   awaiting: 'shouldWalk' }
};

var welcomePrompt = "I can remember when you last fed, walked, let out, or gave your dog medication.";
var welcomeReprompt = "Ask me about one of those things, or tell me that you've done one of them.";

exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context, callback);
  alexa.appId = APP_ID;
  alexa.dynamoDBTableName = TABLE_NAME;
  alexa.registerHandlers(handlers);
  alexa.execute();
};

var handlers = {
  'LaunchRequest': function() {
    this.emit(':ask', welcomePrompt, welcomeReprompt);
  },
  'SessionEndedRequest': function () {
    this.attributes['awaiting'] = undefined;
    this.emit(':saveState', true);
  },


  'IFed': function() {
    var dogName = "the dog"; //this.event.request.intent.slots.dogName.value || "the dog";
    this.attributes[DATA_POINTS.FEED.attribute] = Date.now();
    this.emit(':tell', "OK, I'll remember that you fed " + dogName + ".");
  },
  'IGaveMedication': function() {
    var dogName = "the dog"; //this.event.request.intent.slots.dogName.value || "the dog";
    this.attributes[DATA_POINTS.MED.attribute] = Date.now();
    this.emit(':tell', "OK, I'll remember that you gave medication to " + dogName + ".");
  },
  'ILetOut': function() {
    var dogName = "the dog"; //this.event.request.intent.slots.dogName.value || "the dog";
    this.attributes[DATA_POINTS.OUT.attribute] = Date.now();
    this.emit(':tell', "OK, I'll remember that you let out " + dogName + ".");
  },
  'IWalked': function() {
    var dogName = "the dog"; //this.event.request.intent.slots.dogName.value || "the dog";
    this.attributes[DATA_POINTS.WALK.attribute] = Date.now();
    this.emit(':tell', "OK, I'll remember that you walked " + dogName + ".");
  },


  'DidIFeed': function() {
    var dogName = "the dog"; //this.event.request.intent.slots.dogName.value || "the dog";
    var timeFed = this.attributes[DATA_POINTS.FEED.attribute];
    if (timeFed === undefined) {
      this.attributes['awaiting'] = DATA_POINTS.FEED.awaiting;
      this.emit(':ask', "You haven't told me about feeding " + dogName + " yet. Are you going to feed " + dogName + " now?");
    }
    else {
      var hoursDifference = (((Date.now() - timeFed) / 1000) / 60) / 60;
      var timePassedString = getTimePassedString(hoursDifference);
      if (hoursDifference >= 4) {
        this.attributes['awaiting'] = DATA_POINTS.FEED.awaiting;
        this.emit(':ask', "You last fed " + dogName + timePassedString + ". Are you going to feed " + dogName + " now?");
      }
      else {
        this.emit(':tell', "You last fed " + dogName + timePassedString + ".");
      }
    }
  },
  'DidIGiveMedication': function() {
    var dogName = "the dog"; //this.event.request.intent.slots.dogName.value || "the dog";
    var timeFed = this.attributes[DATA_POINTS.MED.attribute];
    if (timeFed === undefined) {
      this.attributes['awaiting'] = DATA_POINTS.MED.awaiting;
      this.emit(':ask', "You haven't told me about giving medication to " + dogName + " yet. Are you going to give medication to " + dogName + " now?");
    }
    else {
      var hoursDifference = (((Date.now() - timeFed) / 1000) / 60) / 60;
      var timePassedString = getTimePassedString(hoursDifference);
      if (hoursDifference >= 4) {
        this.attributes['awaiting'] = DATA_POINTS.MED.awaiting;
        this.emit(':ask', "You last gave medication to " + dogName + timePassedString + ". Are you going to give medication to " + dogName + " now?");
      }
      else {
        this.emit(':tell', "You last gave medication to " + dogName + timePassedString + ".");
      }
    }
  },
  'DidILetOut': function() {
    var dogName = "the dog"; //this.event.request.intent.slots.dogName.value || "the dog";
    var timeFed = this.attributes[DATA_POINTS.OUT.attribute];
    if (timeFed === undefined) {
      this.attributes['awaiting'] = DATA_POINTS.OUT.awaiting;
      this.emit(':ask', "You haven't told me about letting out " + dogName + " yet. Are you going to let out " + dogName + " now?");
    }
    else {
      var hoursDifference = (((Date.now() - timeFed) / 1000) / 60) / 60;
      var timePassedString = getTimePassedString(hoursDifference);
      if (hoursDifference >= 4) {
        this.attributes['awaiting'] = DATA_POINTS.OUT.awaiting;
        this.emit(':ask', "You last let out " + dogName + timePassedString + ". Are you going to let out " + dogName + " now?");
      }
      else {
        this.emit(':tell', "You last let out " + dogName + timePassedString + ".");
      }
    }
  },
  'DidIWalk': function() {
    var dogName = "the dog"; //this.event.request.intent.slots.dogName.value || "the dog";
    var timeFed = this.attributes[DATA_POINTS.WALK.attribute];
    if (timeFed === undefined) {
      this.attributes['awaiting'] = DATA_POINTS.WALK.awaiting;
      this.emit(':ask', "You haven't told me about walking " + dogName + " yet. Are you going to walk " + dogName + " now?");
    }
    else {
      var hoursDifference = (((Date.now() - timeFed) / 1000) / 60) / 60;
      var timePassedString = getTimePassedString(hoursDifference);
      if (hoursDifference >= 4) {
        this.attributes['awaiting'] = DATA_POINTS.WALK.awaiting;
        this.emit(':ask', "You last walked " + dogName + timePassedString + ". Are you going to walk " + dogName + " now?");
      }
      else {
        this.emit(':tell', "You last walked " + dogName + timePassedString + ".");
      }
    }
  },


  'AMAZON.YesIntent': function() {
    var response = "";
    switch (this.attributes['awaiting']) {
      case DATA_POINTS.FEED.awaiting:
        this.attributes[DATA_POINTS.FEED.attribute] = Date.now();
        response = "OK, I'll remember that you fed the dog.";
        break;
      case DATA_POINTS.MED.awaiting:
        this.attributes[DATA_POINTS.MED.attribute] = Date.now();
        response = "OK, I'll remember that you gave medication to the dog.";
        break;
      case DATA_POINTS.OUT.awaiting:
        this.attributes[DATA_POINTS.OUT.attribute] = Date.now();
        response = "OK, I'll remember that you let out the dog.";
        break;
      case DATA_POINTS.WALK.awaiting:
        this.attributes[DATA_POINTS.WALK.attribute] = Date.now();
        response = "OK, I'll remember that you walked the dog.";
        break;
      default:
        response = "Sorry, I'm not sure what you meant by that.";
    }
    this.attributes['awaiting'] = undefined;
    this.emit(':tell', response);
  },
  'AMAZON.NoIntent': function() {
    var response = "";
    switch (this.attributes['awaiting']) {
      case DATA_POINTS.FEED.awaiting:
      case DATA_POINTS.MED.awaiting:
      case DATA_POINTS.OUT.awaiting:
      case DATA_POINTS.WALK.awaiting:
        response = "OK";
        break;
      default:
        response = "Sorry, I'm not sure what you meant by that.";
    }
    this.attributes['awaiting'] = undefined;
    this.emit(':tell', response);
  },
  'AMAZON.HelpIntent': function() {
    this.attributes['awaiting'] = undefined;
    this.emit(':ask', welcomePrompt, welcomeReprompt);
  },
  'AMAZON.CancelIntent': function() {
    this.emit(':tell', "");
  },
  'AMAZON.StopIntent': function() {
    this.emit(':tell', "");
  },
  'Unhandled': function() {
    this.emit(':ask', "Sorry, I'm not sure what you meant by that.");
  }
};

function getTimePassedString(hoursDifference) {
  var timePassedString;
  if (hoursDifference >= 45) {
    " about " + Math.round(hoursDifference / 24) + " days ago";
  }
  else if (hoursDifference < 1) {
    timePassedString = " less than an hour ago";
  }
  else if (hoursDifference < 1.5) {
    timePassedString = " about an hour ago"; // singular
  }
  else {
    timePassedString = " about " + Math.round(hoursDifference) + " hours ago"; // plural
  }
  return timePassedString;
}
