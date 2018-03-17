
var getDailyTasks = function(rescheduledTasks,lists){
  var rescheduledTaskList = rescheduledTasks.slice();
  var goals = [];
  var hoursToWorkToday = 4;


  var shortListedTasks = [];
  var todoListId;
  var maxHoursToWork = 4;

  //get first cards from all GOAL lists
    lists.forEach((list) => {
      if(list.name.indexOf("GOAL") != -1){
        console.log("GOAL LIST - " + list.name);

        goals.push(list);
      }
      else if(list.name.indexOf("Todo") != -1){
        console.log("TODO LIST - " + list.name);
        todoListId = list.id;
      }
    });

  shortListedTasks = getMyTasksForToday(rescheduledTaskList, goals, maxHoursToWork).slice();
  //create new cards from collected cards
  shortListedTasks.forEach((card) => {
    createNewCard(todoListId,card);
  });

}

/*var getDailyTasks = function(lists){

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
          if(maxHoursToWork > hoursToWork){
             maxHoursToWork -= hoursToWork;
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
*/

var getHoursFromTask = function(card){
  return /::([0-9].?[0-9]?)::/g.exec(card.name)[1];
}

var getPriorityFromList = function(list){
  return /\(\(([0-9])\)\)/g.exec(list.name)[1];
}

var getDaysToWork = function(list){
  return /\[\[([0-9,]+)\]\]/g.exec(list.name)[1];
}

//Layer 1
function calculateNetTimeToWork(rescheduledTaskList, hoursToWorkToday){
  console.log("Hours To Work at start- " + hoursToWorkToday);
  console.log("Rexcheduled List- " + JSON.stringify(rescheduledTaskList));
  rescheduledTaskList.forEach((task) => {
    hoursToWorkToday -= task.hoursToFinish;
    console.log("Hours To Finish - " + task.hoursToFinish);
    console.log("Hours To Work - " + hoursToWorkToday);
  });

  return hoursToWorkToday;
  //NOTE : hoursToWorkToday can be negative if hoursToWorkToday < hoursToWorkYesterday
  //with  many rescheduled tasks from yesterday
}

//Layer 2
function getActiveGoals(listOfGoals){
  let activeGoals = [];
  listOfGoals.forEach((goal) => {
    if(/<<ACTIVE>>/g.exec(goal.name)[1]){
      goal.priority = getPriorityFromList(goal.name)[1];
      activeGoals.push(goal);
    }
  });

  return activeGoals;
}

function sortActiveGoals(activeGoals){
  return activeGoals.sort(sortNum);
}

function sortNum(a, b){
  return a.priority - b.priority;
}

//Layer 3
function getTasksFromActiveGoals(rescheduledTaskList, listOfActiveGoals, remainingHoursToWorkToday){
  //copy left over tasks from yesterday
  let tasksForToday = rescheduledTaskList.slice();

  //check while we still have time left to work today
  while(remainingHoursToWorkToday > 0 && listOfActiveGoals.length > 0){

    //If yes, lets go through each goal
    listOfActiveGoals.forEach((activeGoal) => {
     console.log("Active Goals ", JSON.stringify(listOfActiveGoals) )
      //check if goal has tasks
      if(activeGoal.cards.length > 0){
        //If yes, get the first task
        let task = activeGoal.cards.shift();
        //can we work on this task today?
        if(getDaysToWork(activeGoal).includes(getToday())){
          //If yes, check if we can finish task in our remaining work time
          if(parseFloat(getHoursFromTask(task)) <= remainingHoursToWorkToday){
            //If yes, add it in today's task list
          /**********************************************/
            //close the card in this list
            closeExistingCard(task);
          /**********************************************/
            tasksForToday.push(task);
            //reduce remaining hours
            remainingHoursToWorkToday -= task.hoursToFinish;
          }
        }
      }
      //if goal has no tasks
      else {
        console.log(activeGoal.id);
        //remove it from list
        listOfActiveGoals.splice(listOfActiveGoals.indexOf(activeGoal), 1);
      }

    });
  }

  return tasksForToday;
}

function getToday(){
  return moment(new Date()).day();
}

//Here we go...
function getMyTasksForToday(rescheduledTaskList, listOfGoals, hoursToWorkToday){

  //STEP 1
  let remainingHoursToWorkToday = calculateNetTimeToWork(rescheduledTaskList, hoursToWorkToday);
  //STEP 2
  let listOfActiveGoals = getActiveGoals(listOfGoals).slice();
  sortActiveGoals(listOfActiveGoals);
  //STEP 3
  let tasksForToday = getTasksFromActiveGoals(rescheduledTaskList, listOfActiveGoals, remainingHoursToWorkToday).slice();
  console.log("Today's Tasks - ", JSON.stringify(tasksForToday));
  return tasksForToday;
}
