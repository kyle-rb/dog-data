var Alexa = require('alexa-sdk');
var APP_ID = "amzn1.ask.skill.<skill id here>";
var TABLE_NAME = "DOG_DATA_ATTRIBUTES";

var ACTIONS = { // four different actions with different data
  FEED: {
    TIME: 'fedTime', // name of attribute for storing time in the database
    AWAITING: 'shouldFeed', // value for 'awaiting' attribute in the database
    STRING: { // for inserting into response strings, with different tenses
      PRESENT: 'feed',
      PAST: 'fed',
      ING: 'feeding',
    },
  },
  MED: {
    TIME: 'medGivenTime',
    AWAITING: 'shouldGiveMed',
    STRING: {
      PRESENT: 'give medication to',
      PAST: 'gave medication to',
      ING: 'giving medication to',
    },
  },
  OUT: {
    TIME: 'letOutTime',
    AWAITING: 'shouldLetOut',
    STRING: {
      PRESENT: 'let out',
      PAST: 'let out',
      ING: 'letting out',
    },
  },
  WALK: {
    TIME: 'walkedTime',
    AWAITING: 'walkedTime',
    STRING: {
      PRESENT: 'walk',
      PAST: 'walked',
      ING: 'walking',
    },
  },
};



var welcomePrompt = "I can remember when you last fed, walked, let out, or gave your dog medication.";
var welcomeReprompt = "Ask me about one of those things, or tell me when you've done one of them.";

exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context, callback);
  alexa.appId = APP_ID;
  alexa.dynamoDBTableName = TABLE_NAME;
  alexa.registerHandlers(handlers);
  alexa.execute();
};

var handlers = {
  // General startup and shutdown intents.
  'LaunchRequest': function() {
    this.emit(':ask', welcomePrompt, welcomeReprompt);
  },
  'SessionEndedRequest': function () {
    this.attributes['awaiting'] = null;
    this.emit(':saveState', true);
  },


  // These are Assert Intents, asserting that some action has been done.
  // If one of these is called, call the general assert handler with the appropriate action.
  'IFed':            function() { handleAssertIntent(ACTIONS.FEED, this); },
  'IGaveMedication': function() { handleAssertIntent(ACTIONS.MED, this);  },
  'ILetOut':         function() { handleAssertIntent(ACTIONS.OUT, this);  },
  'IWalked':         function() { handleAssertIntent(ACTIONS.WALK, this); },

  // These are Ask Intents, asking whether some action has been done.
  // If one of these is called, call the general ask handler with the appropriate action.
  'DidIFeed':           function() { handleAskIntent(ACTIONS.FEED, this); },
  'DidIGiveMedication': function() { handleAskIntent(ACTIONS.MED, this);  },
  'DidILetOut':         function() { handleAskIntent(ACTIONS.OUT, this);  },
  'DidIWalk':           function() { handleAskIntent(ACTIONS.WALK, this); },


  // If the user says "Yes", figure out what they were responding to, and mark that action as having
  //   been done at the current time.
  'AMAZON.YesIntent': function() {
    var action, response;
    switch (this.attributes['awaiting']) {
      case ACTIONS.FEED.AWAITING: action = ACTIONS.FEED; break;
      case ACTIONS.MED.AWAITING: action = ACTIONS.MED; break;
      case ACTIONS.OUT.AWAITING: action = ACTIONS.OUT; break;
      case ACTIONS.WALK.AWAITING: action = ACTIONS.WALK; break;
      default: action = null;
    }
    if (action) {
      this.attributes[action.TIME] = Date.now();
      response = "OK, I'll remember that you " + action.STRING.PAST + " the dog.";
    }
    else {
      response = "Sorry, I'm not sure what you meant by that.";
    }
    this.attributes['awaiting'] = null;
    this.emit(':tell', response);
  },
  // If the user says "No", as long as they were responding to something, just respond "OK".
  'AMAZON.NoIntent': function() {
    var response = "";
    switch (this.attributes['awaiting']) {
      case ACTIONS.FEED.AWAITING:
      case ACTIONS.MED.AWAITING:
      case ACTIONS.OUT.AWAITING:
      case ACTIONS.WALK.AWAITING:
        response = "OK";
        break;
      default:
        response = "Sorry, I'm not sure what you meant by that.";
    }
    this.attributes['awaiting'] = null;
    this.emit(':tell', response);
  },


  // Various other standard intents.
  'AMAZON.HelpIntent': function() {
    this.attributes['awaiting'] = null;
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



function handleAssertIntent(action, alexaContext) { // handles intents like "I fed the dog"
  var timeLastDone = alexaContext.attributes[action.TIME];
  var timeReminder = "";
  if (timeLastDone !== undefined) { // add extension with time 
    var hoursDifference = (((Date.now() - timeLastDone) / 1000) / 60) / 60;
    timeReminder = " The last time you did so was " + getTimePassedString(hoursDifference) + ".";
  }
  alexaContext.attributes[action.TIME] = Date.now();
  alexaContext.emit(':tell', "OK, I'll remember that you " + action.STRING.PAST + " the dog." + timeReminder);
}

function handleAskIntent(action, alexaContext) { // handles intents like "did I feed the dog?"
  var timeLastDone = alexaContext.attributes[action.TIME];
  if (timeLastDone === undefined) {
    alexaContext.attributes['awaiting'] = action.AWAITING;
    alexaContext.emit(':ask', "You haven't told me about " + action.STRING.ING + " the dog yet. Are you going to " + action.STRING.PRESENT + " the dog now?");
  }
  else {
    var hoursDifference = (((Date.now() - timeLastDone) / 1000) / 60) / 60;
    var timePassedString = getTimePassedString(hoursDifference);
    if (hoursDifference >= 4) {
      alexaContext.attributes['awaiting'] = AWAITING.FEED;
      alexaContext.emit(':ask', "You last " + action.STRING.PAST + " the dog " + timePassedString + ". Are you going to " + action.STRING.PRESENT + " the dog now?");
    }
    else {
      alexaContext.emit(':tell', "You last " + action.STRING.PAST + " the dog " + timePassedString + ".");
    }
  }
}


// Helper function for constructing a string with 'hours ago' or 'days ago', etc.
function getTimePassedString(hoursDifference) {
  var timePassedString;
  if (hoursDifference >= 45) {
    timePassedString = "about " + Math.round(hoursDifference / 24) + " days ago";
  }
  else if (hoursDifference < 1) {
    timePassedString = "less than an hour ago";
  }
  else if (hoursDifference < 1.5) {
    timePassedString = "about an hour ago"; // singular
  }
  else { // between 2 and 44
    timePassedString = "about " + Math.round(hoursDifference) + " hours ago"; // plural
  }
  return timePassedString;
}
