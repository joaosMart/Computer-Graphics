var gl;
var canvas;
var program;

var colorBird = vec4(0.5, .2, 0.2, 1.0);
var locBird;
var locBirdMovement;

var birdsY; 
var birdsX = 0.0;
var birdPosition = [];

var birdCount = 0;



window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

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

    locPosition = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(locPosition);

    locColor = gl.getUniformLocation( program , "rcolor");
    locBird = gl.getUniformLocation(program, "uBirdPosition");
    locBirdMovement = gl.getUniformLocation( program , "uBirdMovement");


    render();
};

function spawn_birds() {
    // numberBirds = Math.random() * (0.5-0.1) * 10;
    
    birdPosition.push({
        x: 0.0,
        y: Math.random() * (0.8-0.4) + 0.4,
        speed: Math.random() * (0.009 - 0.003) + 0.003,
        active: true
    })
};

function render() {

    while (birdPosition.length < 5){
        spawn_birds();
    }
    
    gl.clear(gl.COLOR_BUFFER_BIT);

    
    
    
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdBird);
    gl.vertexAttribPointer(locPosition, 2, gl.FLOAT, false, 0, 0);


    for (var i = 0; i < birdPosition.length; i++){
        if (birdPosition[i].x > 2.1){
            birdPosition[i].active = false;
        } 
        if (birdPosition[i].active){

            birdPosition[i].x += birdPosition[i].speed

            gl.uniform4fv(locColor, flatten(colorBird));
            gl.uniform1f(locBird, birdPosition[i].y);
            gl.uniform1f(locBirdMovement, birdPosition[i].x);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        }     
    }
    
    birdPosition = birdPosition.filter(birdPosition => birdPosition.active);

    requestAnimationFrame(render);
}