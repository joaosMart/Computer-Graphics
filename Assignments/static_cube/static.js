var gl;
var program;
var points = [];
var colors = [];

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var gridSize = 10;
var cubeSize = 0.85; // Cube size in terms of cell size
var gridExtent = gridSize * 1.0; // Grid extent based on cell size

var eye = vec3(gridExtent * 1.5, gridExtent * 1.5, gridExtent * 1.5);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var theta = Math.PI / 4;
var phi = Math.PI / 4;

var cellStates = new Array(gridSize * gridSize * gridSize);
var nextCellStates = new Array(gridSize * gridSize * gridSize);
var cellChanged = new Array(gridSize * gridSize * gridSize);

var isPaused = false;
var updateInterval = 500; // Update every 500ms
var lastUpdateTime = 0;

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    colorCube();

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    resetGrid();

    canvas.addEventListener("mousedown", function(event) {
        var lastX = event.clientX;
        var lastY = event.clientY;

        canvas.onmousemove = function(event) {
            var deltaX = event.clientX - lastX;
            var deltaY = event.clientY - lastY;

            theta -= deltaX * 0.01;
            phi += deltaY * 0.01;

            phi = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, phi));

            lastX = event.clientX;
            lastY = event.clientY;
        };

        canvas.onmouseup = function() {
            canvas.onmousemove = null;
        };
    });

    window.addEventListener("keydown", function(event) {
        if (event.code === "Space") {
            isPaused = !isPaused;
            console.log(isPaused ? "Paused" : "Resumed");
        }
    });

    document.getElementById("resetButton").onclick = resetGrid;
    document.getElementById("speedSlider").oninput = function() {
        updateInterval = 1000 - this.value;
    };

    canvas.addEventListener("click", toggleCell);

    render();
};

function colorCube() {
    quad(1, 0, 3, 2, vec4(1.0, 0.0, 0.0, 1.0));
    quad(2, 3, 7, 6, vec4(0.0, 1.0, 0.0, 1.0));
    quad(3, 0, 4, 7, vec4(0.0, 0.0, 1.0, 1.0));
    quad(6, 5, 1, 2, vec4(1.0, 1.0, 0.0, 1.0));
    quad(4, 5, 6, 7, vec4(1.0, 0.0, 1.0, 1.0));
    quad(5, 4, 0, 1, vec4(0.0, 1.0, 1.0, 1.0));
}

function quad(a, b, c, d, color) {
    var vertices = [
        vec3(-0.5, -0.5,  0.5),
        vec3(-0.5,  0.5,  0.5),
        vec3( 0.5,  0.5,  0.5),
        vec3( 0.5, -0.5,  0.5),
        vec3(-0.5, -0.5, -0.5),
        vec3(-0.5,  0.5, -0.5),
        vec3( 0.5,  0.5, -0.5),
        vec3( 0.5, -0.5, -0.5)
    ];

    var indices = [a, b, c, a, c, d];
    for (var i = 0; i < indices.length; ++i) {
        points.push(vertices[indices[i]]);
        colors.push(color);
    }
}

function resetGrid() {
    for (var i = 0; i < cellStates.length; i++) {
        cellStates[i] = Math.random() < 0.3 ? 1 : 0;
        cellChanged[i] = true;
    }
}

function toggleCell(event) {
    var rect = event.target.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    
    var normalizedX = (x / rect.width) * 2 - 1;
    var normalizedY = -((y / rect.height) * 2 - 1);

    var rayOrigin = eye;
    var rayDirection = normalize(subtract(
        unproject(vec3(normalizedX, normalizedY, -1)),
        unproject(vec3(normalizedX, normalizedY, 1))
    ));

    var tMin = Number.NEGATIVE_INFINITY;
    var tMax = Number.POSITIVE_INFINITY;
    var toggledCell = null;

    for (var x = 0; x < gridSize; x++) {
        for (var y = 0; y < gridSize; y++) {
            for (var z = 0; z < gridSize; z++) {
                var cellCenter = vec3(
                    x - (gridSize - 1) / 2,
                    y - (gridSize - 1) / 2,
                    z - (gridSize - 1) / 2
                );
                var cellMin = subtract(cellCenter, vec3(0.5, 0.5, 0.5));
                var cellMax = add(cellCenter, vec3(0.5, 0.5, 0.5));

                var t1 = (cellMin[0] - rayOrigin[0]) / rayDirection[0];
                var t2 = (cellMax[0] - rayOrigin[0]) / rayDirection[0];
                var t3 = (cellMin[1] - rayOrigin[1]) / rayDirection[1];
                var t4 = (cellMax[1] - rayOrigin[1]) / rayDirection[1];
                var t5 = (cellMin[2] - rayOrigin[2]) / rayDirection[2];
                var t6 = (cellMax[2] - rayOrigin[2]) / rayDirection[2];

                var tNear = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
                var tFar = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));

                if (tNear <= tFar && tNear < tMax && tNear > tMin) {
                    tMax = tNear;
                    toggledCell = { x: x, y: y, z: z };
                }
            }
        }
    }

    if (toggledCell) {
        var index = toggledCell.x + toggledCell.y * gridSize + toggledCell.z * gridSize * gridSize;
        cellStates[index] = 1 - cellStates[index];
        cellChanged[index] = true;
    }
}

