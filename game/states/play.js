"use strict";

var playState = {
    init : function() {
        if(this.game.multiplayerEnabled) {
            this.socket = getSocket();
            this.multiplayer = true;
            this.otherPlayerIsReady = false;
            this.enemyPositions;
            this.selfInterval = null;
            this.lastUpdateSent = new Date();
            this.enemyName = null;
            this.enemyPositions = {
                x: 560,
                y: 560,
                angle: 90,
                timestamp: 0
            };
        }
        
        this.game.camera.scale.x = 1;
        this.game.camera.scale.y = 1;
        
        this.startingAngle = 90;
        this.startingX = 560;
        this.startingY = 620;
        
        this.carDamage = 0;
        this.startingCarHealth = 5;
        this.carHealth = this.startingCarHealth;
        this.carDestroyedPostGame = false;
        
        this.driftCount = 0;
        this.driftTotal = 0;
        this.bestDrift = 0;
        this.driftStarted = false;
        this.driftStartTime = null;;
        this.driftBoost = 0;
        this.driftRelease = false;
        this.driftReleaseStarted = false;
        this.driftReleaseStartedDate = null;
        this.driftResetted = true;
        this.driftBoostAccelerationMultiplier = 0;
        
        /* Velocity values shown to the user are halved! */
        this.onSand = false;
        this.maxVelocityOnSand = 160;
        this.sandMultiplier = 0.95;
        this.defaultFriction = 1; 
        this.brakingFriction = 5;
        this.velocity = 0;
        this.startingAcceleration = 5;
        this.acceleration = this.startingAcceleration;
        this.startingMaxVelocity = 360;
        this.maxVelocity = 360;
        this.maxVelocityReversing = 200;
        this.turningSpeed = 11;
        
        this.countdownStartTime = null;
        
        this.flagsCollected = 0;
        this.flagPositions = [ {x: 1010, y: 110},
            {x: 580, y: 320},
            {x: 580, y: 640},
            {x: 580, y: 100},
            {x: 130, y: 470},
            {x: 1010, y: 110},
            {x: 580, y: 640},
            {x: 580, y: 320},
            {x: 580, y: 100},
            {x: 1010, y: 640},
            {x: 1010, y: 110},
            {x: 130, y: 470},
            {x: 580, y: 640}
        ];
    },
  
    create : function() {
        var game = this.game;
        
        game.sound.mute = true;
        
        //Fade from black
        this.camera.flash('#000000');
        
        //Game 
        this.pregame = true;
        this.raceStarted = false;
        this.raceOver = false;
        game.physics.p2.setImpactEvents(true);
        game.physics.p2.restitution = 1;
        
        //Collision groups
        this.playerCollisionGroup = game.physics.p2.createCollisionGroup();
        this.flagCollisionGroup = game.physics.p2.createCollisionGroup();
        this.railingCollisionGroup = game.physics.p2.createCollisionGroup();
        this.sandCollisionGroup = game.physics.p2.createCollisionGroup();
        this.waterCollisionGroup = game.physics.p2.createCollisionGroup();
        
        //Water
        this.water = game.add.tileSprite(210, 400, 740, 169, 'water');
        this.waterOverlay = game.add.tileSprite(210, 400, 740, 169, 'water');
        this.water.autoScroll(-4);
        this.waterOverlay.autoScroll(4);
        this.waterOverlay.alpha = 0.2;
        
        this.waterBody = game.add.sprite(245, 425);
        this.game.physics.p2.enable(this.waterBody);
        this.waterBody.body.static = true;
        this.waterBody.body.setRectangle(660, 110, 330, 55);
        this.waterBody.body.setCollisionGroup(this.waterCollisionGroup);
        this.waterBody.body.collides(this.playerCollisionGroup);
        
        //Create map
        game.add.tileSprite(0, 0, 1152, 768, 'gameBackground');
        game.add.tileSprite(0, 0, 1152, 768, 'asphalt');
        
        
        //Create sand
        this.sand = game.add.sprite(575, 210,'sand');
        game.physics.p2.enable(this.sand);
        this.sand.body.static = true;
        this.sand.body.setRectangle(750, 80, 0, -5);
        this.sand.body.data.shapes[0].sensor = true;
        this.sand.body.setCollisionGroup(this.sandCollisionGroup);
        this.sand.body.collides(this.playerCollisionGroup);
        
        //Add asphalt
        game.add.tileSprite(0, 0, 1152, 768, 'asphalt');
        
        //Create car for player
        this.car = game.add.sprite(this.startingX, this.startingY, 'car');
        this.car.scale.setTo(0.8, 0.8);
        game.physics.p2.enable(this.car);
        this.car.body.angle = this.startingAngle;
        this.car.body.setCollisionGroup(this.playerCollisionGroup);
        this.car.body.collides(this.flagCollisionGroup, this.flagCollision, this);
        this.car.body.collides(this.railingCollisionGroup, this.railingCollision, this);
        this.car.body.collides(this.sandCollisionGroup);
        this.car.body.collides(this.waterCollisionGroup, this.waterEntered, this);
        this.car.body.onBeginContact.add(this.sandEntered, this);
        this.car.body.onEndContact.add(this.sandExited, this);
        this.car.body.onBeginContact.add(this.flagEntered, this);
        
        //Car for other player in multiplayer
        if(this.multiplayer) {
            this.enemyCar = game.add.sprite(this.startingX, this.startingY, 'car');
            this.enemyCar.alpha = 0.5;
            this.enemyCar.scale.setTo(0.8, 0.8);
            game.physics.p2.enable(this.enemyCar);
            this.enemyCar.body.kinematic = true;
            this.enemyCar.body.angle = this.startingAngle;
        }
        
        //Create railings
        this.railings = game.add.group();
        this.railings.enableBody = true;
        this.railings.physicsBodyType = Phaser.Physics.P2JS;
        
        this.leftRailing = this.railings.create(65, 370, 'railingVertical');
        this.leftRailing.body.static = true;
        this.leftRailing.body.setRectangle(43, 645, -15, 0);
        this.leftRailing.body.setCollisionGroup(this.railingCollisionGroup);
        this.leftRailing.body.collides(this.playerCollisionGroup);
        
        this.rightRailing = this.railings.create(1090, 370, 'railingVertical');
        this.rightRailing.body.static = true;
        this.rightRailing.body.setRectangle(43, 645, 10, 0);
        this.rightRailing.scale.setTo(-1,1); //Flip horizontally
        this.rightRailing.body.setCollisionGroup(this.railingCollisionGroup);
        this.rightRailing.body.collides(this.playerCollisionGroup);
        
        this.topRailing = this.railings.create(590, 30, 'railingHorizontal');
        this.topRailing.body.static = true;
        this.topRailing.body.setRectangle(1032, 30, 0, -5);
        this.topRailing.body.setCollisionGroup(this.railingCollisionGroup);
        this.topRailing.body.collides(this.playerCollisionGroup);
        
        this.bottomRailing = this.railings.create(590, 680, 'railingHorizontal');
        this.bottomRailing.body.static = true;
        this.bottomRailing.body.setRectangle(1032, 30, 0, 30);
        this.bottomRailing.body.setCollisionGroup(this.railingCollisionGroup);
        this.bottomRailing.body.collides(this.playerCollisionGroup);
        
        this.railings.forEachAlive(game.debug.body,game.debug,"#ff9090",false);
        
        //Add trees
        game.add.tileSprite(0, 0, 1152, 768, 'trees');
        
        //Back to menu button
        this.menuButton = this.game.add.text(1040, 
                740,
                "Return to menu",
                { font: '30px',
                  fill: "#ffffff",
                  backgroundColor: "#000000",
                  align: 'center'}
            );
        this.menuButton.anchor.set(0.5);
        this.menuButton.inputEnabled = true;
        var _this = this;
        this.menuButton.events.onInputUp.add(function() {
            _this.returnToMenu(_this.multiplayer);
        });
        
        //Create flags
        this.flagsCollected = 0;
        this.flag = game.add.sprite(this.flagPositions[0].x, this.flagPositions[0].y, "flag");
        this.flag.scale.setTo(0.7, 0.7);
        this.flag.animations.add("shine");
        this.flag.animations.play("shine", 10,true,true);
        this.game.physics.p2.enable(this.flag);

        this.flag.body.setCircle(35);
        this.flag.body.data.shapes[0].sensor = true;
        this.flag.body.static = true;
        this.flag.body.setCollisionGroup(this.flagCollisionGroup);
        this.flag.body.collides(this.playerCollisionGroup);
        //this.flag.scale.setTo(0.5,0.5);
        
        
        //Fire effect
        this.fire = game.add.sprite(this.car.x-90,this.car.y-90,'fire');
        this.fire.animations.add('burn');
        this.fire.visible = false;
        
        
        //Create labels
        this.mainLabel = game.add.bitmapText(game.world.centerX,game.world.centerY, "labelFont", 32);
        this.mainLabel.anchor.set(0.5);
        this.mainLabel.fixedToCamera = true;
        this.velocityMeter = game.add.text(640, 720, "vel: ", { backGroundColor: "#000000", fill: "#ffffff" });
        
        //Create countdown timer
        this.countdownStarted = false;
        
        //Race timer
        this.timeLabel = game.add.text(576, 720, "0:00", { backgroundColor: "#000000", fill: "#ffffff" });
        
        //Create inputs
        this.cursors = game.input.keyboard.createCursorKeys();
        this.spaceBar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.restartButton = game.input.keyboard.addKey(Phaser.Keyboard.R);
        
        //Notify ready to start if in multiplayer
        if(this.multiplayer) {
            this.flag.visible = false;
            this.socket.emit("readyToStart");
            var _this = this;
            this.socket.on("enemyName", function(username) { _this.enemyName = username });
            this.socket.on("receivePosition", function(data) { _this.updateEnemyPosition(data); });
            this.socket.on("otherPlayerCrashed", function() { _this.removeEnemy(); } );
            this.socket.on("flagPositions", function(flagPositions) { _this.addMultiplayerFlags(flagPositions); });
            this.socket.on("startGame", function() { _this.otherPlayerIsReady = true; });
            this.socket.on("youWon", function(rating) { _this.showAfterGameMessage("won", rating); });
            this.socket.on("youLost", function(rating) { _this.showAfterGameMessage("lost", rating); });
            this.socket.on("youTied", function(rating) { _this.showAfterGameMessage("tied", rating); });
        }
    },
  
    update : function() {
        if(this.multiplayer) {
            this.multiPlayerUpdateLoop();
        } else {
            this.singlePlayerUpdateLoop();
        }
    },
    
    
    singlePlayerUpdateLoop : function() {
        //Pre-Game update loop
        if(this.pregame) {  //Pressing spacebar starts a 3 second countdown after which the race starts
            if(!this.countdownStarted)
                this.mainLabel.text = "Press SPACEBAR to start countdown!";
            
            if(this.spaceBar.isDown && !this.countdownStarted) {
                this.mainLabel.text = "";
                this.countDownTicks = -1;
                this.countdownStartTime = new Date();
                this.countdownStarted = true;
            }
            else if (this.countdownStarted) {
                this.car.alpha = 1;
                console.log(this.car.body.velocity.x);
                
                if( !this.updateCountdownTimer(this.countdownStartTime, 2100) ) {
                    this.raceTimerStarted = new Date();
                    this.startRace();
                }
            }
        }
        //Race update loop 
        if(this.raceStarted) {
            this.handleCarMovement(this.cursors, this.car, this.spaceBar);
            this.updateRaceTimer(this.raceTimerStarted, this.timeLabel);
            this.updateVelocityMeter(this.velocityMeter);
        }
        //Race over, results screen/crash screen
        if(this.raceOver) {
            this.mainLabel.alpha = 1;
            
            if(!this.carDestroyedPostGame) {
                this.handleCarMovement(this.cursors, this.car, this.spaceBar);
            }
            this.updateVelocityMeter(this.velocityMeter);
            
            if(this.restartButton.isDown) {
                this.restartGame();
            }
        }
    },
    
    multiPlayerUpdateLoop : function() {
        
        if(this.pregame) {
            if(!this.countdownStarted)
                if(!this.enemyName) {
                    this.mainLabel.text = "Please wait until the other player is ready.";
                } else {
                    this.mainLabel.text = "Please wait until the other player is ready.\nYou're playing against " + this.enemyName + ".";
                }
                
            if( this.otherPlayerIsReady && !this.countdownStarted) {
                //Setup update interval here
                var _this = this;
                if(this.selfInterval==null) {
                    this.selfInterval = window.setInterval(function() {
                        sendCurrentPosition(_this.car.body.x, _this.car.body.y, _this.car.body.angle, new Date());;
                    }, 100);
                }
                
                
                this.mainLabel.text = "";
                this.countDownTicks = -1;
                this.countdownStartTime = new Date();
                this.countdownStarted = true;
            }
            else if (this.countdownStarted) {
                if( !this.updateCountdownTimer(this.countdownStartTime, 2100) ) {
                    this.raceTimerStarted = new Date();
                    this.startRace();
                }
            }
        }
        
        //Race update loop 
        if(this.raceStarted) {
            this.handleCarMovement(this.cursors, this.car, this.spaceBar);
            this.updateRaceTimer(this.raceTimerStarted, this.timeLabel);
            this.updateVelocityMeter(this.velocityMeter);
        }
        
        if(this.raceOver) {
            if(!this.carDestroyedPostGame) {
                this.handleCarMovement(this.cursors, this.car, this.spaceBar);
            }
            this.updateVelocityMeter(this.velocityMeter);
        }
    },
    
    /*
     * Hides enemy car from the game with a fade effect if they crash */
    removeEnemy : function() {
        var tween = this.game.add.tween(this.enemyCar).to( { alpha: 0 }, 
            3000
            , "Sine.easeInOut");
        tween.start();
    },
    
    updateEnemyPosition : function(data) {
        /* Need to calculate the shortest angle 
         * here because tweens dont use it by default  */
        var shortestAngle = this.game.math.getShortestAngle(this.enemyCar.body.angle, data.angle);
        var newAngle = this.enemyCar.body.angle + shortestAngle; 
        
        var tween = this.game.add.tween(this.enemyCar.body).to( { x: data.x, y: data.y, angle: newAngle }, 
            Date.parse(data.timestamp) - Date.parse(this.lastUpdateSent)
            , Phaser.Easing.Quadratic.Out);
        tween.start();
        this.lastUpdateSent = data.timestamp;
    },
    
    addMultiplayerFlags : function(flagPositions) {
        this.flagPositions = flagPositions;
        this.flag.visible = true;
        this.flag.body.x = this.flagPositions[this.flagsCollected].x;
        this.flag.body.y = this.flagPositions[this.flagsCollected].y;
    },
    
    render: function() {
        /* Debug
        this.game.debug.body(this.sand);
        this.game.debug.body(this.car);
        this.game.debug.body(this.waterBody);
        */
      },
  
    startRace : function() {
        this.pregame = false;
        this.raceStarted = true;
        this.raceOver = false;
        this.car.body.static = false;
    },
    
    raceFinished : function() {
        this.winningTime = this.getWinningTime(this.raceTimerStarted);
        
        this.gameOver();

        this.winningTimeString = this.getWinningTimeAsString(this.winningTime); 
        var labelText = "You finished the race in\n" + this.winningTimeString + ".";
        
        if(!this.multiplayer) {
            labelText += "\nPress R to play again.";
            this.reportFinishedRace(this.winningTime);
        } else {
            labelText += "\nYou can exit or wait for the results.";
            sendFinished(this.winningTime);
        }
        this.mainLabel.text = labelText;
    },
    
    gameOver : function() {
        this.pregame = false;
        this.raceStarted = false;
        this.raceOver = true;
        this.carHealth = Infinity;
        this.mainLabel.alpha = 1;
        this.mainLabel.fontSize = 48;
    },
    
    carDestroyed : function(destroyType) {
        if(this.raceOver) { //Car drove to water in post game
            this.carDestroyedPostGame = true;
            this.car.body.static = true;
            this.velocity = 0;
            this.car.body.velocity.x = 0;
            this.car.body.velocity.y = 0;
            this.car.body.angularVelocity = 0;
            var tween = this.game.add.tween(this.car).to( { alpha: 0 }, 
                500
                , "Sine.easeInOut");
             tween.start();
            
            return;
        }
        this.carDestroyedPostGame = true;
        this.gameOver();
        
        if(!this.multiplayer) {
            this.game.camera.scale.x = 1.1;
            this.game.camera.scale.y = 1.1;
            this.game.camera.focusOn(this.car);
        }
        
        var labelText = "";
        this.car.body.static = true;
        this.velocity = 0;
        this.car.body.velocity.x = 0;
        this.car.body.velocity.y = 0;
        this.car.body.angularVelocity = 0;
        
        if(destroyType==="crash") {
            this.fire.x = this.car.x-32;
            this.fire.y = this.car.y-48;
            this.fire.visible = true;
            this.fire.animations.play('burn', 10,true,true);
            
            this.game.camera.flash("0xff0000");
            labelText += "You crashed the car.";
        } else if (destroyType==="drown") {
            this.car.visible = false;
            
            this.game.camera.flash("0x0a05af");
            labelText += "You're not a fish.";
        }
        
        if(!this.multiplayer) {
            this.reportCrashedRace();
            labelText += " Press R to restart.";
        } else {
            labelText += "\nYou can exit or wait for the results.";
            sendCrashed();
        }
        
        this.mainLabel.text = labelText;
    },
    
    reportFinishedRace : function(mstime) {
        var gamestats = {
            mstime: this.winningTime,
            crashed: false,
            driftCount: this.driftCount,
            driftTotal: this.driftTotal,
            flagsCollected: this.flagsCollected,
            bestDrift: this.bestDrift,
            damageTaken: this.carDamage
        };
        this.game.submitSPResults(gamestats);
    },
    
    reportCrashedRace : function() {
        var gamestats = {
            mstime: 0,
            crashed: true,
            driftCount: this.driftCount,
            driftTotal: this.driftTotal,
            flagsCollected: this.flagsCollected,
            bestDrift: 0,
            damageTaken: this.startingCarHealth
        };
        this.game.submitSPResults(gamestats);
    },
    
    restartGame : function() {
        this.game.camera.flash("0x000000");
        this.game.camera.scale.x = 1;
        this.game.camera.scale.y = 1;
        this.velocity = 0;
        this.car.alpha = 1;
        this.car.reset(this.startingX, this.startingY);
        this.car.body.velocity.x = 0;
        this.car.body.velocity.y = 0;
        this.car.body.angularVelocity = 0;
        this.car.body.angle = this.startingAngle;
        this.car.visible = true;
        
        this.flag.body.x = this.flagPositions[0].x;
        this.flag.body.y = this.flagPositions[0].y;
        this.flag.visible = true;
        
        this.init();
        
        this.fire.visible = false;
        
        this.velocityMeter.text = "vel: 0";
        this.timeLabel.text = "0:00";
        this.countdownStarted = false;
        this.pregame = true;
        this.raceStarted = false;
        this.raceOver = false;
    },
    
    returnToMenu : function(multiplayer) {
        if(!multiplayer) {
            this.game.state.start("menu");
        } else {
            window.clearInterval(this.selfInterval);
            this.socket.disconnect();
            this.game.state.start("menu");
        }
    },
    
    showAfterGameMessage: function(result, rating)  {
        var displayString = "You " + result + " against " + this.enemyName + ".";
        
        displayString += "\nYour new rating is " + rating;
        
        if(this.mainLabel.text === "") {
            var afterGameLabel = this.game.add.bitmapText(this.game.world.centerX, this.game.world.centerY, "labelFont", 32);
            var tween = this.game.add.tween(afterGameLabel).to( { alpha: 0 }, 
                5000
                , "Sine.easeInOut");
            tween.start();
        } else {
            this.mainLabel.text = displayString;
        }
    },
    
    handleCarMovement : function(cursors, car, driftKey) {
        car.body.angularVelocity = 0;
        
        this.maxVelocity = this.startingMaxVelocity - this.carDamage*10;
        this.maxVelocityReversing = this.startingMaxVelocity - this.carDamage*10;
        
        /* Drift mechanic: hold the drift button and turn the car.
         * After releasing the button (or after 2 seconds have passed) the car 
         * accelerates faster and the maximum velocity will be increased for 2 seconds.
         * The increased values depends on the change in the cars angle.  */
       
       //Manual drift release
        if(!driftKey.isDown && !this.driftRelease) {
            if(this.driftStarted) {
                this.driftRelease = true;
                this.driftReleaseStarted = true;
                this.driftBoost = Math.abs(this.driftBoost);
            } else {
                this.driftResetted = true;
            }
        }
       
       //Start drift
        if(this.velocity >= 240  && driftKey.isDown && !this.driftRelease && this.driftResetted && !this.onSand ) { 
            if(!this.driftStarted && this.driftResetted) { //No current drift, key has been lifted up
                this.driftStarted = true;
                this.driftStartDate = new Date();
            } 
            if(this.driftStarted) { //Update drift values
                var currentDate = new Date();
                if(Math.abs(this.driftStartDate-currentDate)>1500 ) { //Drift time limit passed->release
                    this.driftRelease = true;
                    this.driftReleaseStarted = true;
                    this.driftBoost = Math.abs(this.driftBoost);
                } else { //Add boost when turning 
                    if (cursors.left.isDown) {
                        this.driftBoost -= 1.5;
                        car.body.angle -= 2;
                    } else if (cursors.right.isDown) {
                        this.driftBoost += 1.5;
                        car.body.angle += 2;
                    }
                }
            }
        }
        else { //Normal movement
            //Get acceleration, acceleration slows down when velocity goes up
            //If velocity is negative use starting acceleration
            this.acceleration = (this.velocity >= 0 ? 100/(this.velocity*0.4+5) : this.startingAcceleration) ;
            
            //Increase speed by acceleration until max speed reached
            if (cursors.up.isDown && this.velocity <= this.maxVelocity) {
                this.velocity+=this.acceleration;
            } 
            
            //If on sand slow down velocity and stop drift
            if(this.onSand) {
                this.velocity *= this.sandMultiplier; 
                if(this.velocity > this.maxVelocityOnSand) {
                    this.velocity = this.maxVelocityOnSand;
                }
                
                this.driftBoost = 0;
                this.driftRelease = false;
                this.driftStarted = false;
            }
            
            //Apply drift boost here
            if(this.driftRelease) {
                if(this.driftReleaseStarted) {
                    if(this.driftBoost <= 5) { //Dont start boost if value too small
                        this.driftBoost = 0;
                        this.driftRelease = false;
                        this.driftStarted = false;
                    } else { //Get starting date
                        this.driftReleaseStartedDate = new Date();
                        this.displayDriftStyleLabel(this.driftBoost, this.car);
                        this.driftReleaseStarted = false;
                        this.driftBoostAccelerationMultiplier = Math.exp(Math.pow(this.driftBoost,2)/4000);
                    }
                }
                
                var currentDate = new Date();
                if(Math.abs(this.driftReleaseStartedDate-currentDate)>2000 || !this.driftRelease) { //Time passed
                    //Save best drift & other stats
                    this.bestDrift = this.driftBoost;
                    this.driftCount++;
                    this.driftTotal += this.driftBoost;
                
                    this.driftBoost = 0;
                    this.driftRelease = false;
                    this.driftStarted = false;
                } else { //Increase values
                    this.acceleration *= this.driftBoostAccelerationMultiplier;
                    if(this.velocity <= this.maxVelocity+this.driftBoost) {
                        this.velocity += this.acceleration;
                    }
                }
        
            } else { //Normal acceleration
                //Increase speed by acceleration until max speed reached
                if (cursors.up.isDown && this.velocity <= this.maxVelocity) {
                    this.velocity+=this.acceleration;
                } 
            }
            
            //Apply friction
            if(Math.abs(this.velocity)<=2) {
                this.velocity = 0;
            } else {
                this.velocity -= (this.velocity > 0 ? this.defaultFriction : -this.defaultFriction);    
            }
        
            if (cursors.down.isDown && this.velocity>=-this.maxVelocityReversing) {
                //Apply brakes or reverse
                this.velocity -= (this.velocity > 0 ? this.brakingFriction : 100/(-this.velocity*0.2+7) )
            }
            
            
            //Turn left, faster speed->faster turn
            if (cursors.left.isDown) {
                car.body.angularVelocity = -this.turningSpeed*(this.velocity/1000);
            } 
            if (cursors.right.isDown) { //Turn right
                car.body.angularVelocity = this.turningSpeed*(this.velocity/1000);
            }
            
            //Pythagoras theorem is veri useful
            car.body.velocity.x = this.velocity * Math.cos(this.game.math.degToRad(car.angle-this.startingAngle));
            car.body.velocity.y = this.velocity * Math.sin(this.game.math.degToRad(car.angle-this.startingAngle));
        }
    },
    
    // Show drift label after drift is released
    displayDriftStyleLabel : function(driftBoostAmount, car) {
        var text;
        if(driftBoostAmount < 20) {
            text = "Lame.";
        } else if (driftBoostAmount < 30) {
            text = "Okay.";
        } else if (driftBoostAmount < 40) {
            text = "Nice.";
        } else if (driftBoostAmount < 50) {
            text = "Climactic!";  
        } else if (driftBoostAmount < 60) {
            text = "Beautiful!";
        } else if (driftBoostAmount < 80 ) {
            text = "Amazing!";
        } else if (driftBoostAmount >= 80 ) {
            text = "Sensational!";
        }

        var stylishLabel = this.game.add.bitmapText(this.car.body.x, this.car.body.y, "stylishFont", text, 32);
        
        var tween = this.game.add.tween(stylishLabel).to( { alpha: 0 }, 2000, "Linear");
        tween.onComplete.add(
            function() { 
                stylishLabel.destroy();
            }, 
            this
        );
        tween.start();
    },
    
    
    //Update meter on the bottom right to show current velocity
    updateVelocityMeter : function(label) {
        label.text = "vel: " + Math.abs(Math.round(this.velocity/2)); // !! show a more realistic speed for the user
        if (this.driftRelease) {
            label.fill = "#ff0000";
        } else {
            label.fill = "#000000";
        }
    },
    
    flagEntered : function(body) {
        if(body.sprite.key === "flag") {
            this.flagsCollected++;
            
            if(this.flagsCollected===this.flagPositions.length) { //All flags collected
                this.flag.visible = false;
                this.flag.body.x = -500;
                this.flag.body.y = -500;
                this.raceFinished();
            } else { //Move flag to new position
                while( (this.flagPositions[this.flagsCollected].x == this.flag.body.x) && //Fix for multiplayer where flags can stack
                    (this.flagPositions[this.flagsCollected].y == this.flag.body.y) ) {
                    if(this.flagsCollected===this.flagPositions.length) {
                        this.flag.visible = false;
                        this.flag.body.x = -500;
                        this.flag.body.y = -500;
                        this.raceFinished();
                    } else {
                        this.flagsCollected++;   
                    }
                }
            
                this.flag.body.x = this.flagPositions[this.flagsCollected].x;
                this.flag.body.y = this.flagPositions[this.flagsCollected].y;
            }
        }
    },
    
    railingCollision : function() {
        this.takeDamage(1);
    },
    
        
    sandEntered : function(body) {
        if(body.sprite.key === "sand") {
            this.onSand = true;
        }
    },
    
    sandExited : function(body) {
        if(body.sprite.key === "sand") {
            this.onSand = false;
        }
    },
    
    waterEntered : function() {
        this.carDestroyed("drown");
    },
    
    takeDamage : function(val) {
        this.game.camera.shake(0.01, 50);
        this.carDamage += val;
        if(this.carDamage >= this.carHealth ) {
            this.carDestroyed("crash", this.multiplayer);
        }
    },
    
    //Returns time elapsed in seconds
    updateRaceTimer : function(startTime, timeLabel) {
        var currentTime = new Date();
        var diff = startTime - currentTime;
 
        var secondsElapsed = Math.abs(diff / 1000);

        var minutes = Math.floor(secondsElapsed / 60);
        var seconds = Math.floor(secondsElapsed) - (60 * minutes);
 
        timeLabel.text = (minutes == 0) ? '0' : minutes;
        timeLabel.text += (seconds < 10) ? ":0" + seconds : ":" + seconds;;
    },
    
    //Returns false when time reaches zero, else returns true
    updateCountdownTimer : function(startTime, msDuration) {
        var currentTime = new Date();
        var diff = startTime - currentTime;
     
        var ticksElapsed = Math.floor(Math.abs(diff)/(msDuration/3));
        if(ticksElapsed > this.countDownTicks ) {
            var labelText;
            
            switch(ticksElapsed) {
                case 0:
                    labelText = "3";
                    break;
                case 1:
                    labelText = "2";
                    break;
                case 2:
                    labelText = "1";
                    break;
                case 3:
                    labelText = "GO!";
            }
            
            var timeLabel = this.game.add.bitmapText(this.game.world.centerX, this.game.world.centerY, "labelFont", labelText, 78);
            timeLabel.anchor.set(0.5,0.5);
            this.countDownTicks = ticksElapsed;
            var sizeTween = this.game.add.tween(timeLabel).to( { fontSize: 24 }, msDuration/4, "Linear");
            var fadeTween = this.game.add.tween(timeLabel).to( { alpha: 0}, msDuration/4, "Linear");
            fadeTween.onComplete.add(
                    function() { 
                         timeLabel.destroy(); 
                    }, this
            );
            sizeTween.start();
            fadeTween.start();
            
            if(ticksElapsed===3) {
                return false;
            }
        }
        
        return true;
    },
    
    
    //Returns winning time as ms
    getWinningTime : function(startTime) {
        var currentTime = new Date();
        var diff = startTime - currentTime;
        return Math.abs(diff);
    },

    //Returns formatted time string, "minutes:seconds:milliseconds"
    getWinningTimeAsString : function(mstime) {
        var secondsElapsed = Math.abs(mstime / 1000);
        var minutes = Math.floor(secondsElapsed / 60);
        var seconds = Math.floor(secondsElapsed) - (60 * minutes);
        var milliseconds = Math.round((secondsElapsed % 1)*1000);
        
        var timestring  = (minutes == 0) ? '0' : minutes;
        timestring += (seconds < 10) ? ":0" + seconds : ":" + seconds;
        timestring += ".";
        if(milliseconds<10) {
            timestring += "00" + milliseconds;
        } else if (milliseconds < 100) {
            timestring += "0" + milliseconds;
        } else if (milliseconds < 1000) {
            timestring+= milliseconds;
        }

        return timestring;
    }
}