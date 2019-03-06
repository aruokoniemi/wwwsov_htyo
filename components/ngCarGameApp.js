"use strict";

var carGameApp = angular.module("carGameApp", ["ui.router", "ui.bootstrap", "ngAnimate", "chart.js"]);

//Routing
carGameApp.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/home');

    $stateProvider
        // HOME STATES AND NESTED VIEWS ========================================
        .state('home', {
            url: '/home',
            templateUrl: '/components/home/homeView.html',
            controller: "homeController"
        })
        
        
        //Game
        .state('game', {
            url: '/game',
            templateUrl : "/components/game/gameView.html",
            controller : "gameController"
        })
        
        .state('howtoplay', {
            url: '/howtoplay',
            templateUrl : "/components/howtoplay/howtoplayView.html"
        })
        
        .state('credits', {
            url: '/credits',
            templateUrl : "/components/credits/creditsView.html"
        })
        
        //leaderboards
        
        .state("leaderboards", {
            url: '/leaderboards',
            templateUrl : "/components/leaderboards/leaderboardsRoot.html",
            controller : "leaderboardsController",
            abstract: true,
            deepStateRedirect: { default: { state: 'leaderboards.singleplayer' } },
        })
        
        .state("leaderboards.singleplayer", {
            url: "/singleplayer",
            templateUrl: "/components/leaderboards/singlePlayerView.html",
        })
        
        .state("leaderboards.multiplayer", {
            url: "/multiplayer",
            templateUrl: "/components/leaderboards/multiPlayerView.html",
        })
        
        //stats
        
        .state("stats", {
            url: "/stats",
            controller: "statsController",
            abstract: true
        })
        
        .state("stats.player", {
            url: "/:userid",
            controller: "statsController",
            templateUrl: "/components/stats/statsView.html",
        });
});

carGameApp.run([
    "$rootScope", "$state", "$stateParams", function($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        return $rootScope.$stateParams = $stateParams;
    }
]);

//Directives 
carGameApp.directive('customheader', function() {
    var directive = {};
    
    directive.restrict = 'E';
    directive.templateUrl = "/components/header/headerView.html";
    
    return directive;
});

carGameApp.config(['ChartJsProvider', function (ChartJsProvider) {
    // Configure all charts
    ChartJsProvider.setOptions({
      chartColors: ['#FF5252', '#FF8A80'],
      responsive: true,
      maintainAspectRatio: false
    });
    // Configure all line charts
    ChartJsProvider.setOptions('line', {
      showLines: true
    });
}]);