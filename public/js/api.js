
var key = "YOUR_KEY_HERE";
var token = "YOUR_TOKEN_HERE";

var sendRequest = function(url, method, ){
  return fetch(url,
    {
    cache: 'no-cache',
    method: method,
    mode: 'cors',
    redirect: 'follow',
    referrer: 'no-referrer'
  })
}

var createNewCard = function(listId, card){

  sendRequest(`https://api.trello.com/1/cards?idList=${listId}&key=${key}&token=${token}&name=${card.name}`, 'post')
  .then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    console.log(myJson);
  });

};

var closeExistingCard = function(card){

  sendRequest(`https://api.trello.com/1/cards/${card.id}?key=${key}&token=${token}&closed=true`, 'put')
  .then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    console.log(myJson);
  });

};

var moveCardToAnotherList = function(card, listId){

  sendRequest(`https://api.trello.com/1/cards/${card.id}/${listId}?key=${key}&token=${token}&closed=true`, 'put')
  .then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    console.log(myJson);
  });

};
