var getDailyTasks = function(lists){
  var shortListedTasks = [];
  var todoListId;
  var maxHoursToWork = 4;
  var usedHours = 0;

  //get first cards from all GOAL lists
    lists.forEach((list) => {
      if(list.name.indexOf("GOAL") != -1){
        console.log("GOAL LIST - " + list.name);

        //check if list is not empty
        if(list.cards.length > 0){

          var card = list.cards.shift();

          var hoursToWork = getHoursFromTask(card);
          console.log("hoursToWork - " + hoursToWork);
          if(usedHours > hoursToWork){
             usedHours -= hoursToWork;
             //add card to the task list
             shortListedTasks.push(card);
             //close the card in this list
             closeExistingCard(card);
          }
        }
      }
      else if(list.name.indexOf("Todo") != -1){
        console.log("TODO LIST - " + list.name);
        todoListId = list.id;
      }
    });

  //create new cards from collected cards
  shortListedTasks.forEach((card) => {
    createNewCard(todoListId,card);
    })

}

var getHoursFromTask = function(card){
  return /::([0-9].?[0-9]?)::/g.exec(card.name)[1];
}

var getPriorityFromList = function(list){
  return /\(\(([0-9])\)\)/g.exec(card.name)[1];
}
