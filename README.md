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

- Not efficient to send all the points individually to the graphics card. This becomes a bottleneck. 
- One disadvantage is that there is no memory of the geometric data. This means that displaying the points again, we would have to go create and display them again.

3. To move the Sierpinski triangle after the points are already in graphics memory, the most efficient approach would be to modify the vertex shader. - This method avoids having to update and re-upload the point data to the GPU, which can be a performance bottleneck, especially for large numbers of points.

