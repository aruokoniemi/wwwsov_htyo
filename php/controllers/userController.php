<?php
  class userController {
    private static $data;
      
    public function __construct($requestData) {
        self::$data = $requestData;
    }
      
    //Returns empty string if credentials are valid length and only contain alphanumeric characters
    private function checkCredentialsValidity($username, $password) {
        if( (strlen($username) < 3) || (strlen($username) > 12) ) {
            ajaxHandler::dieWithError("The username has to be between 3 and 12 characters."); 
        } else if(!ctype_alnum($username)) {
            ajaxHandler::dieWithError("The username can only contain alphanumeric characters.");
        } else if( (strlen($password) < 5) || (strlen($password) > 256) ) {
            ajaxHandler::dieWithError("The password has to be between 5 and 255 characters."); 
        } else if(!ctype_alnum($password)) {
            ajaxHandler::dieWithError("The password can only contain alphanumeric characters.");
        }  
    }
    
    public static function isAuthenticated() {
        if($_SESSION["authenticated"] === true &&
            isset($_SESSION["username"]) &&
            isset($_SESSION["userid"])) {
            
            return true;
        } else {
            return false;   
        }
    }
      
      
    public function register() {
        $username = self::$data->credentials->username;
        $password = self::$data->credentials->password;
    
        $this->checkCredentialsValidity($username, $password);
        
        $joindate = date("Y-m-d H:i:s");
        
        //Check if username is taken
        $connection = Db::getConnection();
        $stmt = $connection->prepare("SELECT * FROM user WHERE username = ? LIMIT 1");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $stmt->store_result();
        $rows = $stmt->num_rows;
        
        if($rows == 0) { //Username is free, add it to DB
            $stmt = $connection->prepare("INSERT INTO user(username, password, joindate) VALUES (?, ?, ?)");
            
            $stmt->bind_param("sss", $username, password_hash($password, PASSWORD_DEFAULT), $joindate);
          
            if($stmt->execute()) {
                ajaxHandler::dieWithMessage("User registered successfully.");
            } else {
                ajaxHandler::dieWithError("Registration couldn't be completed.");
            }
            
        } else {
              ajaxHandler::dieWithError("Username is already in use.");
        }
    }
    
    public function login() {
        $username = self::$data->credentials->username;
        $password = self::$data->credentials->password;
     
        $this->checkCredentialsValidity($username, $password);
        
        //Get hashed password from db
        $userId = null;
        $hashedPassword = null;
        $connection = Db::getConnection();
        $stmt = $connection->prepare("SELECT userid, password FROM user WHERE username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $stmt->bind_result($userId, $hashedPassword);
        $stmt->fetch();
        
        //Compare hashes
        if(password_verify($password, $hashedPassword)) {
            $_SESSION["authenticated"] = true;
            $_SESSION["username"] = $username;
            $_SESSION["userid"] = $userId;
            
            $returnJSON = json_encode(array("user"=>array("username" => $username, "userid" => $userId)));
            ajaxHandler::dieWithJSON($returnJSON);
        } else { //Wrong password
            ajaxHandler::dieWithError("Wrong username or password.");
        }
    }
    
    public function logout() {
        session_destroy();
        
        unset($_SESSION['username']);
        unset($_SESSION['userid']);
        unset($_SESSION['authenticated']);
    }
    
    public function authenticated() {
        if( $this->isAuthenticated() ) {
            $returnJSON = json_encode(array("user"=>array("username" => $_SESSION["username"], "userid" => $_SESSION["userid"])));
            ajaxHandler::dieWithJSON($returnJSON);
        }
    }
  }
?>