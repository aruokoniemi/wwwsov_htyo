"use strict";

var menuState = {
    addMenuItem : function(text, callback) {
        var menuItem = this.game.add.text(this.game.world.centerX, 
            this.titleTextYPos + 50 + this.menuItemsCount*80,
            text,
            {   
                font: "30px",
                stroke: "#ffffff",
                strokeThickness: 1,
                fill: "#ffffff",
            }
        );
        
        menuItem.anchor.setTo(0.5,0.5);
        
        menuItem.fixedToCamera = true;
      
        var onFocus = function(target) {
            target.fill = "#000000";
        };
      
        var outFocus = function(target) {
            target.fill = "#ffffff";
        };
        
        menuItem.inputEnabled = true;
        menuItem.events.onInputUp.add(callback);
        menuItem.events.onInputOver.add(onFocus);
        menuItem.events.onInputOut.add(outFocus);
        
        this.menuItemsCount++;
    },
  
    init : function() {
        this.menuItemsCount = 1; // Used to align new menu items
        this.titleTextYPos = 100; //Starting position for title text
    },
  
    create : function() {
        var game = this.game;
        //Background
        var background = game.add.tileSprite(0, 0, 1152, 768, 'menuBackground');
        background.alpha = 0.5;
        var invObj = game.add.sprite(game.world.centerX, game.world.centerY);
        game.physics.p2.enable(invObj);
        game.physics.p2.restitution = 1;
        invObj.body.setCircle(200,200);
        invObj.body.dynamic = true;
        invObj.body.collideWorldBounds = true;
        invObj.body.mass = 0.01;
        invObj.body.damping = 0;
        invObj.body.velocity.x = 300;
        invObj.body.velocity.y = 300;
    
        //Title
        var titleText = game.add.text(game.world.centerX, this.titleTextYPos, "MyCarGame", {
        font: 'bold 50pt TheMinion',
        fill: '#FDFFB5',
         align: 'center'
        });
        titleText.fixedToCamera = true;
        titleText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);
        titleText.anchor.set(0.5);

        //Add Menu Items
        this.addMenuItem("PLAY SINGLEPLAYER", function() {
            game.camera.scale.x = 1.1;
            game.camera.scale.y = 1.1;
            game.camera.fade(); 
            game.multiplayerEnabled = false; 
            game.state.start('play'); 
            
        });
        this.addMenuItem("PLAY MULTIPLAYER", function() { 
            game.camera.scale.x = 1;
            game.camera.scale.y = 1;
            
            game.camera.fade(); 
            game.state.start('searching'); 
        });


        this.game.camera.scale.x = 1.7;
        this.game.camera.scale.y = 1.7;
        this.game.camera.follow(invObj);

    },
  
    update: function() {
    },
    
    start: function() {
        
    }
  
}
