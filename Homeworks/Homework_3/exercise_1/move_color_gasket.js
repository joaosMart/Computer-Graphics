"use strict";

var gl;
var points;
var timeLoc; 
var startTime;

var NumPoints = 5000;
var time = 0.0; 
var scaleVar = 0.5; 

var gasketPosition = vec2(0.0, 0.0);
var movement = false;
var mouseX;
var mouseY;
var gasketLoc;

var colorLoc;

var scaleLoc;
var zoom; 
var zoomLevel;

var zoomLevel = 1.0; 
var randColorVec = vec3(1.0, 0.0, 0.0);



window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];

    // Specify a starting point p for our iterations
    // p must lie inside any set of three vertices

    var u = add( vertices[0], vertices[1] );
    var v = add( vertices[0], vertices[2] );
    var p = scale( 0.25, add( u, v ) );

    // And, add our initial point into our array of points

    points = [ p ];

    // Compute new points
    // Each new point is located midway between
    // last point and a randomly chosen vertex

    for ( var i = 0; points.length < NumPoints; ++i ) {
        var j = Math.floor(Math.random() * 3);
        p = add( points[i], vertices[j] );
        p = scale( 0.5, p );
        points.push( p );
    }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Get the location of the scale uniform 
    gasketLoc = gl.getUniformLocation(program, "uGasketPosition");
    colorLoc = gl.getUniformLocation(program, "uRandColor");
    scaleLoc = gl.getUniformLocation(program, "uScaleUpDown")
    

    
    

    // Event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    });

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    });

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
            var xmove = 2*(e.offsetX - mouseX)/canvas.width;
            mouseX = e.offsetX;
            var ymove = -2*(e.offsetY - mouseY)/canvas.height;
            mouseY = e.offsetY;

            gasketPosition[0] += xmove;
            gasketPosition[1] += ymove;

            // To keep the gun within the canvas limits
            gasketPosition[0] = Math.max(-1, Math.min(1, gasketPosition[0]));
            gasketPosition[1] = Math.max(-1, Math.min(1, gasketPosition[1]));

        }
    });

    // Event listeners for spacebar
    window.addEventListener("keydown", function(e){
        switch( e.keyCode ){
            case 32:       // spacebar key 
                for (i = 0; i < 3; i++){
                    var randNumber = Math.random();
                    randColorVec[i] = randNumber;
                }
   
        }
    });

    // Event listeners for scroll wheel
    canvas.addEventListener("wheel", function(e) {
        e.preventDefault();
        
        var zoomSpeed = 0.05;
        
        // Update zoom level based on scroll direction
        if (e.deltaY < 0) {
            zoomLevel += (zoomSpeed);  // Scrolling up - zoom in 
        } else {
            zoomLevel -= (zoomSpeed);  // Scrolling down - zoom out
        }

        // Clamp zoom level to prevent extreme values
        zoomLevel = Math.min(Math.max(zoomLevel, 0.1), 10);
        });



    // Start the animation
    render();
};



function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );



    // Set the scale uniform 
    gl.uniform3fv(colorLoc, randColorVec);
    gl.uniform1f(scaleLoc, zoomLevel);
    gl.uniform2fv(gasketLoc, gasketPosition);

    gl.drawArrays( gl.POINTS, 0, points.length );

    requestAnimationFrame(render);

}
