// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application();

let sceneWidth, sceneHeight, offset;

// aliases
let stage;
let assets;

// game variables
let startScene;
let gameScene, ball, board, side, topBottom, scoreLabel, gameOverScoreLabel, mouseLock, tilting;
let gameOverScene;

let score = 0;
let paused = true;

let keysDown = [];
let objects = [];

let scaleFactorX = 1;
let scaleFactorY = 1;

let shape = [];


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
    offset = {x:sceneWidth/2, y:sceneHeight/2};
    
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

    board = new PIXI.Graphics();
    board.beginFill(0xffffff);
	board.drawRect(-offset.x, -offset.y, offset.x * 2, offset.y * 2);
    //rect.lineStyle(4, 0xFFFF00, 1);
	board.endFill();
    board.x = 0;
    board.y = 0;
    gameScene.addChild(board);
    objects.push(board);

    side = new PIXI.Graphics();
    side.beginFill(0x808080);
        side.drawRect(0,
            0,
            1, 
            1);

    side.endFill();
    gameScene.addChild(side);

    topBottom = new PIXI.Graphics();
    topBottom.beginFill(0x808080);
    topBottom.drawRect(0,
            0,
            1, 
            1);

            topBottom.endFill();
    gameScene.addChild(topBottom);

    generateShape();


    ball = new Ball(10, 0xff0000, shape[0].x, shape[0].y);
    gameScene.addChild(ball);
    objects.push(ball);
    
    
    
    
    window.addEventListener("keydown", keyDownHandler);
    window.addEventListener("keyup", keyUpHandler);
    window.onmousedown = onclickhandler;
    window.onmouseup = onunclickhandler;

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

function onclickhandler(e) {
    mouseLock = {x:app.renderer.events.pointer.global.x, y:app.renderer.events.pointer.global.y};
    tilting = true;
}

function onunclickhandler(e) {
    tilting = false;
    ball.tilt.x = 0;
    ball.tilt.y = 0;
}

function createLabelsAndButtons() {
    let buttonStyle = {
    fill: 0xff0000,
    fontSize: 48,
    fontFamily: "Futura",
    };
    
    let startLabel1 = new PIXI.Text("Gravity Art", {
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

    unmap();
  
/*
    if (keysDown.includes('d')) {
        ball.tilt.x += 0.6;
        if (ball.tilt.x > 3)
        {
            ball.tilt.x = 3;
        }
    }
    else if (keysDown.includes('a')) {
        ball.tilt.x -= 0.6;
        if (ball.tilt.x < -3)
            {
                ball.tilt.x = -3;
            }
    }
    else { 
        ball.tilt.x = 0;
    }
    if (keysDown.includes('w')) {
        ball.tilt.y -= 0.3;
        if (ball.tilt.y < -3)
            {
                ball.tilt.y = -3;
            }
    }
    else if (keysDown.includes('s')) {
        ball.tilt.y += 0.3;
        if (ball.tilt.y > 3)
            {
                ball.tilt.y = 3;
            }
    }
    else {
        ball.tilt.y = 0;
    }
        */

    let mousePosition = app.renderer.events.pointer.global;

    if (tilting) {
        ball.tilt.x = (mousePosition.x - mouseLock.x) / 60;
        ball.tilt.y = (mousePosition.y - mouseLock.y) / 60;

        
    }
    if (Math.abs(ball.tilt.x) > 1) {
        ball.tilt.x = 1 * Math.sign(ball.tilt.x);
    }
    if (Math.abs(ball.tilt.y) > 1) {
        ball.tilt.y = 1 * Math.sign(ball.tilt.y);
    }

    ball.velocity.x += ball.tilt.x * 3;
    ball.velocity.y += ball.tilt.y * 3;
    ball.x += ball.velocity.x * dt;
    ball.y += ball.velocity.y * dt;
    
    drawPath();
    map();
}

function loadLevel(){
    

    map();
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

function map() {
    scaleFactorX = (4 - Math.abs(ball.tilt.x)) / 4;
    scaleFactorY = (4 - Math.abs(ball.tilt.y)) / 4;

    if (ball.tilt.x != 0) {
        console.log("");
    }

    for (let item of objects) {
        item.x *= scaleFactorX;
        item.y *= scaleFactorY;
        item.width *= scaleFactorX;
        item.height *= scaleFactorY;
        item.x += offset.x;
        item.y += offset.y;
    }

    if (ball.tilt.x > 0) {
        
        side.width = (sceneWidth - (sceneWidth * scaleFactorX)) / 4.0;
        side.height = (board.height);
        side.x = board.x - board.width / 2.0 - side.width;
        side.y = board.y - board.height / 2.0;
    }
    else if (ball.tilt.x < 0) {
        side.width = (sceneWidth - (sceneWidth * scaleFactorX)) / 4.0;
        side.height = (board.height);
        side.x = board.x + board.width / 2.0;
        side.y = board.y - board.height / 2.0;
    }
    else {
        side.width = 0;
    }

    if (ball.tilt.y < 0) {
        
        topBottom.width = board.width;
        topBottom.height = (sceneHeight - (sceneHeight * scaleFactorY)) / 4.0;
        topBottom.x = board.x - board.width / 2.0;
        topBottom.y = board.y + board.height / 2.0;

        side.height += topBottom.height
    }
    else if (ball.tilt.y > 0) {
        topBottom.width = board.width;
        topBottom.height = (sceneHeight - (sceneHeight * scaleFactorY)) / 4.0;
        topBottom.x = board.x - board.width / 2.0;
        topBottom.y = board.y - board.height / 2.0 - topBottom.height;

        side.height += topBottom.height
        side.y -= topBottom.height;
    }
    else {
        topBottom.width = 0;
    }
}

function unmap() {
    for (let item of objects) {
        item.x -= offset.x;
        item.y -= offset.y;
        item.width /= scaleFactorX;
        item.height /= scaleFactorY;
        item.x = item.x / scaleFactorX;
        item.y = item.y / scaleFactorY;
        
    }
}

function drawPath() {
    if (distance(ball.x, ball.lastPosition.x, ball.y, ball.lastPosition.y) > 5) {
        let newPoint = true;

        for (let point of ball.path) {
            if (distance(ball.x, point.x, ball.y, point.y) < 5) {
                newPoint = false;
            }
        }

        if (newPoint) {
            ball.lastPosition = {x:ball.x, y:ball.y};
            let point = new PIXI.Graphics(); 
            point.circle(2.5, 2.5, 5);
            point.lineStyle(4, 0xFFFF00, 1);
            point.fill(0x000000);

            point.x = ball.x;
            point.y = ball.y;
            
            gameScene.addChild(point);
            objects.push(point);
            ball.path.push({x:ball.x, y:ball.y});
        }
    }
}

function generateShape() {
    shape = [{x:0, y:-100}, {x:80, y:60}, {x:-80, y:60}];

    for (let item in shape) {
        let temp = (shape[(item + 1) % shape.length]);
        let vector = {x:(temp.x -shape[item].x), y:(shape[(item + 1) % shape.length].y -shape[item].y) }
        vector.x /= 100;
        vector.y /= 100;
        for (let i = 0; i < 100; i++) {
            let point = new PIXI.Graphics(); 
                point.circle(2.5, 2.5, 5);
                point.lineStyle(4, 0xFFFF00, 1);
                point.fill(0x808080);
                point.x = shape[item].x + vector.x * i;
                point.y = shape[item].y + vector.y * i;
                gameScene.addChild(point);
            objects.push(point);
        }
    }

    
}