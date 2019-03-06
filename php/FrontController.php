<?php
  session_start();

  require_once("database.php");
  require_once("ajaxHandler.php");
  date_default_timezone_set("UTC");
  
  //AngularJS sends data as JSON
  header('Content-Type: application/json; charset=UTF-8');
  $postdata = file_get_contents("php://input");
  $request = json_decode($postdata);
  $action = $request->action;
  $mem = new Memcached();

  function call($controller, $action, $request) {
    require_once("controllers/" . $controller . "Controller.php");

    switch($controller) {
      case "user":
        $controller = new userController($request);
        break;
      case "leaderboards":
        require_once("controllers/userController.php");
        $controller = new leaderboardsController($request);
    }

    $controller->{ $action }();
  }
  
  $controllers = array("user" => ["register", "login", "authenticated", "logout"],
                       "leaderboards" => ["sptopscores", "mptopscores","addspgame", "getplayerstats"]);
  
  $foundAction = false;
                    //Controller   Actions
  foreach($controllers as $key => $value) {
    if(in_array($action, $value)) {
      call($key, $action, $request);
      $foundAction = true;
    }
  }
  if(!$foundAction) {
    ajaxHandler::dieWithError("Invalid action.");
  }

?>