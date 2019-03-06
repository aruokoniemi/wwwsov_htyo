"use strict";

var mainController = carGameApp.controller("gameController", ["$scope", "leaderboardsService", function ($scope, leaderboardsService) {
    $scope.game;
    
    //Start game when template loaded
    $scope.$on('$viewContentLoaded', function() {
        var game = new Phaser.Game(1152, 768, Phaser.AUTO, 'gameDiv');
        $scope.game = game;
        //Attach scope to game to get data from game
        game.scope = $scope;
        game.submitSPResults = function(results) {
            $scope.submitSPResults(results);
        }
        game.submitSocket = function(socket) {
            $scope.socket = socket;
        }

        game.state.add('boot', bootState);
        game.state.add('load', loadState);
        game.state.add('menu', menuState);
        game.state.add('play', playState);
        game.state.add('searching', searchingGameState)
        
        game.state.start('boot');
    });
    
    $scope.submitSPResults = function(results) {
        if($scope.activeUser) { //Only submit if logged in
            results.userid = $scope.activeUser.userid;
            leaderboardsService.submitSPGame(results).then(
                function() { //Successfully submitted
                    console.log("submitted results");
                }, 
                function() { //Error
                    console.log("didnt submit results");
                }
            );
        }
    }
    
    
    
    //Destroy game when route switches
    $scope.$on("$destroy", function() {
        if($scope.socket) {
            $scope.socket.disconnect();
        }
        
        clearInterval($scope.game.selfInterval);
        
        $scope.game.destroy();
        $scope.game = null;
    });
    
}]);