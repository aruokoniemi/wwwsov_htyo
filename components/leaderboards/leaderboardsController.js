"use strict";

angular.module("carGameApp").controller("leaderboardsController", ["$scope", "$rootScope", "leaderboardsService", function ($scope, $rootScope, leaderboardsService) {
    $scope.spPlayerList = null;
    $scope.mpPlayerList = null;
    $scope.appliedclass = "";
    $scope.$state = $rootScope.$state;
    
    leaderboardsService.getSPTopScores().then(
        function (responseData) {
            $scope.spPlayerList = responseData;
            
        }, function (errorMsg) {
            //Could show error message somewhere maybe
        }
    );
    
    leaderboardsService.getMPTopScores().then(
        function (responseData) {
            $scope.mpPlayerList = responseData;
        }, function (errorMsg) {
            //Could show error message somewhere maybe
        }
    );
}]);