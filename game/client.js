"use strict";

var socket;

function getSocket() {
    return socket;
}

function connectToServer(userid, username) {
    socket = io.connect("https://wwwsov-htyo-a-ruokoniemi.c9users.io:8081");
    socket.on("connect", function() {
        socket.emit("searchgame", {userid: userid, username: username});
    });
    return socket;
}

function searchAgainReceived(socket, userid, username) {
    socket.on("searchagain", function() {
        setTimeout(function() { socket.emit("searchgame", {userid: userid, username: username}), 5000 }) 
    });
}

function whenActiveCheckReceived(socket) {
    socket.on("activeCheck", function() {
        socket.emit("stillActive");
    })
}

function whenGameFound(socket, callback) {
    socket.on("gameFound", callback);
}

function sendReadyToStart(socket) {
    socket.emit("readyToStart");
}

function whenStartGame(socket, callback) {
    socket.on("startGame", function() {
       callback;
    });
}

function sendCurrentPosition(x,y,angle,timestamp) {
    socket.emit("sendPosition", {x: x, y: y, angle: angle, timestamp: timestamp});
}

function sendCrashed() {
    socket.emit("crashed");
}

function sendFinished(finishTime) {
    socket.emit("finishedRace", finishTime);
}

function sendLeftQueue(socket) {
    socket.emit("leftQueue");
} 