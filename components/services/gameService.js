"use strict";

carGameApp.factory("gameService", function ($http, $q, $rootScope) {
    var authService = {};
    
    authService.register = function (credentials) {
        return $q(function(resolve, reject) {
        
            $http({
            url: "/php/FrontController.php",
            method: "POST",
            data: { credentials,             
                action: "register",
                controller: "user" }
            })
            .then(function(response) {
                resolve(response.data.message);
            }, 
            function(response) {
                reject(response.data.errorMessage);
            });
        });
    };
    
    authService.login = function (credentials) {
        return $q(function(resolve, reject) {
        
            $http({
            url: "/php/FrontController.php",
            method: "POST",
            data: { credentials,             
                action: "login",
                controller: "user" }
            })
            .then(function(response) {
                $rootScope.globals = {
                    currentUser: {
                        sessionId: response.data.sessionId, 
                        userId: response.data.userId, 
                        username: response.data.username
                    }
                };
                resolve(response.data.message);
            }, 
            function(response) {
                reject(response.data.errorMessage);
            });
        });
    };
    
    return authService;
    
})