var canvas;
var gl;

var translationLoc; 
var translation = 0.0;
var shoot = false;
var gunPosition = 0.0;


var mouseX;             // Old value of x-coordinate  
var movement = false;   // Do we move the paddle?


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferIdShot = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdShot );
    gl.bufferData( gl.ARRAY_BUFFER, 8*4, gl.DYNAMIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Find the location of the translation uniform
    translationLoc = gl.getUniformLocation(program, "uTranslation");


    window.addEventListener("keydown", function(e){
        switch( e.keyCode ){
            case 87:       // w key 
                
                var vertices_shot = [
                    vec2(gunPosition - 0.005, -0.8),
                    vec2(gunPosition + 0.005, -0.8),
                    vec2(gunPosition + 0.005, -0.85),
                    vec2(gunPosition - 0.005, -0.85),
                ];

                gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdShot );
                gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices_shot), gl.DYNAMIC_DRAW );

                shoot = true;
   
        }
    });
    
    render();

};


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );

    if (translation <= 1.80){    //1.80 is the distance the shot covers untill it reaches the end of the canvas  
        if (shoot){
            translation += 0.05
        }
    } else { 
        shoot = false
        translation = 0.0
    }
    
    // Set the translation uniform
    gl.uniform1f(translationLoc, translation);

    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4);

    requestAnimationFrame(render);


}