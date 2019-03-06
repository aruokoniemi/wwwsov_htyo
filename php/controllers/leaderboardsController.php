<?php
    class leaderboardsController {
        private static $data;
        
        public function __construct($requestData) {
            self::$data = $requestData;
        }
        
        //Returns 30 best single player race times
        public function sptopscores() {
            $connection = Db::getConnection();
            $sqlQuery = "SELECT user.username AS username, user.userid AS userid, spgame.mstime AS mstime,
                                driftCount AS driftcount, driftTotal AS drifttotal
                         FROM spgame 
                         INNER JOIN user on user.userid=spgame.userid 
                         WHERE mstime>0 
                         ORDER BY mstime 
                         LIMIT 30;";
            $result = $connection->query($sqlQuery);
            
            $rows = array();
            while($r = mysqli_fetch_assoc($result)) {
                $rows[] = array("username"=>$r["username"],"userid"=>$r["userid"],
                        "mstime"=>$r["mstime"],"driftcount"=>$r["driftcount"],"drifttotal"=>$r["drifttotal"]);
            }

            $rows = array("sptopscores"=>$rows);
            $json = json_encode($rows);

            ajaxHandler::dieWithJSON($json);
        }
        
        //Returns 30 players with the highest multiplayer ratings
        public function mptopscores() {
            $connection = Db::getConnection();
            $sqlQuery = "SELECT username, userid, rating 
                         FROM user 
                         ORDER BY rating DESC
                         LIMIT 30;";
            $result = $connection->query($sqlQuery);

            $rows = array();
            while($r = mysqli_fetch_assoc($result)) {
                $rows[] = array("username"=>$r["username"],"userid"=>$r["userid"],"rating"=>$r["rating"]);
            }
            
            $rows = array("mptopscores"=>$rows);
            $json = json_encode($rows);

            ajaxHandler::dieWithJSON($json);
        }
        
        public function getplayerstats() {
            $userid = self::$data->userid;
            if(!is_numeric($userid)) {
                ajaxHandler::dieWithError("ID not correct.");
            }
            
            $userstats = $this->getUserStats($userid);
            $ratinghistory = $this->getRatingHistory($userid);
            $recentgamessp = $this->getRecentGamesSP($userid);
            $recentgamesmp = $this->getRecentGamesMP($userid);
            
            $json = json_encode(array("user_stats"=>$userstats, "rating_history"=>$ratinghistory, 
                                "recent_games_sp"=>$recentgamessp, "recent_games_mp"=>$recentgamesmp));
            ajaxHandler::dieWithJSON($json);
        }
        
        //Get stats from user table
        //userid must be validated beforehand
        private function getUserStats($userid) {
            $connection = Db::getConnection();
            $sqlQuery = "SELECT username, joindate, bestdrift, spgamesplayed, spcarscrashed, spbesttime, spdamagetaken,
                spdriftcount, spdrifttotal, flagscollected, mpgamesplayed, mpgameswon, rating FROM user WHERE userid=".$userid;
            $result = $connection->query($sqlQuery);

            $rows = array();
            while($r = mysqli_fetch_assoc($result)) {
                $rows[] = $r;
            }
            
            return $rows;
        }
        
        //Get rating history for player
        //userid must be validated beforehand
        private function getRatingHistory($userid) {
            $connection = Db::getConnection();
            $sqlQuery = "SELECT rating, changedate FROM ratinghistory WHERE userid=".$userid;
            $result = $connection->query($sqlQuery);
            
            $rows = array();
            while($r = mysqli_fetch_assoc($result)) {
                $rows[] = $r;
            }
            
            return $rows;
        }
        
        private function getRecentGamesSP($userid) {
            $connection = Db::getConnection();
            $sqlQuery = "SELECT user.username, spgame.* FROM spgame JOIN user ON spgame.userid=user.userid WHERE user.userid=".$userid."
                ORDER BY spgame.gamedate DESC LIMIT 5;";
            $result = $connection->query($sqlQuery);

            $rows = array();
            while($r = mysqli_fetch_assoc($result)) {
                $rows[] = $r;
            }
            
            return $rows;
        }
        
        private function getRecentGamesMP($userid) {
            $connection = Db::getConnection();
            $sqlQuery = "SELECT p1.username AS p1name, p2.username AS p2name, mpgame.*
                        FROM mpgame
                        JOIN user AS p1 ON p1.userid = mpgame.playerOne
                        JOIN user AS p2 ON p2.userid = mpgame.playerTwo
                        WHERE p1.userid=".$userid." OR p2.userid=".$userid.
                        " ORDER BY mpgame.gamedate DESC LIMIT 5;";
            $result = $connection->query($sqlQuery);

            $rows = array();
            while($r = mysqli_fetch_assoc($result)) {
                $rows[] = $r;
            }
            
            return $rows;
        }
        
        //Do some basic checks on game stats
        //Returns false if game stats arent valid
        //else returns true
        private function checkSPGameValidity($playerid, $mstime, $crashed, $flagsCollected, $bestDrift, $damageTaken, $driftCount, $driftTotal) {
            if ($_SESSION["userid"] !== $playerid) {
                return false;
            } else if( $mstime < 0 ) {
                return false;
            } else if ( ($flagsCollected > 13) || ($flagsCollected < 0) ) {
                return false;
            } else if ( ($bestDrift < 0) || ($bestDrift > 1000) ) {
                return false;
            } else if ( $damageTaken < 0 ) {
                return false;
            } else if ( $driftCount < 0 ) {
                return false;
            } else if ( $driftTotal < 0 ) {
                return false;
            } else{
                return true;
            }
        }
        
        //Updates single player statistics for a player
        private function updateSinglePlayerStats($userid, $mstime, $crashed, $flagsCollected, $bestDrift, $damageTaken, $driftCount, $driftTotal) {
            
            $connection = Db::getConnection();
            $query = "UPDATE user
                      SET bestdrift = CASE WHEN ? > bestdrift THEN ? ELSE bestdrift END
                    	 ,spbesttime = CASE WHEN ? < spbesttime OR spbesttime IS NULL THEN ? ELSE spbesttime END
	                     ,spgamesplayed = spgamesplayed + 1
	                     ,flagscollected = flagscollected + ?
	                     ,spcarscrashed = spcarscrashed + ?
	                     ,spdamagetaken = spdamagetaken + ?
	                     ,spdriftcount = spdriftcount + ?
	                     ,spdrifttotal = spdrifttotal + ?
	                  WHERE userid=?";
            
            $stmt = $connection->prepare($query);
            
            if($mstime === 0 ) {
                $mstime = null;
            }

            $stmt->bind_param("ddiiiiidii", $bestDrift, $bestDrift, 
                                             $mstime, $mstime, 
                                             $flagsCollected,
                                             intval($crashed), 
                                             $damageTaken,
                                             $driftCount,
                                             $driftTotal,
                                             $userid);
            if($stmt->execute()) {
                ajaxHandler::dieWithMessage("Game stats logged successfully.");
            } else {
                ajaxHandler::dieWithError("Game stats couldn't be logged.");
            }
        }
        
        
        //Adds single player game results to database
        public function addspgame() {
            if( !userController::isAuthenticated() ) {
                ajaxHandler::dieWithError("Not authenticated.");
            }
            
            $userid = self::$data->gameresults->userid;
            $mstime = self::$data->gameresults->mstime;
            $crashed = self::$data->gameresults->crashed;
            $driftCount = self::$data->gameresults->driftCount;
            $driftTotal = self::$data->gameresults->driftTotal;
            $flagsCollected = self::$data->gameresults->flagsCollected;
            $bestDrift = self::$data->gameresults->bestDrift;
            $damageTaken = self::$data->gameresults->damageTaken;
            
            if(!$this->checkSPGameValidity($userid, $mstime, $crashed, $flagsCollected, $bestDrift, $damageTaken, $driftCount, $driftTotal) ) {
                ajaxHandler::dieWithError("Blatantly tampered game stats. :)");
            };
            
            $connection = Db::getConnection();
            $query = "INSERT INTO spgame (userid, mstime, crashed, flagsCollected, gamedate, driftCount, driftTotal)
                      VALUES (?, ?, ?, ?, NOW(), ?, ?)";
                      
            $stmt = $connection->prepare($query);

            $stmt->bind_param("iiiiid", $userid, $mstime, intval($crashed), $flagsCollected, $driftCount, $driftTotal);
            
            if($stmt->execute()) {
                $this->updateSinglePlayerStats($userid, $mstime, $crashed, $flagsCollected, $bestDrift, $damageTaken, $driftCount, $driftTotal);
            } else {
                ajaxHandler::dieWithError("Game stats couldn't be logged.");
            }
            
        }
        
    }
?>
