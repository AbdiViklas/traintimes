// specify globals for the benefit of ESLint
/* global $, firebase, moment */

// Initialize Firebase
var config = {
  apiKey: "AIzaSyBypclwUAe-PreKQtB2qekbgsF6km5Xfvg",
  authDomain: "traintimes-71265.firebaseapp.com",
  databaseURL: "https://traintimes-71265.firebaseio.com",
  projectId: "traintimes-71265",
  storageBucket: "",
  messagingSenderId: "219479184128"
};
firebase.initializeApp(config);

var database = firebase.database();

var backgroundCount = 0;
var backgrounds = ["#efebe9", 
"#efebe9 url('images/golden_rail.jpg') no-repeat center/cover", 
"#efebe9 url('images/misty_rail.jpg') no-repeat center/cover"];

var trainArray = [
  {
    name: "Hogwarts Express",
    destination: "Hogsmeade",
    frequency: 87658,
    firstDay: "09 01 2017",
    firstTime: "1100"
  },
  {
    name: "Polar Express",
    destination: "N. Pole",
    frequency: 525600,
    firstDay: "12 24 2017",
    firstTime: "2355"
  },
  {
    name: "Orient Express",
    destination: "Istanbul",
    frequency: 525600,
    firstDay: "",
    firstTime: "2355"
  },
];


/*
pseudocode for calculating times

take user input and convert to 24-hr
get current time
calculate all the departure times for the day (store in local array--or in Firebase array?)
check for first departure time which is after current time
*/

function buildRow(obj) {
  console.log("object received as", obj)
  var newRow = $("<tr>");
  function addTd(string) {
    var newTd = $("<td>");
    newTd.text(string);
    newRow.append(newTd);
  }
  addTd(obj.name);
  addTd(obj.destination);
  addTd(obj.frequency);
  var start, startDate, startTime; // build the start date and time
  var daily = false;
  if (obj.firstDay === "") {
    // if firstDay is blank, default to today
    startDate = moment().format("D MMM, YYYY");
    daily = true; // since we're doing this check already, save the outcome to use below when formatting for date vs time
  } else {
    startDate = obj.firstDay;
  }
  startTime = obj.firstTime;
  start = moment(startDate + " " + startTime, "D MMM, YYYY HH:mm");
  console.log("start:", start);

  var now = moment();
  console.log("now:", now);
  var diffFirst = now.diff(start, "minutes");
  console.log("difFirst:", diffFirst);
  var incrementedTime;
  if (diffFirst > 0) { // if start is in the past...
    console.log("in the past");
    do {
      incrementedTime = start.add(obj.frequency, "m"); // multiply by frequency...
    } while (now.diff(incrementedTime, "minutes") > 0); // until we reach a time later than present.
    console.log("incrementedTime:", incrementedTime);
    console.log("After incrementing from past start time by frequency, the next departure is", incrementedTime.format("M/D/YY, HH:mm"));
    start = incrementedTime; // update start to the next future departure
    diffFirst = now.diff(start, "minutes"); // update diffFirst to new (negative) value
  }
  // outside that if block, we can assume start is in future
  // format "Next Arrival" to display date for future dates, or just time for today
  if (daily) { // set above
    addTd(start.format("HH:mm")); // name it in Next Arrival, formated as 24-hr time ...
  } else {
    addTd(start.format("M/D/YY")); // or else as a day.
  }
  addTd(diffFirst * -1); // Finally, use the difference (flipped back to a positive integer) for Min Away

  $("#table-body").append(newRow);
  console.log("/////////////////")
}

$("#background").click(function (e) { 
  e.preventDefault();
  // iterate repeatedly
  if (backgroundCount < backgrounds.length - 1) {
   backgroundCount++; 
  } else {
    backgroundCount = 0;
  }
  // card background to white on solid body background; otherwise rgba
  if (backgroundCount === 0) {
    $(".card").css("background-color", "");
  } else {
    $(".card").css("background-color", "rgba(255, 255, 255, 0.8)");
  }
  // set body background from array
  $("body").css("background", backgrounds[backgroundCount]);
});

// initialize Materialize's dropdown selector
$(document).ready(function() {
    $('select').material_select();
});

// listen for selection of the "daily" switch in the form to enable and disable options and reinitialize Materialize selector
$("#daily").on("change", function () {
  $("#datePick").toggle(200);
  if ($(this).is(':checked')) {
    $("#optionDay").attr("disabled", "");
    $(".lessThanDay").removeAttr("disabled");
    $("#timeVal").material_select();
  } else {
    $("#optionDay").removeAttr("disabled");
    $(".lessThanDay").attr("disabled", "");
    $("#timeVal").material_select();
  }
});

// initialize Materialize datepicker
$('.datepicker').pickadate({
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 2 // Creates a dropdown of 2 years to control year
});

// initialize Materialize timepicker
$('.timepicker').pickatime({
    default: 'now', // Set default time
    fromnow: 0,       // set default time to * milliseconds from now (using with default = 'now')
    twelvehour: false, // Use AM/PM or 24-hour format
    donetext: 'OK', // text for done-button
    cleartext: 'Clear', // text for clear-button
    canceltext: 'Cancel', // Text for cancel-button
    autoclose: false, // automatic close timepicker
    ampmclickable: true, // make AM PM clickable
  });


$("#add-form").submit(function (e) {
  e.preventDefault();
  var dataObj = {};
  // build object properties one by one from form values
  dataObj.name = $("#name").val();
  dataObj.destination = $("#destination").val();
  // calculate minutes for "frequency"
  var frequencyVal = $("#frequency").val();
  switch ($("#timeVal").val()) {
    case "min":
      dataObj.frequency = frequencyVal;
      break;
    case "hr":
      dataObj.frequency = frequencyVal * 60;
      break;
    case "day":
      dataObj.frequency = frequencyVal * 60 * 24;
      break;
    default:
      break;
  }
  dataObj.firstDay = $("#firstDay").val();
  dataObj.firstTime = $("#firstTime").val();
  database.ref().push(dataObj); // push to Firebase
  document.getElementById("add-form").reset(); // reset the form--
  // take care of re-hiding datepicker, enabling/disabling selector, and re-intializing
});

database.ref().on("child_added", function(snapshot){
  buildRow(snapshot.val());
});