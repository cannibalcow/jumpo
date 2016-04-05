var Jumpo = function() {};
Jumpo.GameState = function() {};
Jumpo.GameTitle = function() {};
Jumpo.Boot = function() {};
Jumpo.PreloadState = function() {};

Jumpo.GameState.prototype = {
  highScore: 0,
  lastScore: 0,
  multiplier: 0,
  preload: function() {
      // reset onDownCallback
      this.input.keyboard.onDownCallback = function(e) {}
  },
  create: function() {
    this.physics.startSystem(Phaser.Physics.ARCADE);

    // background
    this.add.tileSprite(0, 0, 800, 600, 'background');

    // player
    this.heroCreate();

    // Soundfx and music
    this.jumpSound = this.add.audio('jump');
    this.music = this.add.audio('music');
    this.music.loop = true;
    this.music.play();

    // Groups
    this.platformsCreate();

    // Timers
    this.platformTimer = this.time.events.loop(400, this.addRandomPlatform, this);
    this.multiplierTimer = this.time.events.loop(1000, this.incrementMultiplier, this);

    // Highscore
    this.highScoreText = this.add.text(666, 20, "0", { font: "1.8em Arial", fill: "#ffffff", stroke: "#000000", strokeThickness: 4 });
    this.lastScoreText = this.add.text(666, 40, "0", { font: "1.8em Arial", fill: "#ffffff", stroke: "#000000", strokeThickness: 4 });
    this.multiplierText = this.add.text(666, 60, "0", { font: "1.8em Arial", fill: "#ffffff", stroke: "#000000", strokeThickness: 4  });
    // controls
    this.cursor = this.input.keyboard.createCursorKeys();
  },
  update: function() {
    this.physics.arcade.collide(this.hero, this.platforms);
    this.heroMove();
  },
  render: function() {
    this.highScoreText.text = "Highscore: " + this.highScore;
    this.lastScoreText.text = "Last: " + this.lastScore;
    this.multiplierText.text = "Multiplier: " + this.multiplier;
  },
  heroMove: function() {
    if(this.cursor.left.isDown) {
      this.hero.body.velocity.x = -200;
    } else if(this.cursor.right.isDown){
      this.hero.body.velocity.x = 200;
    } else {
      this.hero.body.velocity.x = 0;
    }

    if(this.cursor.up.isDown && this.hero.body.touching.down) {
      this.jumpSound.play();
      this.add.tween(this.hero).to({angle: 365}, 350).start();
      this.hero.body.velocity.y = -500;
    }

    if((this.hero.y > this.game.height || this.hero.x <= -32 ) && this.hero.alive) {
      var score = Math.floor(this.hero.x) * this.multiplier;
      this.lastScore = score;
      if(score > this.highScore) {
        this.highScore = score;
      }
      this.resetGame();
    }
  },
  incrementMultiplier: function() {
    this.multiplier = this.multiplier + 1;
  },
  resetGame: function() {
    this.multiplier = 0;
    this.hero.x = 40;
    this.hero.y = 20;
    var y = this.rnd.integerInRange(0, 9) * 64;
    this.platforms.forEach(function(p, i){
        if(p.body.velocity.x == -20) {
          p.kill();
        }
    });
    this.platforms.add(this.platformsCreateOne(0, y, -20));
  },
  heroCreate: function() {
    this.hero = this.add.sprite(40, 20, 'hero');
    this.hero.anchor.set(0.5);
    this.physics.arcade.enable(this.hero);
    this.hero.body.gravity.y = 1300;
    this.hero.body.checkCollision.up = true;
    this.hero.body.checkCollision.down = true;
    this.hero.body.checkCollision.left = true;
    this.hero.body.checkCollision.right = true;
  },
  platformsCreateOne: function( x, y, velox) {
    var platform = this.platforms.getFirstDead(true, x, y);
    platform.body.velocity.x = velox;
    platform.body.immovable = true;
    platform.checkWorldBounds = true;
    platform.outOfBoundsKill = true;
    return platform;
 },
  platformsCreate: function() {
    this.platforms = this.add.group();
    this.platforms.enableBody = true;
    this.platforms.createMultiple(20, 'platform');
    this.platforms.add(this.platformsCreateOne(0, 64, -20), true);
  },
  addRandomPlatform: function() {
    var y = this.rnd.integerInRange(0, 9) * 64;
    var platform = this.platformsCreateOne(800, y, -380);
    this.platforms.add(platform, true);
  },
};

/**
  BOOT state
*/
Jumpo.Boot.prototype = {
  preload: function() {
    this.load.image("loading", "assets/loading.png");
  },
  create: function() {
    this.stage.backgroundColor = '#79C5FF';
    this.game.state.start("Preload");
  }
};

/**
 GAME TITLE STATE
*/
Jumpo.GameTitle.prototype = {
  preload: function() {
    this.title = this.add.text(this.world.centerX, this.world.centerY - 150, "0", { font: "4em Arial Black", fill: "#000000", align: "center"} );
    this.title.anchor.setTo(0.5, 0.5);
    this.title.text = "Jumpo the pirate!";
    this.help = this.add.text(this.world.centerX, this.world.centerY, "0", { font: "2.5em Arial Black", fill: "#ffffff", align: "center", stroke: "#000000", strokeThickness: 4 });
    this.help.anchor.setTo(0.5, 0.5);
    this.help.text = "Use the arrowkeys to move and jump\n Get as far to the right\n\nPress any key to start"
  },
  create: function() {
    this.input.keyboard.onDownCallback = function(e) {
      this.game.state.start("Game");
    }
  },
  render: function() {

  }
};

/**
PRE LOAD STATE
*/
Jumpo.PreloadState.prototype = {
  preload: function() {
    this.info = this.add.text(this.world.centerX - 150, this.world.centerY - 80, "0", { font: "4.0em Arial Black", fill: "#ffffff", stroke: "#000000", strokeThickness: 4 });
    this.info.text = "Loading junk...";
    var loadingBar = this.add.sprite(this.world.width/2,this.world.height/2,"loading");
    loadingBar.scale.x = 2;
    loadingBar.anchor.setTo(0.5,0.5);
    this.load.setPreloadSprite(loadingBar);
    this.load.image('platform', 'assets/platform.png');
    this.load.image('hero', 'assets/hero.png');
    this.load.image('background', 'assets/bg.png');
    this.load.audio('jump', 'assets/jump.wav');
    this.load.audio('music', 'assets/music.wav');
  },
  create: function() {
    this.game.state.start('GameTitle');
  },
  render: function() {

  }
};

window.onload = function() {
    var game = new Phaser.Game(800, 600, Phaser.AUTO, 'jumpo-content');
    game.state.add('Boot', Jumpo.Boot);
    game.state.add('Preload', Jumpo.PreloadState);
    game.state.add('GameTitle', Jumpo.GameTitle);
    game.state.add('Game', Jumpo.GameState);
    game.state.start('Boot');
};
