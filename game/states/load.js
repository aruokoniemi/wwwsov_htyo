"use strict";

var loadState = {
  preload : function() {
    var game = this.game;

    //Loading text. TODO: change to progressbar
    var loadingText = game.add.text(500,300, "Loading assets", {fill: "#ffffff"});
    this.loadingBar = game.add.sprite(400, 350, "loadingbar");
		this.load.setPreloadSprite(this.loadingBar);
    
    //Sprites
    game.load.image('car', '/game/assets/car.png');
    game.load.image('background', '/game/assets/background.png');
    game.load.image('gameBackground', '/game/assets/gameBackground.png');
    game.load.image('menuBackground', '/game/assets/menuBackground.png');
    game.load.image('asphalt', '/game/assets/asphalt.png');
    game.load.image('trees', '/game/assets/trees.png');
    game.load.image('railingHorizontal', '/game/assets/railingHorizontal.png');
    game.load.image('railingVertical', '/game/assets/railingVertical.png');
    game.load.image('sand', '/game/assets/sand.png');
    game.load.image('water', '/game/assets/water.png');
    
    //Spritesheets
    game.load.spritesheet('fire', '/game/assets/fireAnimation.png', 64, 64);
    game.load.spritesheet('flag', '/game/assets/coinAnimation.png', 100, 100);
    
    //Fonts
    this.game.load.bitmapFont('stylishFont', '/game/assets/styleFont.png', '/game/assets/styleFont.fnt');
    this.game.load.bitmapFont('labelFont', '/game/assets/labelFont.png', '/game/assets/labelFont.fnt');
    
  },
  
  create: function() {
      this.game.state.start("menu");
  }
}