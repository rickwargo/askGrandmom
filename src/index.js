/**
 * App ID for the skill
 */
var APP_ID = "amzn1.echo-sdk-ams.app.64f5259f-6242-4e03-8104-5c4a1ad3f26a";

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill'),
    desires = require('./desires');

/**
 * AskGrandmom is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var AskGrandmom = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
AskGrandmom.prototype = Object.create(AlexaSkill.prototype);
AskGrandmom.prototype.constructor = AskGrandmom;

AskGrandmom.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("AskGrandmom onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

AskGrandmom.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("AskGrandmom onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);

    response.ask("You can ask me to ask Grandmom for anything.", "What do you want me to ask Grandmom?");
};

/**
 * Overridden to show that a subclass can override this function to teardown session state.
 */
AskGrandmom.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("AskGrandmom onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

AskGrandmom.prototype.intentHandlers = {
    "AskGrandmomIntent": function (intent, session, response) {
        handleAskGrandmomIntent(intent, session, response);
    },

    "AskForMoneyIntent": function (intent, session, response) {
        handleAskForMoneyIntent(intent, session, response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("You can ask me to ask Grandmom for anything.", "What do you want me to ask Grandmom?");
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Grandmom loves you so much. Goodbye.";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Okay. Canceled.";
        response.tell(speechOutput);
    }
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the AskGrandmom skill.
    var askGrandmom = new AskGrandmom();
    askGrandmom.execute(event, context);
};

/**
 * Gets a fun way to say yes to send feedback to the user.
 */

var WAYS_TO_SAY_YES = [
    "Grandmom said of course you can have {Something}.",
    "Grandmom would love for you to have {Something}.",
    "Grandmom said yes of course you can have {Something}.",
    "Grandmom said you can have whatever you want even {Something}.",
    "Grandmom said if it makes you happy to have {Something} then you can have it.",
    "Grandmom said absolutely!",
    "Grandmom said certainly.",
    "Grandmom said yes sweetie.",
    "Grandmom said of course sweetie."
];

function handleOfCourseYouCan(something, response) {
    var yesIndex = Math.floor(Math.random() * WAYS_TO_SAY_YES.length);
    var yes = WAYS_TO_SAY_YES[yesIndex];

    if (something == null)
        something = "that";

    // Create speech output
    var speechOutput = yes.replace("{Something}", something);
    response.tell(speechOutput);
}

function handleAskGrandmomIntent(intent, session, response) {
    var somethingSlot = intent.slots.Something,
        somethingName;
    if (somethingSlot && somethingSlot.value){
        somethingName = somethingSlot.value.toLowerCase();
    }

    var desireResponse = desires[somethingName];

    if (desireResponse) {
        if (somethingName.indexOf('money') > -1) {
            response.ask("How much would you like to ask Grandmom for?", "You can ask for some amount of dollars");
        } else {
            response.tell(desireResponse);
        }
    } else {
        handleOfCourseYouCan(somethingName, response);
    }
}

function handleAskForMoneyIntent(intent, session, response) {
    var amountStr = intent.slots.Amount;
    var monies = intent.slots.Monies;

    var amount = parseFloat(amountStr.value);

    console.log("amount: '" + amountStr.value + "'");
    console.log("monies:'" + monies.value + "'");

    if (isNaN(amount)) {
        response.ask('Sorry, I did not hear how much you wanted, please say that again', 'please say the amount again');
        return;
    }

    switch (monies.value) {
        case "dollar":
        case "dollars":
        case "silver dollar":
        case "silver dollars":
            break;
        case "half dollar":
        case "half dollars":
            amount = amount * 0.50;
            break;
        case "quarter":
        case "quarters":
            amount = amount * 0.25;
            break;
        case "dime":
        case "dimes":
            amount = amount * 0.10;
            break;
        case "nickel":
        case "nickels":
            amount = amount * 0.05;
            break;
        case "penny":
        case "pennies":
            amount = amount * 0.01;
            break;
        default:
            return handleOfCourseYouCan(amountStr.value + ' ' + monies.value, response);
    }

    if (amount <= 100.00) {
        response.tell('Grandmom said she would love to give you ' + amount.toString() + ' dollar' + (amount == 1 ? '' : 's'));
    }
    else {
        response.ask('Grandmom said she does not have that amount of money to give you. How much would you like to ask Grandmom for?');
    }
}
