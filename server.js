"use strict";

/* Requires   */
var express = require('express'),
    http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var mysql = require('mysql');
var connectionPool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.IP,
    user: process.env.C9_USER,
    password: "",
    port: 3306,
    database: "c9"
})

/* Socket and game data */
var allPlayers = [];
var newestSearchingSocket = null; //Newest searching player without a pair
var rooms = [];
var games = []; //Rooms destroy themselves on disconnect, keep track of games here as well

/* Randomized flags are provided to players upon game start */
var gameFlags = [ {x: 1010, y: 110},
    {x: 580, y: 320},
    {x: 580, y: 640},
    {x: 580, y: 100},
    {x: 130, y: 470},
    {x: 1010, y: 110},
    {x: 580, y: 640},
    {x: 580, y: 320},
    {x: 580, y: 100},
    {x: 1010, y: 640},
    {x: 1010, y: 470},
    {x: 130, y: 470},
    {x: 580, y: 640}
];


io.on('connection', function (socket) {
    
    /* Match player with another player or add player as latest searching player */
    socket.on("searchgame", function(playerData) {
        console.log("Player connected: " + playerData.userid);
        //Should check if user is authenticated here
        socket.userid = playerData.userid;
        socket.username = playerData.username;
        if(newestSearchingSocket === null) {
            newestSearchingSocket = socket; 
        } else {
            if(newestSearchingSocket.pairFound) {
                io.to(socket).emit("searchAgain");
            } else {
                console.log("Checking if " + newestSearchingSocket.userid + " is still alive.");
                newestSearchingSocket.pairFound = true;
                newestSearchingSocket.pairSocket = socket;
                socket.pairSocket = newestSearchingSocket;
                //socket.broadcast.to(newestSearchingSocket.id).emit("activeCheck");
                io.to(newestSearchingSocket.id).emit("activeCheck");
                newestSearchingSocket.timeout = setTimeout(removeNewestPlayerFromQueue, 10000);
            }
        }
    });
    
    /* Get response from other socket to make sure theyre still online. */
    socket.on("stillActive", function() {
        console.log(socket.userid + " is still active.");
        var pairSocket = socket.pairSocket;
        clearTimeout(socket.timeout);
        
        socket.enemyid = pairSocket.userid;
        pairSocket.enemyid = socket.userid;
        var roomName ="room" + socket.pairSocket.userid + "v" + socket.userid;
        console.log("2 players found, match starting in room " + roomName);
        var room = {
            roomname: roomName,
            otherPlayerReady: false,
            otherPlayerCrashed: false,
            otherPlayerFinished: false,
            otherPlayerFinishedTime: null,
            isReported: false
        };
        var ind = rooms.push(room);
        games.push({player1: socket.userid, player2: socket.pairSocket.userid, gameInitialized: new Date()});
        
        socket.room = rooms[ind-1];
        pairSocket.room = rooms[ind-1];
        
        socket.join(roomName);
        pairSocket.join(roomName);
        
        newestSearchingSocket = null;
        io.sockets.in(roomName).emit("gameFound");
    });
    
    /* Once both players have loaded the game send start signal and randomized flag positions */
    socket.on("readyToStart", function() {
         console.log(socket.userid + " is ready to start playing vs " + socket.enemyid);
         var roomName = socket.room.roomname;
         var otherReady = socket.room.otherPlayerReady;
         
         if(otherReady) {
             io.to(socket.id).emit("enemyName", socket.pairSocket.username);
             io.to(socket.pairSocket.id).emit("enemyName", socket.username);
             io.to(roomName).emit("flagPositions", getRandomFlags());
             console.log("Match starting in 3 seconds.");
             setTimeout(function() { io.to(roomName).emit("startGame"); console.log("Match starting.") }, 3000);
         } else {
            socket.room.otherPlayerReady = true;
         }
    });
    
    /* Deliver current location to other players 
     * Contains x and y coordinates, car angle and a timestamp */
    socket.on("sendPosition", function(data) {
        socket.broadcast.to(socket.room.roomname).emit("receivePosition", data);
    });
    
    /* On finish check other players state:
     *  - set a callout to report the results in case the other player doesn't submit their results  
     *  or  report results if game is over for both players  */
    socket.on("finishedRace", function(raceTime) {
        console.log(socket.userid + " finished race vs " + socket.enemyid + " in " + raceTime);
        if(socket.room.otherPlayerCrashed) {
            clearTimeout(socket.room.timeout);
            console.log("Reporting win for " + socket.userid + " vs " + socket.enemyid + " (" + socket.userid + " won)");
            socket.room.isReported = true;
            reportGame(socket.userid, raceTime, socket.enemyid, 0, 1);
        } else if (socket.room.otherPlayerFinished) {
            clearTimeout(socket.room.timeout);
            console.log("Checking winner for " + socket.userid + " vs " + socket.enemyid);
            socket.room.isReported = true;
            checkWinner(socket.userid, raceTime, socket.enemyid, socket.room.otherPlayerFinishedTime);
        } else {
            socket.room.otherPlayerFinished = true;
            socket.room.otherPlayerFinishedTime = raceTime;
            socket.room.timeout = setTimeout(function() {
                    socket.room.isReported = true;
                    reportGame(socket.userid, raceTime, socket.enemyid, 0, 1);
                }, 600000
            );
        }
    });
    
    /* On finish check other players state:
     *  - set a callout to report the results in case the other player doesn't submit their results  
     *  or  report results if game is over for both players  */
    socket.on("crashed", function() {
        console.log(socket.userid + " crashed.");
        if(socket.room.otherPlayerCrashed) {
            clearTimeout(socket.room.timeout);
            console.log("Reporting tie for " + socket.userid + " vs " + socket.enemyid);
            socket.room.isReported = true;
            reportGame(socket.userid, 0, socket.enemyid, 0, 0);
        } else if (socket.room.otherPlayerFinished) {
            clearTimeout(socket.room.timeout);
            console.log("Reporting win for " + socket.userid + " vs " + socket.enemyid + " (" + socket.enemyid + " won)");
            socket.room.isReported = true;
            reportGame(socket.enemyid, socket.room.otherPlayerFinishedTime, socket.userid, 0, 1);
        } else {
            socket.room.otherPlayerCrashed = true;
            socket.broadcast.to(socket.room.roomname).emit("otherPlayerCrashed"); 
            
            socket.room.timeout = setTimeout(function() {
                socket.room.isReported = true;
                reportGame(socket.userid, 0, socket.enemyid, 0, 0);
            }, 600000
            );
        }
    });
    
    socket.on("leftQueue", function() {
        if(newestSearchingSocket===socket) {
            console.log("Player " + newestSearchingSocket.userid + " exited queue.");
            newestSearchingSocket = null;
        } 
    });
    
    socket.on("disconnect", function() {
        console.log(socket.userid + " disconnected.");
        if(newestSearchingSocket===socket) {
            console.log("Player " + newestSearchingSocket.userid + " exited queue.");
            newestSearchingSocket = null;
        } 
        
        for(var i = 0, len = allPlayers.length; i < len; i++ ) {
            if(allPlayers[i]===socket) {
                allPlayers.splice(i, 1);
            }
        }
    });
    
    allPlayers.push(socket);
    socket.on('message', function (msg) {
        broadcast('message', msg);
    });
});

