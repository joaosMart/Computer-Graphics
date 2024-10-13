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

var gridSize = 10;
var cubeSize = 0.8; // Maximum cube size
var cellProbability = 0.2;

var totalCells = 0;
var aliveCells = 0;

var zDist = -20.0;

var proLoc;
var mvLoc;

var cBuffer;
var vBuffer;
var vColor; 
var vPosition;

// Game of Life variables
var currentGrid = [];
var nextGrid = [];
var iterationInterval = 1000; // Time between iterations in milliseconds

// Cube animation variables
var cubeSizes = [];
var animationSpeed = 0.025; // Speed of growing/shrinking
var transitionComplete = true; // Flag to check if all transitions are complete

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    proLoc = gl.getUniformLocation( program, "projection" );
    mvLoc = gl.getUniformLocation( program, "modelview" );

    var proj = perspective( 50.0, 1.0, 0.2, 100.0 );
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));
    
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
    
    // Event listener for mousewheel
    window.addEventListener("wheel", function(e){
        if( e.deltaY > 0.0 ) {
            zDist += 0.2;
        } else {
            zDist -= 0.2;
        }
    }  );

    // Initialize the Game of Life grid
    createInitialGrid();
    
    // Start the Game of Life animation
    gameOfLifeIteration();

    render();
}

function createInitialGrid()
{
    totalCells = gridSize * gridSize * gridSize;
    aliveCells = 0;
    currentGrid = [];
    nextGrid = [];
    cubeSizes = [];

    for(var x = 0; x < gridSize; x++) {
        currentGrid[x] = [];
        nextGrid[x] = [];
        cubeSizes[x] = [];
        for(var y = 0; y < gridSize; y++) {
            currentGrid[x][y] = [];
            nextGrid[x][y] = [];
            cubeSizes[x][y] = [];
            for(var z = 0; z < gridSize; z++) {
                if(Math.random() < cellProbability) {
                    currentGrid[x][y][z] = 1;
                    cubeSizes[x][y][z] = cubeSize; // Start with full size for alive cells
                    aliveCells++;
                } else {
                    currentGrid[x][y][z] = 0;
                    cubeSizes[x][y][z] = 0; // Start with size 0 for dead cells
                }
                nextGrid[x][y][z] = 0;
            }
        }
    }

    updateGridGeometry();
}

function gameOfLifeIteration() {
    if (!transitionComplete) {

        // If transitions are not complete, check again after a short delay
        setTimeout(gameOfLifeIteration, 100);
        return;
    }

    for(var x = 0; x < gridSize; x++) {
        for(var y = 0; y < gridSize; y++) {
            for(var z = 0; z < gridSize; z++) {
                var liveNeighbors = countLiveNeighbors(x, y, z);
                if (currentGrid[x][y][z] === 1) {
                    // Rule for live cells
                    if (liveNeighbors === 5 || liveNeighbors === 6 || liveNeighbors === 7) {
                        nextGrid[x][y][z] = 1;
                    } else {
                        nextGrid[x][y][z] = 0;
                    }
                } else {
                    // Rule for dead cells
                    if (liveNeighbors === 6) {
                        nextGrid[x][y][z] = 1;
                    } else {
                        nextGrid[x][y][z] = 0;
                    }
                }
            }
        }
    }

    // Start the transition
    transitionComplete = false;
    
    // Schedule next iteration
    setTimeout(gameOfLifeIteration, iterationInterval);
}

function countLiveNeighbors(x, y, z) {
    var count = 0;
    for(var dx = -1; dx <= 1; dx++) {
        for(var dy = -1; dy <= 1; dy++) {
            for(var dz = -1; dz <= 1; dz++) {
                if (dx === 0 && dy === 0 && dz === 0) continue;
                var nx = x + dx;
                var ny = y + dy;
                var nz = z + dz % gridSize;
                if (nx >= 0 && nx < gridSize &&
                    ny >= 0 && ny < gridSize &&
                    nz >= 0 && nz < gridSize) {
                    count += currentGrid[nx][ny][nz];
                }
            }
        }
    }
    return count;
}

function updateGrid() {
    var allTransitionsComplete = true;

    for(var x = 0; x < gridSize; x++) {
        for(var y = 0; y < gridSize; y++) {
            for(var z = 0; z < gridSize; z++) {
                if(nextGrid[x][y][z] === 1 && cubeSizes[x][y][z] < cubeSize) {
                    // Cell is alive and growing
                    cubeSizes[x][y][z] = Math.min(cubeSize, cubeSizes[x][y][z] + animationSpeed);
                    allTransitionsComplete = false;
                } else if(nextGrid[x][y][z] === 0 && cubeSizes[x][y][z] > 0) {
                    // Cell is dead and shrinking
                    cubeSizes[x][y][z] = Math.max(0, cubeSizes[x][y][z] - animationSpeed);
                    allTransitionsComplete = false;
                }
            }
        }
    }

    if (allTransitionsComplete) {
        transitionComplete = true;
        currentGrid = nextGrid.map(plane => plane.map(row => row.slice()));
    }
}

function updateGridGeometry() {
    points = [];
    colors = [];
    aliveCells = 0;

    for(var x = 0; x < gridSize; x++) {
        for(var y = 0; y < gridSize; y++) {
            for(var z = 0; z < gridSize; z++) {
                if(cubeSizes[x][y][z] > 0) {
                    createCube(x, y, z, cubeSizes[x][y][z]);
                    if(cubeSizes[x][y][z] === cubeSize) {
                        aliveCells++;
                    }
                }
            }
        }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
}

function createCube(x, y, z, size)
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
            var scaledVertex = scale(size, vertices[vertexIndex]);
            var translatedVertex = add(scaledVertex, vec3(x-gridSize/2+0.5, y-gridSize/2+0.5, z-gridSize/2+0.5));
            points.push(translatedVertex);
            colors.push(faceColor);
        }
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var ctm = lookAt( vec3(0.0, 0.0, zDist), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) );
    ctm = mult( ctm, rotateX(-spinX) );
    ctm = mult( ctm, rotateY(-spinY) );

    gl.uniformMatrix4fv(mvLoc, false, flatten(ctm));

    updateGrid(); // Update cell sizes
    updateGridGeometry(); // Update the grid geometry

    gl.drawArrays( gl.TRIANGLES, 0, points.length );

    requestAnimFrame( render );
}