"use strict";

carGameApp.factory("authService", function ($http, $q, $rootScope) {
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
    
    authService.login = function (credentials, rememberme) {
        return $q(function(resolve, reject) {
        
            $http({
            url: "/php/FrontController.php",
            method: "POST",
            data: { credentials,
                    rememberme,
                    action: "login",
                    controller: "user" }
            })
            .then(function(response) {
                resolve(response.data.user);        
                $rootScope.$broadcast("USERSTATECHANGE");
            }, 
            function(response) {
                reject(response.data.errorMessage);
            });
        });
    };
    
    authService.logout = function () {
        return $q(function(resolve, reject) {
        
            $http({
            url: "/php/FrontController.php",
            method: "POST",
            data: {              
                action: "logout",
                controller: "user" }
            })
            .then(function(response) {
                resolve(response);
                $rootScope.$broadcast("USERSTATECHANGE");
            }, 
            function(response) {
                reject(response.data.errorMessage);
            });
        });
    };
    
    authService.authenticated = function () {
        return $q(function(resolve, reject) {
        
            $http({
            url: "/php/FrontController.php",
            method: "POST",
            data: {             
                action: "authenticated",
                controller: "user" }
            })
            .then(function(response) {
                if(response.data.user) { //User has active session
                    resolve(response.data.user)
                    $rootScope.$broadcast("USERSTATECHANGE");
                } else {
                    //User doesnt have an active session
                    reject("No active session.");
                }
            },
            function(response) {
                reject();    
            });
        });
    };
    
    return authService;
    
})