<?php
  class Db {
    private static $connection = NULL;
    private function __construct() {}
    private function __clone() {}
    public static function getConnection() {
      if (!isset(self::$connection)) {
        $servername = getenv("IP");
        $username = getenv("C9_USER");
        $password = "";
        $database = "c9";
        $dbport = 3306;
        
        self::$connection = new mysqli($servername, $username, $password, $database, $dbport);
      }
      
      if (self::$connection->connect_error) {
        die("Connection failed: " . self::$connection->connect_error);
      }
      
      return self::$connection;
    }
  }
  
?>