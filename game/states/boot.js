"use strict";

var bootState = {
  preload : function() {
      this.game.load.image('loadingbar', '/game/assets/loadingbar.png');
  },
  
  create : function() {
    this.game.physics.startSystem(Phaser.Physics.P2JS);
    
    //Stop pausing game when not in focus
    this.game.stage.disableVisibilityChange = true;  
      
    this.game.state.start('load');
  }
}