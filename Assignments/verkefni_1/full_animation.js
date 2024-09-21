var gl;
var canvas;
var program;
var bufferIdGun, bufferIdShot;
var locPosition, locColor, gunLoc, translationLoc;
var locBird, locBirdMovement;

var gunPosition = 0.0;
var shots = [];

var movement = false;
var mouseX;

var colorGun = vec4(0.0, 0.0, 0.0, 1.0);
var colorShot = vec4(0.0, .8, 0.0, 1.0);
var colorBird = vec4(0.5, .2, 0.2, 1.0);
var colorCounter = vec4(0.255, 0.412, 1.0, 1.0);

var birdPosition = [];

var gameWon = false;
var birdShotCounter = 0;
var counterIndex = 0;
var counterMult = counterIndex-1;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.9, 0.9, 0.9, 1.0);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Create and bind birds buffer
    var verticesBird = [
        vec2(-1.1, 0.05),
        vec2(-1, 0.05),
        vec2(-1, -0.05),
        vec2(-1.1, -0.05)];

    bufferIdBird = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdBird);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesBird), gl.STATIC_DRAW);

    // Create and bind gun buffer
    var verticesGun= [
        vec2(  0, -0.85),
        vec2( -0.03, -1.),
        vec2(  0.0, -0.95),
        vec2(  0.03, -1.),
    ];
    bufferIdGun = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdGun);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesGun), gl.STATIC_DRAW);

    // Create and bind shot buffer
    var verticesShot = [
        vec2(-0.005, 0.05),
        vec2(0.005, 0.05),
        vec2(0.005, 0),
        vec2(-0.005, 0)
    ];
    bufferIdShot = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdShot);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesShot), gl.STATIC_DRAW);

    // Create and bind counter buffer

    var verticesCounter = [
        vec2(-0.15, 0.075),
        vec2(0.15, 0.075),
        vec2(0.15, 0),
        vec2(-0.15, 0)
    ];

    bufferIdCounter = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdCounter);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesCounter), gl.STATIC_DRAW);

    locPosition = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(locPosition);

    // Retrieving uniform locations
    locColor = gl.getUniformLocation(program, "rcolor");
    gunLoc = gl.getUniformLocation(program, "uGunPosition");
    translationLoc = gl.getUniformLocation(program, "uTranslation");
    locBird = gl.getUniformLocation(program, "uBirdPosition");
    locBirdMovement = gl.getUniformLocation( program , "uBirdMovement");

    // Event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        mouseX = e.offsetX;
    });

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    });

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
            var xmove = 2*(e.offsetX - mouseX)/canvas.width;
            mouseX = e.offsetX;
            gunPosition += xmove;
            // Clamp gunPosition to keep it inside the canvas
            gunPosition = Math.max(-1, Math.min(1, gunPosition));
        }
    });

    // Event listener for 'w' key press to shoot
    window.addEventListener("keydown", function(e){
        switch(e.keyCode){
            case 87: // w key
                fireShot();
                break;
        }
    });

    render();
};

function showGameOver() {
    canvas.getElementById('game-over').style.display = 'block';
    gameOver = true;
}

function fireShot() {
    if (shots.length < 5) {  // Limit to 5 shots at a time
        shots.push({
            x: gunPosition,
            y: -0.9,
            active: true
        });
    }
}

function spawn_birds() {
    // numberBirds = Math.random() * (0.5-0.1) * 10;
    
    birdPosition.push({
        x: 0.0,
        y: Math.random() * (0.8-0.4) + 0.4,
        speed: Math.random() * (0.009 - 0.003) + 0.003,
        active: true
    })
};

function checkCollision(shot, bird) {
    // Defining collision boundaries
    var shotLeft = shot.x - 0.005;
    var shotRight = shot.x + 0.005;
    var shotTop = shot.y + 0.05;
    var shotBottom = shot.y;

    var birdLeft = bird.x - 1.1;
    var birdRight = bird.x - 1.0;
    var birdTop = bird.y + 0.05;
    var birdBottom = bird.y - 0.05;

    // Checking for overlap between shot and bird
    return !(shotLeft > birdRight || 
             shotRight < birdLeft || 
             shotTop < birdBottom ||
             shotBottom > birdTop);
}

function stopGame(message) {
    gameRunning = false;
    gameOverMessage = message;
    document.getElementById('gameWon').style.display = 'flex';
    document.getElementById('gameWonMessage').textContent = message;
}

function drawGameOverMessage() {
    gl.clearColor(0.0, 0.0, 0.0, 0.5); 
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set up text rendering
    gl.useProgram(program);
    gl.uniform4fv(locColor, [1.0, 1.0, 1.0, 1.0]);  

    console.log("Game Over: " + gameOverMessage);
}


function render() {

    // Condition to end the game
    if (birdShotCounter === 5){
        stopGame("Good Job!!");
        return;
    }
    
    while (birdPosition.length < 5){  // At most 5 birds at a time in the screen 
        spawn_birds();
    }

    gl.clear(gl.COLOR_BUFFER_BIT);

    //=======================
    //====== Draw gun =======
    //=======================

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdGun);
    gl.vertexAttribPointer(locPosition, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(locColor, flatten(colorGun));
    gl.uniform1f(gunLoc, gunPosition);
    gl.uniform1f(translationLoc, 0.0);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    

    //=======================
    // Update and draw shots
    //=======================

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdShot);
    gl.vertexAttribPointer(locPosition, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(locColor, flatten(colorShot));

    for (var i = 0; i < shots.length; i++) {
        if (shots[i].active) {
            shots[i].y += 0.02;  
            if (shots[i].y > 1.0) {
                shots[i].active = false;
            } else {
                // Draw shot
                gl.uniform1f(gunLoc, shots[i].x);
                gl.uniform1f(translationLoc, shots[i].y);
                gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);  
                
                // Checking if any bird was shot
                for (var j = 0; j < birdPosition.length; j++) {
                    if (birdPosition[j].active && checkCollision(shots[i], birdPosition[j])) {
                        shots[i].active = false;
                        birdPosition[j].active = false;
                        birdShotCounter++; // Adding a counter
                        break;  
                    }
                }
            }
        }
    }

    // Remove inactive shots
    shots = shots.filter(shot => shot.active);

    //=======================
    // Update and draw birds
    //=======================


    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdBird);
    gl.vertexAttribPointer(locPosition, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(locColor, flatten(colorBird));

    for (var i = 0; i < birdPosition.length; i++){
        if (birdPosition[i].x > 2.1){
            birdPosition[i].active = false;
        } else if (birdPosition[i].active){

            birdPosition[i].x += birdPosition[i].speed

            gl.uniform1f(translationLoc, birdPosition[i].y);
            gl.uniform1f(gunLoc, birdPosition[i].x);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        }     
    }

    birdPosition = birdPosition.filter(birdPosition => birdPosition.active);

    //=======================
    //==== Draw Counters=====
    //=======================

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdCounter);
    gl.vertexAttribPointer(locPosition, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(locColor, flatten(colorCounter));

    if (birdShotCounter > counterIndex){
        counterIndex++;
        counterMult++;
    }

    for (var i = 0; i < counterIndex; i++){
        gl.uniform1f(gunLoc, -0.83 + 0.4*(i));
        gl.uniform1f(translationLoc, 0.95);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }


    requestAnimationFrame(render);
}