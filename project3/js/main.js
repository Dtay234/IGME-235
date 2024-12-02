// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application();

let sceneWidth, sceneHeight;

// aliases
let stage;
let assets;

// game variables
let startScene;
let gameScene, ball, scoreLabel, gameOverScoreLabel;
let gameOverScene;

let score = 0;
let life = 100;
let levelNum = 1;
let paused = true;

let keysDown = [];

// Load all assets
loadImages();

async function loadImages() {
  // https://pixijs.com/8.x/guides/components/assets#loading-multiple-assets
  /*
  PIXI.Assets.addBundle("sprites", {
    spaceship: "images/spaceship.png",
    explosions: "images/explosions.png",
    move: "images/move.png",
  });

  // The second argument is a callback function that is called whenever the loader makes progress.
  assets = await PIXI.Assets.loadBundle("sprites", (progress) => {
    console.log(`progress=${(progress * 100).toFixed(2)}%`); // 0.4288 => 42.88%
  });
    */
  setup();
}

async function setup( ) {
    await app.init({ width: 600, height: 600});
    
    document.body.appendChild(app.canvas);
    
    
    stage = app.stage;
    sceneWidth = app.renderer.width;
    sceneHeight = app.renderer.height;
    
    // #1 - Create the start scene
    startScene = new PIXI. Container( );
    stage.addChild(startScene);
    
    // #2 - Create the main game scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);
    
    // #3 - Create the gameOver scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);
    
    // #4 - Create labels for all 3 scenes
    createLabelsAndButtons();

    // #5 - Create ship
    ball = new Ball();
    gameScene.addChild(ball);

    
    window.addEventListener("keydown", keyDownHandler);
    window.addEventListener("keyup", keyUpHandler);

    // #8 - Start update loop
    app.ticker.add(gameLoop);

    // #9 - Start listening for click events on the canvas

    // Now our `startScene` is visible
    // Clicking the button calls startGame()
}

function keyDownHandler(e) {
    keysDown.push(e.key);
}

function keyUpHandler(e) {
    keysDown = keysDown.filter((x) => x != e.key);
}

function createLabelsAndButtons() {
    let buttonStyle = {
    fill: 0xff0000,
    fontSize: 48,
    fontFamily: "Futura",
    };
    
    let startLabel1 = new PIXI.Text("Circle Blast!", {
    fill: 0xffffff,
    fontSize: 96,
    fontFamily: "Futura",
    stroke: 0xff0000,
    strokeThickness: 6,
    });
    
    startLabel1.x = 50;
    startLabel1.y = 120;
    startScene.addChild(startLabel1);
    
    // make middle start label
    let startLabel2 = new PIXI.Text( "R U worthy .. ?", {
    fill: 0xffffff,
    fontSize: 32,
    fontFamily: "Futura",
    fontStyle: "italic",
    stroke: 0xff0000,
    strokeThickness: 6,
    });
    
    startLabel2.x = 185;
    startLabel2.y = 300;
    startScene.addChild(startLabel2);

    // make start game button
    let startButton = new PIXI.Text("Enter, if you dare!", buttonStyle);
    startButton.x = sceneWidth / 2 - startButton.width / 2;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame); 
    startButton.on("pointerover", (e) => (e.target.alpha = 0.7)); 
    startButton.on("pointerout", (e) => (e.currentTarget.alpha = 1.0)); 
    startScene.addChild(startButton);

    // 2 set up gameScene
    let textStyle = {
        fill: 0xffffff,
        fontSize: 18,
        fontFamily: "Futura",
        stroke: 0xff0000,
        strokeThickness: 4,
    };
    
    scoreLabel = new PIXI.Text("", textStyle);
    scoreLabel.x = 5;
    scoreLabel.y = 5;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);

    // 3 - set up `gameOverScene`
    // 3A - make game over text
    let gameOverText = new PIXI.Text("Game Over!\n        :-O", {
    fill: 0xffffff,
    fontSize: 64,
    fontFamily: "Futura",
    stroke: 0xff0000,
    strokeThickness: 6,
    });
    gameOverText.x = sceneWidth / 2 - gameOverText.width / 2;
    gameOverText.y = sceneHeight / 2 - 160;
    gameOverScene.addChild(gameOverText);

    
    gameOverScoreLabel = new PIXI.Text( "", {
        fill: 0xffffff,
        fontSize: 32,
        fontFamily: "Futura",
        fontStyle: "italic",
        stroke: 0xff0000,
        strokeThickness: 6,
    });
    gameOverScoreLabel.x = sceneWidth / 2 - gameOverText.width / 2;
    gameOverScoreLabel.y = sceneHeight / 2;
    gameOverScene.addChild(gameOverScoreLabel);
  
    // 3B - make "play again?" button
    let playAgainButton = new PIXI.Text("Play Again?", buttonStyle);
    playAgainButton.x = sceneWidth / 2 - playAgainButton.width / 2;
    playAgainButton.y = sceneHeight - 100;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", startGame); // startGame is a function reference
    playAgainButton.on("pointerover", (e) => (e.target.alpha = 0.7)); // concise arrow function with no brackets
    playAgainButton.on("pointerout", (e) => (e.currentTarget.alpha = 1.0)); // ditto
    gameOverScene.addChild(playAgainButton);
}

