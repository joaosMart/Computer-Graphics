/////////////////////////////////////////////////////////////////
//    Example in Computer Graphics
//     A square bounces around the window. The user can change
//     the speed with up/down arrows.
//
//    Hjálmtýr Hafsteinsson, September 2024
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

// Current location of the square's center
var box = vec2( 0.0, 0.0 );

// Direction (and speed) of square
var dX;
var dY;

// The area is from -maxX to maxX and -maxY to maxY
var maxX = 1.0;
var maxY = 1.0;

// Half width/height of the square
var boxRad = 0.05;

// The square is initially in the center
var vertices = new Float32Array([-0.05, -0.05, 0.05, -0.05, 0.05, 0.05, -0.05, 0.05]);

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    
    // Give the square a random direction at the start
    dX = Math.random()*0.1-0.05;
    dY = Math.random()*0.1-0.05;

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    locBox = gl.getUniformLocation( program, "boxPos" );


    // Handle arrow keys
    window.addEventListener("keydown", function(e){
        switch( e.keyCode ) {
            case 87:	// up arrow
                dX *= 1.1;
                dY *= 1.1;
                break;
            case 40:	// down arrow
                dX /= 1.1;
                dY /= 1.1;
                break;
        }
    } );

    render();
}

function render() {
    
    // Make the square bounce off the walls
    if (Math.abs(box[0] + dX) > maxX - boxRad) dX = -dX;
    if (Math.abs(box[1] + dY) > maxY - boxRad) dY = -dY;

    // Update location
    box[0] += dX;
    box[1] += dY;
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    //
    gl.uniform2fv( locBox, flatten(box) );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

    window.requestAnimFrame(render);
}