function removeNewestPlayerFromQueue() {
    if(newestSearchingSocket !== null) {
        console.log("No response, removing " + newestSearchingSocket.userid + " from queue.");
        newestSearchingSocket.pairFound = false;
        newestSearchingSocket.pairSocket = null;
        newestSearchingSocket = null;
    }
}


//Notifies both players about their last games results
function notifyGameResults(id1, id2, winnerIndex, rating1, rating2) {
    var sockets = allPlayers;
    var id1found = false;
    var id2found = false;
    for(var i = 0, len = sockets.length; i < len; i++) {
        var socket;
        if(sockets[i].userid===id1 && !id1found) {
            socket = sockets[i];
            id1found = true;
            var event;
            if(winnerIndex === 1) {
                event = "youWon";
            } else if(winnerIndex === 2) {
                event = "youLost";
            } else {
                event = "youTied";
            }
            io.to(socket.id).emit(event, Math.round(rating1));
        } else if (sockets[i].userid===id2 && !id2found) {
            socket = sockets[i];
            id2found = true;
            var event;
            if(winnerIndex === 1) {
                event = "youLost";
            } else if(winnerIndex === 2) {
                event = "youWon";
            } else {
                event = "youTied";
            }
            io.to(socket.id).emit(event, Math.round(rating2));
        }

    }
    
    
}


