/* global TrelloPowerUp */

// we can access Bluebird Promises as follows
var Promise = TrelloPowerUp.Promise;


var WHITE_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-white.svg';

var shortListedTasks = [];
var todoListId;
var boardButtonCallback = function (t, opts) {
  console.log('Someone clicked the board button');
  return t.lists('all')
    .then(function (lists) {
      console.log(JSON.stringify(lists, null, 2));

      lists.forEach((list) => {
        if(list.name.indexOf("Todo") != -1){
          console.log("TODO LIST - " + list.name);
          todoListId = list.id;
        }
      }

    //get first cards from all GOAL lists
      lists.forEach((list) => {
        if(list.name.indexOf("GOAL") != -1){
          console.log("GOAL LIST - " + list.name);
          var card = list.cards.shift();

          //shortListedTasks.push(card);
          //close the card in this list
          //closeExistingCard(card.id);
          if(todoListId){
            moveCardToAnotherList(card, todoListId);
            console.log(`Moved ${card.name} to List[${list.name}]..`);
          }

        }
      /*  else if(list.name.indexOf("Todo") != -1){
          console.log("TODO LIST - " + list.name);
          todoListId = list.id;
        }*/
      });

    //create new cards from collected cards
    shortListedTasks.forEach((card) => {
      createNewCard(todoListId,card);
      })
    });

};

// We need to call initialize to get all of our capability handles set up and registered with Trello
TrelloPowerUp.initialize({
  // NOTE about asynchronous responses
  // If you need to make an asynchronous request or action before you can reply to Trello
  // you can return a Promise (bluebird promises are included at TrelloPowerUp.Promise)
  // The Promise should resolve to the object type that is expected to be returned
  'board-buttons': function(t, options){
    return [{
      // we can either provide a button that has a callback function
      // that callback function should probably open a popup, overlay, or boardBar
      icon: WHITE_ICON,
      text: 'Get My Tasks',
      callback: boardButtonCallback
    }];
  },

  /*

      🔑 Authorization Capabiltiies 🗝

      The following two capabilities should be used together to determine:
      1. whether a user is appropriately authorized
      2. what to do when a user isn't completely authorized

  */
  'authorization-status': function(t, options){
    // Return a promise that resolves to an object with a boolean property 'authorized' of true or false
    // The boolean value determines whether your Power-Up considers the user to be authorized or not.

    // When the value is false, Trello will show the user an "Authorize Account" options when
    // they click on the Power-Up's gear icon in the settings. The 'show-authorization' capability
    // below determines what should happen when the user clicks "Authorize Account"

    // For instance, if your Power-Up requires a token to be set for the member you could do the following:
    return t.get('member', 'private', 'token')
    // Or if you needed to set/get a non-Trello secret token, like an oauth token, you could
    // use t.storeSecret('key', 'value') and t.loadSecret('key')
    .then(function(token){
      if(token){
        return { authorized: true };
      }
      return { authorized: false };
    });
    // You can also return the object synchronously if you know the answer synchronously.
  },
  'show-authorization': function(t, options){
    // Returns what to do when a user clicks the 'Authorize Account' link from the Power-Up gear icon
    // which shows when 'authorization-status' returns { authorized: false }.

    // If we want to ask the user to authorize our Power-Up to make full use of the Trello API
    // you'll need to add your API from trello.com/app-key below:

    let trelloAPIKey = process.env.TRELLO_API_KEY;
    // This key will be used to generate a token that you can pass along with the API key to Trello's
    // RESTful API. Using the key/token pair, you can make requests on behalf of the authorized user.

    // In this case we'll open a popup to kick off the authorization flow.
    if (trelloAPIKey) {
      return t.popup({
        title: 'My Auth Popup',
        args: { apiKey: trelloAPIKey }, // Pass in API key to the iframe
        url: './authorize.html', // Check out public/authorize.html to see how to ask a user to auth
        height: 140,
      });
    } else {
      console.log("🙈 Looks like you need to add your API key to the project!");
    }
  }
});

console.log('Loaded by: ' + document.referrer);
