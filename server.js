// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var moment = require('moment');
// TODO: configure for test environment or production
var supportData = require("./mock-data.json");
var supportTicketUrl = "www.google.com"
var teamsLink = "https://teams.microsoft.com/l/chat/0/0?users=";

var app = express();
var PORT = process.env.PORT || 3000;

// Sets up the Express app to handle data parsing
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/api/supportSchedule", (req, res) => {
    res.json(supportData);
});

function defaultSupport() {
    return supportTicketUrl;
}

function supportOnCall(currentTime) {
    let supportEmail = null;
    supportData.data.forEach(supporter => {
        const startMoment = moment(supporter.startTime, "hh:mm:ss");
        const endMoment = moment(supporter.endTime, "hh:mm:ss");
        if (currentTime.isBetween(startMoment, endMoment)) {
            supportEmail = supporter.email
        }
    });

    return supportEmail;
}

app.get("/api/support", (req, res) => {
    const weekendSupport = req.params.includeWeekends || true;
    const currentDate = new Date();
    // TODO: Test for different timezones
    const currentMoment = new moment();
    if (weekendSupport === false && (currentMoment.getDay() === 0 || currentDate.getDay() === 6)) {
        // default on Sunday and Saturday
        defaultSupport();
        return;
    }
    const email = supportOnCall(currentMoment); 
    if (email) {
        res.redirect(teamsLink + email)
    }
    res.redirect(defaultSupport());
});

// Starts the server to begin listening
app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});