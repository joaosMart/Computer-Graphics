var canvas;
var gl;

var numVertices  = 36;

var points = [];
var colors = [];

var movement = false;
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var matrixLoc;
var startTime;

var backgroundScale = [1.5, 1.5, 0.05];
var hourHandScale = [0.3, 0.05, 0.045];
var minuteHandScale = [0.2, 0.04, 0.05];
var secondHandScale = [0.1, 0.03, 0.055];

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    matrixLoc = gl.getUniformLocation( program, "rotation" );
    colorLoc = gl.getUniformLocation( program, "uColor" );

    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY = ( spinY + (origX - e.offsetX) ) % 360;
            spinX = ( spinX + (origY - e.offsetY) ) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );

    startTime = Date.now();

    render();
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) 
{
    var vertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        colors.push( vertexColors[a] );
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var currentTime = Date.now();
    var elapsedSeconds = (currentTime - startTime) / 1000;

    var secondsAngle = -(elapsedSeconds % 60) * 6;
    var minutesAngle = -((elapsedSeconds / 60) % 60) * 6;
    var hoursAngle = -((elapsedSeconds / 3600) % 12) * 30;

    var mv = mat4();
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) );
    mv = mult( mv, rotateZ(90) );  // Rotate the entire clock to start at 12 o'clock

    // Draw background 1
    var bgMv = mult( mv, rotateY(5) );  // Tilt the background slightly
    bgMv = mult(bgMv, translate(-.35, 0.0, 0.01))
    bgMv = mult( bgMv, scalem( backgroundScale[0]/2, backgroundScale[1], backgroundScale[2] ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(bgMv));
    gl.uniform4fv(colorLoc, [0.2, 0.2, 0.2, 1.0]); 
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );

    // Draw background 2
    var bgMv = mult( mv, rotateY(-5) );  // Tilt the background slightly
    bgMv = mult(bgMv, translate(.35, 0.0, 0.01))
    bgMv = mult( bgMv, scalem( backgroundScale[0]/2, backgroundScale[1], backgroundScale[2] ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(bgMv));
    gl.uniform4fv(colorLoc, [0.2, 0.2, 0.2, 1.0]); 
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );

    // Draw hour hand
    var hourMv = mult( mv, rotateZ(hoursAngle) );
    hourMv = mult( hourMv, translate(0.15, 0, 0) );
    hourMv = mult( hourMv, scalem( hourHandScale[0], hourHandScale[1], hourHandScale[2] ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(hourMv));
    gl.uniform4fv(colorLoc, [0.0, 0.0, 1.0, 1.0]); 
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );

    // Draw minute hand
    var minuteMv = mult( mv, rotateZ(hoursAngle) );
    minuteMv = mult( minuteMv, translate(0.3, 0, 0) );
    minuteMv = mult( minuteMv, rotateZ(minutesAngle) );
    minuteMv = mult( minuteMv, translate(0.1, 0, 0) );
    minuteMv = mult( minuteMv, scalem( minuteHandScale[0], minuteHandScale[1], minuteHandScale[2] ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(minuteMv));
    gl.uniform4fv(colorLoc, [0.0, 1.0, 0.0, 1.0]); 
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );

    // Draw second hand
    var secondMv = mult( mv, rotateZ(hoursAngle) );
    secondMv = mult( secondMv, translate(0.3, 0, 0) );
    secondMv = mult( secondMv, rotateZ(minutesAngle) );
    secondMv = mult( secondMv, translate(0.2, 0, 0) );
    secondMv = mult( secondMv, rotateZ(secondsAngle) );
    secondMv = mult( secondMv, translate(0.05, 0, 0) );
    secondMv = mult( secondMv, scalem( secondHandScale[0], secondHandScale[1], secondHandScale[2] ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(secondMv));
    gl.uniform4fv(colorLoc, [1.0, 0.0, 0.0, 1.0]);
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );

    requestAnimFrame( render );
}