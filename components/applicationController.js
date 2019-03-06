"use strict";

/* Root controller for the application */

angular.module("carGameApp").controller("applicationController", ["$scope", "$rootScope", "authService", "$state", function ($scope, $rootScope, authService, $state) {
    $scope.activeUser = null;
    $scope.msg = "waa";
    $rootScope.$state = $state;

    authService.authenticated().then(
        function (user) { // Active session found
            $scope.setActiveUser(user);
        }, function (errorMsg) { // No active session
            console.log(errorMsg);
        }
    );
 
    $scope.setActiveUser = function (user) {
        $scope.activeUser = user;
    };
    
    $scope.removeActiveUser = function () {
        $scope.activeUser = null;
    };
    
}]);