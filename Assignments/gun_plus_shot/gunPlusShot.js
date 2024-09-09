var gl;
var canvas;
var program;
var bufferIdGun, bufferIdShot;
var locPosition, locColor, gunLoc, translationLoc;

var gunPosition = 0.0;
var shots = [];

var movement = false;
var mouseX;

var colorGun = vec4(0.0, 0.0, 0.0, 1.0);
var colorShot = vec4(1.0, 1.0, 0.0, 1.0);

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

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

    locPosition = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(locPosition);

    locColor = gl.getUniformLocation(program, "rcolor");
    gunLoc = gl.getUniformLocation(program, "uGunPosition");
    translationLoc = gl.getUniformLocation(program, "uTranslation");

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

function fireShot() {
    if (shots.length < 5) {  // Limit to 5 shots at a time
        shots.push({
            x: gunPosition,
            y: -0.9,
            active: true
        });
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw gun
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdGun);
    gl.vertexAttribPointer(locPosition, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(locColor, flatten(colorGun));
    gl.uniform1f(gunLoc, gunPosition);
    gl.uniform1f(translationLoc, 0.0);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // Update and draw shots
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
            }
        }
    }

    // Remove inactive shots
    shots = shots.filter(shot => shot.active);

    requestAnimationFrame(render);
}