function unproject(winCoord) {
    var viewport = [0, 0, gl.canvas.width, gl.canvas.height];
    var mvp = mult(projectionMatrix, modelViewMatrix);
    var invMvp = inverse(mvp);
    
    var tmp = vec4(winCoord[0], winCoord[1], winCoord[2], 1);
    tmp[0] = (tmp[0] - viewport[0]) / viewport[2];
    tmp[1] = (tmp[1] - viewport[1]) / viewport[3];
    tmp = mult(invMvp, tmp);
    
    if (tmp[3] === 0) return null;
    
    tmp[0] /= tmp[3];
    tmp[1] /= tmp[3];
    tmp[2] /= tmp[3];
    
    return vec3(tmp[0], tmp[1], tmp[2]);
}

function updateCellStates() {
    for (var x = 0; x < gridSize; x++) {
        for (var y = 0; y < gridSize; y++) {
            for (var z = 0; z < gridSize; z++) {
                var index = x + y * gridSize + z * gridSize * gridSize;
                var aliveNeighbors = countAliveNeighbors(x, y, z);
                
                if (cellStates[index] === 1) {
                    if (aliveNeighbors < 5 || aliveNeighbors > 7) {
                        nextCellStates[index] = 0;
                        cellChanged[index] = true;
                    } else {
                        nextCellStates[index] = 1;
                        cellChanged[index] = false;
                    }
                } else {
                    if (aliveNeighbors === 6) {
                        nextCellStates[index] = 1;
                        cellChanged[index] = true;
                    } else {
                        nextCellStates[index] = 0;
                        cellChanged[index] = false;
                    }
                }
            }
        }
    }
    
    var temp = cellStates;
    cellStates = nextCellStates;
    nextCellStates = temp;
}

function countAliveNeighbors(x, y, z) {
    var count = 0;
    for (var dx = -1; dx <= 1; dx++) {
        for (var dy = -1; dy <= 1; dy++) {
            for (var dz = -1; dz <= 1; dz++) {
                if (dx === 0 && dy === 0 && dz === 0) continue;
                
                var nx = (x + dx + gridSize) % gridSize;
                var ny = (y + dy + gridSize) % gridSize;
                var nz = (z + dz + gridSize) % gridSize;
                
                var index = nx + ny * gridSize + nz * gridSize * gridSize;
                count += cellStates[index];
            }
        }
    }
    return count;
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var radius = gridExtent * 2;
    eye = vec3(
        radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(phi),
        radius * Math.cos(theta) * Math.cos(phi)
    );

    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(45, gl.canvas.width / gl.canvas.height, 0.1, radius * 4);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    var currentTime = Date.now();
    if (!isPaused && currentTime - lastUpdateTime > updateInterval) {
        updateCellStates();
        lastUpdateTime = currentTime;
    }

    for (var x = 0; x < gridSize; x++) {
        for (var y = 0; y < gridSize; y++) {
            for (var z = 0; z < gridSize; z++) {
                var index = x + y * gridSize + z * gridSize * gridSize;
                if (cellStates[index] === 1 || cellChanged[index]) {
                    var translationMatrix = translate(
                        x - (gridSize - 1) / 2, 
                        y - (gridSize - 1) / 2, 
                        z - (gridSize - 1) / 2
                    );
                    var scalingMatrix = scalem(cubeSize, cubeSize, cubeSize);
                    var modelMatrix = mult(translationMatrix, scalingMatrix);
                    var mvMatrix = mult(modelViewMatrix, modelMatrix);
                    
                    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mvMatrix));
                    if (cellStates[index] === 1) {
                        gl.drawArrays(gl.TRIANGLES, 0, points.length);
                    }
                }
            }
        }
    }

    requestAnimFrame(render);
}