function startGame() {
    console. log("startGame called");
    startScene.visible = false;
    gameOverScene. visible = false;
    gameScene.visible = true;
    
    score = 0;
    increaseScoreBy(0);
    loadLevel();

    setTimeout(() => {
        paused = false;
    }, 50);
}

function increaseScoreBy(value) {
    score += value;
    scoreLabel.text = `Score: ${score}`;
}



function gameLoop(){
    if (paused) return; 
  
    // #1 - Calculate "delta time"
    let dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12) dt = 1 / 12;
  
  
    // #2 - Move Ship
    let mousePosition = app.renderer.events.pointer.global;

    let amt = 6 * dt; 
    let newX = lerp(ship.x, mousePosition.x, amt);
    let newY = lerp(ship.y, mousePosition.y, amt);

    let w2 = ship.width / 2;
    let h2 = ship.height / 2;
    ship.x = clamp(newX, 0 + w2, sceneWidth - w2);
    ship.y = clamp(newY, 0 + h2, sceneHeight - h2);


    

    // #3 - Move Circles
    for (let c of circles) {
        c.move(dt);
        if (c.x <= c.radius|| c.x >= sceneWidth - c.radius) {
            c.reflectX();
            c.move(dt);
            }
        if (c.y <= c.radius || c.y >= sceneHeight - c.radius) {
            c.reflectY();
            c.move(dt);
        }
    }
    
    // #4 - Move Bullets
    for (let b of bullets) {
        b.move(dt);
    }
  
    // #5 - Check for Collisions
    for (let c of circles) {
    
        for (let b of bullets) {
            if (rectsIntersect(c, b)) {
                fireballSound.play();
                createExplosion(c.x, c.y, 64, 64);
                gameScene.removeChild(c);
                c.isAlive = false;
                gameScene.removeChild(b);
                b.isAlive = false;
                increaseScoreBy(1);
                break;
            }
        }
        if (c.isAlive && rectsIntersect(c, ship)) {
            hitSound.play();
            gameScene.removeChild(c);
            c.isAlive = false;
            decreaseLifeBy(20);
        }
    }
  
  
    // #6 - Now do some clean up
    bullets = bullets.filter((b) => b.isAlive);
    circles = circles.filter((c) => c.isAlive);
    explosions = explosions.filter((e) => e.playing);
  
    // #7 - Is game over?
    if (life <= 0){
        end();
        return; // return here so we skip #8 below
    }
  
    // #8 - Load next level
    if (circles.length == 0) {
        levelNum++;
        loadLevel();
    }
}

function createCircles(numCircles = 10) {
    for (let i = 0; i < numCircles; i++) {
    let c = new Circle(10, 0xffff00);
    c.x = Math.random() * (sceneWidth - 50) + 25;
    c.y = Math.random() * (sceneHeight - 400) + 25;
    circles.push(c);
    gameScene.addChild(c);
    }
}

function loadLevel(){
    
}

function end() {
    paused = true;

    
    gameOverScene. visible = true;
    gameScene.visible = false;

    gameOverScoreLabel.text = `       Your final score: ${score}`;
}

/*
function loadSpriteSheet() {
    let spriteSheet = PIXI. Texture.from("images/explosions.png");
    let width = 64;
    let height = 64;
    let numFrames = 16;
    let textures = [];
    for (let i = 0; i < numFrames; i++) {
        let frame = new PIXI. Texture( {
        source: spriteSheet,
        frame: new PIXI.Rectangle(i * width, 64, width, height),
        });
        textures.push(frame);
    }
    
    return textures;
    
}
    */

