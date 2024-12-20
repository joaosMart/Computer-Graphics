/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Búum til 10x10x10 net af teningum með breytilegri þéttni
//
//    Hjálmtýr Hafsteinsson, september 2024
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var numVertices  = 36;

var points = [];
var colors = [];

var movement = false;     // Do we rotate?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var matrixLoc;

var gridSize = 10;
var cubeSize = 0.8; // Cube size in terms of cell size
var cellProbability = 0.01; // Probability of a cell being alive

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    createGrid();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    matrixLoc = gl.getUniformLocation( program, "transform" );

    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
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
    
    render();
}

function createGrid()
{
    for(var x = 0; x < gridSize; x++) {
        for(var y = 0; y < gridSize; y++) {
            for(var z = 0; z < gridSize; z++) {
                if(Math.random() < cellProbability) {
                    createCube(x, y, z);
                }
            }
        }
    }
}

function createCube(x, y, z)
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

    var faces = [
        [ 1, 0, 3, 1, 3, 2 ],
        [ 2, 3, 7, 2, 7, 6 ],
        [ 3, 0, 4, 3, 4, 7 ],
        [ 6, 5, 1, 6, 1, 2 ],
        [ 4, 5, 6, 4, 6, 7 ],
        [ 5, 4, 0, 5, 0, 1 ]
    ];

    for (var i = 0; i < faces.length; i++) {
        var faceColor = vertexColors[i];
        for (var j = 0; j < 6; j++) {
            var vertexIndex = faces[i][j];
            var scaledVertex = scale(cubeSize, vertices[vertexIndex]);
            var translatedVertex = add(scaledVertex, vec3(x-gridSize/2+0.5, y-gridSize/2+0.5, z-gridSize/2+0.5));
            points.push(translatedVertex);
            colors.push(faceColor);
        }
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var mv = mat4();
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) );
    mv = mult( mv, scalem(0.1, 0.1, 0.1) );  // Scale down the entire grid

    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv));
    gl.drawArrays( gl.TRIANGLES, 0, points.length );

    requestAnimFrame( render );
}