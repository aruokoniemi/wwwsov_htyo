"use strict";

var searchingGameState = {
  preload : function() {
    var game = this.game;
    
    //Loading text. TODO: change to progressbar
    this.searchingLabel = game.add.text(500,300, 'Searching for players', {fill: "#ffffff"});
    
    var menuButton = this.game.add.text(800, 
        600,
        "Back to menu",
        { font: '30px',
          fill: "#ffffff",
          align: 'center'}
    );
    menuButton.anchor.set(0.5);
    
    menuButton.inputEnabled = true;
    menuButton.events.onInputUp.add(function() { game.state.start('menu') });
    
    if(this.game.scope.activeUser!=null) {
    var socket = connectToServer(this.game.scope.activeUser.userid, this.game.scope.activeUser.username);
    game.submitSocket(socket);
    
    whenActiveCheckReceived(socket);
    searchAgainReceived(socket, this.game.scope.activeUser.userid, this.game.scope.activeUser.username)
    whenGameFound(socket, function() { game.multiplayerEnabled = true; game.state.start("play") });
    
    menuButton.events.onInputUp.add(function() { socket.disconnect(); sendLeftQueue(socket); game.state.start('menu'); });
    };
    
  },
  
  update : function() {
      
  }
}