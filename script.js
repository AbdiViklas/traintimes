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


var trainArray = [
  {
    name: "Hogwarts Express",
    destination: "Hogsmeade",
    frequency: 87658,
    daily: false,
    firstDay: "09 01 2017",
    firstTime: "1100"
  },
  {
    name: "Polar Express",
    destination: "N. Pole",
    frequency: 525600,
    daily: false,
    firstDay: "12 24 2017",
    firstTime: "2355"
  },
  {
    name: "Orient Express",
    destination: "Istanbul",
    frequency: 525600,
    daily: true,
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