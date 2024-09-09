var gl;
var canvas;
var program;
var bufferIdGun;
var locPosition;
var gunLoc;

var gunPosition = 0.0;
var movement = false;
var mouseX;

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

    locPosition = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(locPosition);

    gunLoc = gl.getUniformLocation(program, "uGunPosition");

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

            // To keep the gun within the canvas limits
            gunPosition = Math.max(-1, Math.min(1, gunPosition));
        }
    });

    render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw gun
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdGun);
    gl.vertexAttribPointer(locPosition, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1f(gunLoc, gunPosition);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    requestAnimationFrame(render);
}