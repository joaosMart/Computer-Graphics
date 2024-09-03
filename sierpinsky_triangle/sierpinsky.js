/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Sýnir hvernig hægt er að breyta lit með uniform breytu
//
//    Hjálmtýr Hafsteinsson, ágúst 2024
/////////////////////////////////////////////////////////////////
var gl;
var points;

var NumPoints = 10000;
var colorLoc;
var translationLoc;  // New variable for translation uniform location
var translation = [0, 0];  // Initial translation
var time = 0;  // For animation

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
    
    var bufferId = gl.createBuffer();  // Defines a memory are on a GPU 
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );  // Specifies the type of memory (normal array)
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW ); // Moves from the points array to the memory area 
    // Flatten converts vec2 into matrixes

    // Associate shader variables with our data buffer
    // Bind the memory area to the variable vPosition in node painter    

    var vPosition = gl.getAttribLocation( program, "vPosition" );  
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Find the location of the variable fColor in the shader program
    colorLoc = gl.getUniformLocation( program, "fColor" );

    // Find the location of the translation uniform
    translationLoc = gl.getUniformLocation(program, "uTranslation");

    // Start the animation
    requestAnimationFrame(render);
    
    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    // Update time
    time += 0.01;

    // Calculate new translation
    translation[0] = 0.5 * Math.sin(time);
    translation[1] = 0.5 * Math.cos(time);

    // Set the translation uniform
    gl.uniform2fv(translationLoc, translation);

    // Set color uniform (unchanged)
    gl.uniform4fv( colorLoc, vec4(0.0, 0.0, 0.0, 1.0) );
    
    // Draw all points
    gl.drawArrays( gl.POINTS, 0, points.length );

    // Request next frame
    requestAnimationFrame(render);
}