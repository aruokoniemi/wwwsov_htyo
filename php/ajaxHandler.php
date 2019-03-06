<?php
  class ajaxHandler {
      private function __construct() {}
      private function __clone() {}
      public static function dieWithJSON($json) {
          header('HTTP:/1.1 400 Something something');
          header('Content-Type: application/json; charset=UTF-8');
          die($json);
      }
      
      public static function dieWithMessage($message) {
          header('HTTP:/1.1 400 Something something');
          header('Content-Type: application/json; charset=UTF-8');
          die(json_encode(array("message" => $message)));
      }
      public static function dieWithError($errorMsg) {
          header('HTTP/1.1 500 Ribs Server');
          header('Content-Type: application/json; charset=UTF-8');
          die(json_encode(array("errorMessage" => $errorMsg)));
      }
  }

?>