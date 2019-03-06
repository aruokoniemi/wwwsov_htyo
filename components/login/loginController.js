"use strict";

angular.module("carGameApp").controller("loginController", ["$scope", "$rootScope", "$timeout", "$uibModalInstance", "authService", "AUTH_EVENTS",
                                                            function($scope, $rootScope, $timeout, $uibModalInstance, authService, AUTH_EVENTS) {
    $scope.message;
    $scope.messageClass = "text-danger";
    $scope.loginSuccessful = false;
    
    $scope.credentials = {
        username: "",
        password: ""
    };
    $scope.rememberme = false;
    
    $scope.login = function() {
        $scope.message = "";
        authService.login($scope.credentials, $scope.rememberme).then(
            function (user) { // Logged in succesfully
                $scope.setActiveUser(user);
                $scope.message = "Logged in successfully.";
                $scope.loginSuccessful = true;
                $scope.messageClass = "text-success";
                $timeout(function() { $scope.close() }, 3000);
            }, function (errorMsg) { // Show error message
                $scope.message = "Wrong username or password."; 
            }
        );
    };
    
    $scope.close = function () {
        $uibModalInstance.dismiss('cancel');
    };    
        
        
}]);