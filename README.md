# Computer-Graphics
Repo for study and working in the course of Computer Graphics 


## Lecture 2 - WebGL 

2. What would need to be changed in the triangle program to draw a blue triangle that is upside down (ie the tip is facing down)?
- In order to spin the figure upside down one needs to multiply the coordinates array by -1. 
- To change the colour to blue by changing the fragment shader vector (R,G,B, Alpha). The R goes from 1 to 0 and the B goes from 0 to 1. 

3 . How many points are needed to draw a square using: a. gl. TRIANGLES b. gl.TRIANGLE_FAN. 

- The gl. TRIANGLES requires for three vertices to be define for each triangle and therefore, to do a square one would need 2 triangles and therefore 6 points to be defined. 
- The gl. TRIANGLE_FAN requires three points to do the first triangle and one extra point for each extra triangle we want to add. In order to do a square we need 2 triangles and therefore 3 + 1 points.


## Lecture 3 - Sierpinski

1. How many tetrahedrons are created in the first iteration of the Sierpinski tetrahedron? 
- In the first iteration of the Sieprinsky tetrahedron 4 new tetrahedrons are created. 

2. Name two disadvantages of the "immediate mode" method of drawing complex objects. 
In immediate mode rendering, drawing commands are executed immediately as they are called, without storing the geometry or drawing instructions for later use. The geometry is typically recomputed and sent to the graphics card every frame.

- Not efficient to send all the points individually to the graphics card. This becomes a bottleneck. The CPU does all the work and the GPU does nothing!
- Another disadvantage is that there is no memory of the geometric data. This means that displaying the points again, we would have to go create and display them again.

3. To move the Sierpinski triangle after the points are already in graphics memory, the most efficient approach would be to modify the vertex shader. - This method avoids having to update and re-upload the point data to the GPU, which can be a performance bottleneck, especially for large numbers of points.

## Lecture 4 - Color 

1. On this side is a polygon with 8 knots. How many triangles are needed to draw it?
One needs at least 6 triangles to fill in the polygon. This is a triangulation and therefore we have # triangles = # vertices - 2.

2. Colors are electromagnetic waves of different frequencies. Whichever has a higher frequency, red or blue?
Red has a bigger frequency (between 620 and 750 nm) while blue can find only between 450 and 495 nm. 

3. How could the uniform variable be used to change ( scale) size The Sierpinski triangle?
First we need to use a uniform in the vertex shader in order to be able to scale the triangle. After this, in our JavaScript code we need to get the location of the scale uniform in the shader using the function gl.getUniformLocation(). To finish off, while rendering we need to get transform the scale location we obtained previosuly and transform it into a variable that can be used. 


## LEcture 5 - Interactivity

1. In the program rotatingSquare1 , the variable theta is incremented in each iteration. What are the risks involved?
The main risk would be numeric overflow. In the code theta is a float variable and when increasing it for long enough we can arrive to a large enough number that excedes the maximum possible value of a float. This can lead to unexpected behaviour in calculation, loss of precision, slow computation or even reaching infinity in extreme cases. 