//Updates both players ratings according to
//https://en.wikipedia.org/wiki/Elo_rating_system
//Calls notify game results function afterwards
function updateRating(id1, id2, winnerIndex) {
    //Get ratings for both players
    var query = "SELECT userid, rating FROM user WHERE " +
            " userid="+id1+" OR userid= "+id2;

    connectionPool.query(query, function (err, rows, fields) {
        if(!err) {
            //Update ratings if theyre obtained succesfully
            var id1rating;
            var id2rating;
            var result = rows;
            
            
            if(!result[0] || !result[1]) {
                console.log("Played vs self, no ratings updated.");
                return;
            }
            if(result[0].userid===id1) {
                id1rating = result[0].rating;
                id2rating = result[1].rating;
            } else if (result[0].userid===id2) {
                id1rating = result[1].rating;
                id2rating = result[0].rating;
            } else {
                console.log("Error getting player ratings: " + id1 + " vs " + id2);
                return;
            }
            
            var R1 = Math.pow(10, id1rating/400);
            var R2 = Math.pow(10, id2rating/400);
            var E1 = R1/(R1+R2);
            var E2 = R2/(R1+R2);
            var S1;
            var S2;
            
            var sqlQueryGamesWon = ", mpgameswon = IF(userid=";
            if(winnerIndex===1) {
                S1 = 1;
                S2 = 0;
                sqlQueryGamesWon += id1+",mpgameswon+1,mpgameswon)";
            } else if(winnerIndex===2) {
                S1 = 0;
                S2 = 1;
                sqlQueryGamesWon += id2+",mpgameswon+1,mpgameswon)";
            } else {
                S1 = 0.5;
                S2 = 0.5;
                sqlQueryGamesWon += id1+",mpgameswon,mpgameswon)";
            }
            
            var id1rating = id1rating + 32*(S1-E1);
            var id2rating = id2rating + 32*(S2-E2);
            console.log(id1+ "'s new rating is " + id1rating);
            console.log(id2+ "'s new rating is " + id2rating);
            
            var query = "UPDATE user SET rating = IF(userid="+id1+","+id1rating+","+id2rating+
                    "), mpgamesplayed = mpgamesplayed + 1 " +
                    sqlQueryGamesWon +
                    "WHERE userid IN ("+id1+","+id2+")";
    
            connectionPool.query(query, function (err, rows, fields) {
                if(!err) {
                    notifyGameResults(id1, id2, winnerIndex, id1rating, id2rating);
                } else {
                    console.log("Error updating player ratings: " + id1 + " vs " + id2);
                }
            });
            
        } else {
            console.log("Error getting player ratings: " + id1 + " vs " + id2);
        }
    });
}

//Inserts the game stats to db
//Calls rating update function afterwards
// winnerIndex: 0 - tie, 1 - id1 won, 2 - id2 won
function reportGame(id1, id1time, id2, id2time, winnerIndex) {
    var values = [
        [id1, id2, id1time, id2time, winnerIndex, new Date()]
    ];
    var query = "INSERT INTO mpgame (playerOne, playerTwo, playeronemstime, playertwomstime, winner, gamedate)"
        +" VALUES ?";
    connectionPool.query(query, [values], function (err, result, fields) {
        if (!err) {
            console.log("Inserted game data into db succesfully.");
            updateRating(id1, id2, winnerIndex);
        } else {
            console.log("Error inserting to mpgame table.");
        }
    });
}

//Checks the winner if both players finished and then reports the game
function checkWinner(id1, id1time, id2, id2time) {
    if(id1time < id2time) {
        reportGame(id1, id1time, id2, id2time, 1);
    } else if (id1time > id2time) {
        reportGame(id1, id1time, id2, id2time, 2);
    } else {
        reportGame(id1, id1time, id2, id2time, 0);
    }
}

//Could report default loss for disconnecting
function reportDefaultLoss(winnerId, loserId) {
    
}

//Used to shuffle flag array
//https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
function shuffleFlagArray(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}

//Get random flags for a game
function getRandomFlags() {
    var flags = gameFlags;

    do {
        shuffleFlagArray(flags);
    }
    while(flags[0].x === 580 && flags[0].y === 640);
    
    return flags;
}

server.listen(8081, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Multiplayer server listening at", addr.address + ":" + addr.port);
});
