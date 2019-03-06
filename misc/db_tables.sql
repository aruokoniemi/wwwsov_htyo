CREATE TABLE IF NOT EXISTS user (
  userid INT AUTO_INCREMENT,
  username VARCHAR(12) NOT NULL,
  password VARCHAR(255) NOT NULL,
  remembermehash VARCHAR(255) NOT NULL,

  joindate DATETIME NOT NULL,
  bestdrift DOUBLE DEFAULT 0,
  spgamesplayed INT DEFAULT 0,
  spcarscrashed INT DEFAULT 0,
  spbesttime INT DEFAULT NULL,
  spdamagetaken INT DEFAULT 0,
  spdriftcount INT DEFAULT 0,
  spdrifttotal DOUBLE DEFAULT 0,
  flagscollected INT DEFAULT 0,
  mpgamesplayed INT DEFAULT 0,
  mpgameswon INT DEFAULT 0,
  rating INT DEFAULT 1000,
  
  PRIMARY KEY (userid)
);

CREATE TABLE IF NOT EXISTS ratinghistory (
  historyid INT AUTO_INCREMENT,
  userid INT NOT NULL,
  rating INT NOT NULL,
  changedate DATETIME NOT NULL,
  
  PRIMARY KEY (historyid),
  FOREIGN KEY (userid) REFERENCES user(userid)
);

CREATE TABLE IF NOT EXISTS spgame (
  spgameid INT AUTO_INCREMENT,
  userid INT NOT NULL,
  driftCount INT NOT NULL,
  driftTotal DOUBLE NOT NULL,
  mapname VARCHAR(20),
  mstime INT NOT NULL,
  crashed BOOLEAN NOT NULL,
  flagsCollected INT NOT NULL,
  gamedate DATETIME NOT NULL,
  
  PRIMARY KEY (spgameid),
  FOREIGN KEY (userid) REFERENCES user(userid)
);

CREATE TABLE IF NOT EXISTS mpgame (
  mpgameid INT AUTO_INCREMENT,
  playerOne INT NOT NULL,
  playerTwo INT NOT NULL,
  playeronemstime INT,
  playertwomstime INT,
  winner INT NOT NULL,
  mapname VARCHAR(20),
  gamedate DATETIME NOT NULL,
  
  PRIMARY KEY (mpgameid),
  FOREIGN KEY (playerOne) REFERENCES user(userid),
  FOREIGN KEY (playerTwo) REFERENCES user(userid)
);