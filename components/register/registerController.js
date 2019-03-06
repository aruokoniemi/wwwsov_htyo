"use strict";

var registerController = carGameApp.controller("registerController", ["$scope", "$timeout", "$uibModalInstance", "authService",
        function ($scope, $timeout, $uibModalInstance, authService) {
    $scope.message;
    $scope.messageClass = "text-danger";
    $scope.registrationSuccessful = false;
    
    $scope.credentials = {
        username: "",
        password: ""
    };
    
    $scope.register = function() {
        $scope.message = "";
        authService.register($scope.credentials).then(
            function (message) { // Registered successfully
                $scope.message = message;
                $scope.registrationSuccessful = true;
                $scope.messageClass = "text-success";
                $timeout(function() { $scope.close() }, 3000);
            }, function (errorMsg) { // Show error message
                $scope.message = errorMsg; 
            }
        );
    };
    
    $scope.close = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);