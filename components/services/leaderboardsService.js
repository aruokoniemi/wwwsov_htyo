"use strict";

carGameApp.factory("leaderboardsService", function ($http, $q) {
    var leaderboardsService = {};

    leaderboardsService.getSPTopScores = function () {
        return $q(function(resolve, reject) {
            $http({
            url: "/php/FrontController.php",
            method: "POST",
            data: {     
                action: "sptopscores",
             }
            })
            .then(function(response) {
                resolve(response.data.sptopscores);
            }, 
            function() {
                reject();
            });
        });
    };
    
    leaderboardsService.getMPTopScores = function () {
        return $q(function(resolve, reject) {
            $http({
            url: "/php/FrontController.php",
            method: "POST",
            data: {     
                action: "mptopscores",
             }
            })
            .then(function(response) {
                resolve(response.data.mptopscores);
            }, 
            function() {
                reject();
            });
        });
    };
    
    
    leaderboardsService.submitSPGame = function (gameresults) {
        return $q(function(resolve, reject) {
            $http({
            url: "/php/FrontController.php",
            method: "POST",
            data: {
                gameresults,
                action: "addspgame",
                controller: "leaderboards" }
            })
            .then(function(response) {
                resolve();
            }, 
            function(response) {
                reject();
            });
        });
    };
    
    leaderboardsService.getPlayerStats = function (userid) {
        return $q(function(resolve, reject) {
            $http({
            url: "/php/FrontController.php",
            method: "POST",
            data: {
                userid: userid,
                action: "getplayerstats",
                controller: "leaderboards" }
            })
            .then(function(response) {
                resolve(response.data);
            }, 
            function(response) {
                console.log(response);
                reject("Stats couldn't be retrieved.");
            });
        });   
    };
    
    return leaderboardsService;
});