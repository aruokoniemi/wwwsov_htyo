"use strict";

angular.module("carGameApp").controller("statsController", ["$scope", "$stateParams", "leaderboardsService", "$rootScope",function ($scope, $stateParams, leaderboardsService) {
    $scope.userStats = null;
    $scope.ratingHistory = null;
    $scope.recentGamesSP = null;
    $scope.recentGamesMP = null;
    $scope.recentGamesSPEmptyRange = null;
    $scope.recentGamesMPEmptyRange = null;
    $scope.recentGamesEmpty = {notassigned: "N/A", dash: "-"};
    https://jsfiddle.net/2s034Lzw/1/
    /* Rating chart */
    $scope.labels = [];
    $scope.ratingData = [];
    $scope.series = "Rating";
    $scope.options = {
        responsive: true,
        maintainAspectRatio: false,
         layout: {
            padding: {
                right: 0  //set that fits the best
            }
        },
        title: {
            display: true,
            text: 'Rating History'
        },
        
        defaultFontColor: 'black',
        fill: false,
        
        legend: {
            labels: {
                fontColor: "#000"
            }
        },
        
        background: {
            Color: "#fff"
        },
        elements: {
            line: {
                tension: 0
            }
        },
        
        tooltipCaretSize: 0,
        cutoutPercentage: 60,
        
        scales: {
            yAxes: 
                {
                  id: 'y-axis-1',
                  type: 'linear',
                  display: true,
                  position: 'left'
                },
            xAxes: [{
                display: false
            }]
        }
    };
    $scope.colors = [
        {
        backgroundColor: "rgba(159,204,0, 0.2)",
        pointBackgroundColor: "rgba(159,204,0, 1)",
        pointHoverBackgroundColor: "rgba(159,204,0, 0.8)",
        borderColor: "rgba(159,204,0, 1)",
        pointBorderColor: '#fff',
        pointHoverBorderColor: "rgba(159,204,0, 1)"
        },"rgba(250,109,33,0.5)","#9a9a9a","rgb(233,177,69)"
    ];
    
    $scope.dateOfUTC = function(utcDateStr) {
        return new Date(utcDateStr + " UTC");
    }
    
    $scope.getStats = function() {
        $scope.userid = $stateParams.userid;
        $scope.userStats = null;
        $scope.ratingHistory = null;
        $scope.recentGamesSP = null;
        $scope.recentGamesMP = null;
        $scope.labels = [];
        $scope.ratingData = [];
        $scope.recentGamesSPEmptyRange = null;
        $scope.recentGamesMPEmptyRange = null;
        leaderboardsService.getPlayerStats($stateParams.userid).then(
        function (responseData) {
            $scope.userStats = responseData.user_stats[0];
            
            //Get data for chart
            var ratingHistory = responseData.rating_history;
            for(var i = 0, len = ratingHistory.length; i < len; i++) {
                /* Parse to local date */
                $scope.labels.push($scope.dateOfUTC(ratingHistory[i].changedate));
                $scope.ratingData.push(ratingHistory[i].rating);
            }

            //Recent games, fill empty rows if less than 5 games found
            $scope.recentGamesSP = responseData.recent_games_sp;
            $scope.recentGamesSPEmptyRange = 5 - $scope.recentGamesSP.length;
            $scope.recentGamesMP = responseData.recent_games_mp;
            $scope.recentGamesMPEmptyRange = 5 - $scope.recentGamesMP.length;
        }, function (errorMsg) {
            //Could show error message somewhere maybe
        });
    }
    
    $scope.getStats();
}]);