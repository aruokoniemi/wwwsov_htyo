<!DOCTYPE html>
<html ng-app="carGameApp">
  <head>
    <title>MyCarGame</title>
    <meta charset="utf-8">
    
    <!-- Bootstrap tags -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <!-- css -->
    <link href="bootstrap/css/bootstrap.min.css" rel="stylesheet">
    <link href="css/custom.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Roboto|Source+Sans+Pro" rel="stylesheet">
    
  </head>
  
  <body ng-controller="applicationController">
    <!-- Site header -->
    <customheader ng-controller="headerController"></customheader>
    
    <!-- Main content goes here -->
    <div ui-view></div>
    
    <footer id="footer">2017 - Aleksi Ruokoniemi</footer>
    
    <!-- Bootstrap scripts -->
    <script src="js/jquery-3.2.1.min.js"></script>
    <script src="js/popper.min.js"></script>
    <script src="bootstrap/js/bootstrap.min.js"></script>
    
    <!-- AngularJS tags -->
    <script src="js/angular.min.js"></script>
    <script src="js/angular-ui-router.min.js"></script>
    <script src="js/ui-bootstrap-tpls-2.5.0.min.js"></script>
    <script src="js/angular-animate.min.js"></script>
    <script src="components/ngCarGameApp.js"></script>
    <script src="components/authConstants.js"></script>
    <!-- AngularJS Services -->
    <script src="components/services/authService.js"></script>
    <script src="components/services/gameService.js"></script>
    <script src="components/services/leaderboardsService.js"></script>
    <!-- AngularJS Modals -->
    <script src="components/register/modalRegister.js"></script>
    <script src="components/login/modalLogin.js"></script>
    
    <!-- AngularJS Controllers -->
    <script src="components/home/homeController.js"></script>
    <script src="components/game/gameController.js"></script>
    <script src="components/leaderboards/leaderboardsController.js"></script>
    <script src="components/header/headerController.js"></script>
    <script src="components/login/loginController.js"></script>
    <script src="components/register/registerController.js"></script>
    <script src="components/stats/statsController.js"></script>
    <script src="components/applicationController.js"></script>
    
    <!-- Chart.js -->
    <script src="js/Chart.min.js"></script>
    <script src="js/angular-chart.min.js"></script>
    
    <!-- Socket.io-->
    <script src="https://wwwsov-htyo-a-ruokoniemi.c9users.io:8081/socket.io/socket.io.js"></script>
      
    <!-- Client script for multiplayer -->
    <script src="game/client.js"></script>
    
    <!-- Phaser and game scripts -->
    <script src="js/phaser.min.js"></script>
    <script src="/game/states/boot.js"></script>
    <script src="/game/states/load.js"></script>
    <script src="/game/states/menu.js"></script>
    <script src="/game/states/play.js"></script>
    <script src="/game/states/searchingGame.js"></script>
  </body>
</html>