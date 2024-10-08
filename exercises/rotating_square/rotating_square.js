"use strict";

var gl;
var vertices;
var thetaLoc;
var vertices;

var theta = 0;
var fps = 20; 



window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    vertices = [
        vec2(-0.5, 0.5), 
        vec2(0.5 , 0.5), 
        vec2(0.5, -0.5), 
        vec2(-0.5, -0.5)
    ];

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
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    thetaLoc = gl.getUniformLocation( program , "theta")
    
    render();
};



function render() {
    setTimeout( function() { 

    gl.clear(gl.COLOR_BUFFER_BIT)
       

    theta += 0.025
    
    gl.uniform1f(thetaLoc, theta);


    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4.0);

    requestAnimationFrame(render);

    }, 100/fps);

}
