//pong clone
//mouse to control both paddles

var osc = require("node-osc");

var oscClient;
var oscServer;

// var otherMouseX = 0;
var otherMouseY = 0;

var ourPortInput;
var theirPortInput;
var theirHostInput;
var startButton;

var paddleA, paddleB, ball, wallTop, wallBottom;
var MAX_SPEED = 7;

// var ballPos;
// var ballX = 0;
// var ballY = 0;

// scoreboard
var scored = false;
var aScore = 0;  // for Paddle A
var bScore = 0;  // for Paddle B
var lastScore = false;

function setup() {

    ourPortInput = createInput();
    theirPortInput = createInput();
    theirHostInput = createInput();
    startButton = createButton("Start");

    startButton.mouseClicked(function() {
        //1. start an osc listener that
        // updates otherMouseX and otherMouseY
        var theirPortNumber = parseInt(theirPortInput.value());
        oscClient = new osc.Client(theirHostInput.value(), theirPortNumber);

        var ourPortNumber = parseInt(ourPortInput.value());
        oscServer = new osc.Server(ourPortNumber, 'localhost');
        oscServer.on("message", function(msg, rinfo) {
            console.log("got some data: ");
            console.log(msg);


            if (msg[0] == "/player/position") {
                otherMouseY = parseInt(msg[2]);
            }
            if (msg[0] == "/ball/position") {
                ball.position.x = parseInt(msg[1]);
                ball.position.y = parseInt(msg[2]);
            }
        });

        console.log(ourPortInput.value());
        console.log(theirPortInput.value());
        console.log(theirHostInput.value());

    });

    createCanvas(500, 500);
    //frameRate(6);

    paddleA = createSprite(30, height / 2, 10, 100);
    paddleA.immovable = true;

    paddleB = createSprite(width - 28, height / 2, 10, 100);
    paddleB.immovable = true;

    wallTop = createSprite(width / 2, -30 / 2, width, 30);
    wallTop.immovable = true;

    wallBottom = createSprite(width / 2, height + 30 / 2, width, 30);
    wallBottom.immovable = true;

    ball = createSprite(width / 2, height / 2, 20, 20);
    ball.maxSpeed = MAX_SPEED;

    paddleA.shapeColor = color(255, 0, 0);
    paddleB.shapeColor = color(0, 0, 255);
    ball.shapeColor = color(255, 255, 0);

    ball.setSpeed(MAX_SPEED, -180);
    ball.draw = function() {
        ellipse(0, 0, 20, 20);
    }

}

function draw() {
    background(0);

    paddleA.position.y = constrain(mouseY, paddleA.height / 2, height - paddleA.height / 2);
    paddleB.position.y = constrain(otherMouseY, paddleA.height / 2, height - paddleA.height / 2);

    ball.bounce(wallTop);
    ball.bounce(wallBottom);

    if (ball.bounce(paddleA)) {
        var swing = (ball.position.y - paddleA.position.y) / 3;
        ball.setSpeed(MAX_SPEED, ball.getDirection() + swing);
    }

    if (ball.bounce(paddleB)) {
        var swing = (ball.position.y - paddleB.position.y) / 3;
        ball.setSpeed(MAX_SPEED, ball.getDirection() - swing);
    }

    if (ball.position.x < 0) {
        ball.position.x = width / 2;
        ball.position.y = height / 2;
        ball.setSpeed(MAX_SPEED, 0);
    }

    if (ball.position.x > width) {
        ball.position.x = width / 2;
        ball.position.y = height / 2;
        ball.setSpeed(MAX_SPEED, 180);
    }


        if (oscClient != undefined) {
        oscClient.send('/player/position', mouseY);
        oscClient.send('/ball/position', ball.position.x, ball.position.y);
    }

        drawSprites();

}
