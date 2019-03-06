"use strict";

angular.module("carGameApp").controller("headerController", ["$scope", "$rootScope", "$uibModal", "authService", function ($scope, $rootScope, $uibModal, authService) {
    $scope.$state = $rootScope.$state;
    
    $scope.openLogin = function () {
        var modalInstance = $uibModal.open({
            templateUrl: '/components/login/modalLogin.html',
            controller: 'loginController',
            scope: $scope
        });
    }
    
    $scope.openRegister = function() {
        var modalInstance = $uibModal.open({
            templateUrl: '/components/register/modalRegister.html',
            controller: 'registerController',
            scope: $scope
        });
    }
    
    $scope.logout = function() {
        authService.logout().then(
            function() { //Successful logout
                $scope.removeActiveUser();
            }, function(errorMsg) { //Error

            }
        );
    }
}]);