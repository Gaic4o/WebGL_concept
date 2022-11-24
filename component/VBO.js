let gl;

// WebGL 실행이 안 될 경우 Error 발생.
function testGLError(functionLastCalled) {
    
    let lastError = gl.getError();

    if (lastError != gl.NO_ERROR) {
        alert(functionLastCalled + " failed (" + lastError + ")");
        return false; 
    }
    return true;
}


// webgl canvas 에서 가져온 후 -> 실행시킵니다.
function initialiseGL(canvas) {
    try {
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl"); 
        gl.viewport(0, 0, canvas.width, canvas.height); 
    } catch (e) {

    }

    if (!gl) {
        alert("Unable to initialise WebGL, Your browser may not support it"); 
        return false; 
    }
    return true;
}

let shaderProgram;
let arrayBuffer;
let arrayBuffer2; 

// Buffer -> vertex 점선을 그려 일단 삼각형을 만듭니다.
function initialiseBuffer() {
    
    let vertexData = [
        -0.4, -0.4, 0.0, // Bottom left 
        0.4, -0.4, 0.0, // Bottom right
        0.0, 0.5, 0.0, // Top middle 
        0.6, 0.4, 0.0, // Bottom left 
        0.8, 0.4, 0.0, // Bottom right 
        0.7, 0.9, 0.0 // Top middle 
    ]; 

    let vertexData2 = [
        -0.7, -0.3, 0.0, // Bottom left 
        0.8, -0.3, 0.0, // Bottom right 
        0.0, 0.4, 0.0, // Top middle 
        -0.6, 0.4, 0.0, // Bottom left 
        -0.8, 0.4, 0.0, // Bottom right 
        -0.7, 0.9, 0.0 // Top middle 
    ]

    let elementData = [
        0, 1, 2, 3, 4, 5 
    ];


    // Generate a buffer object 
    arrayBuffer = gl.createBuffer(); // Buffer 생성. 
    gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuffer); // arrayBuffer -> ARRAY_BUFFER 생성합니다. 
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW); // STATIC_DARW (수정되지 않는 선?)

    // return testGLError("initialiseBuffers"); 
    arrayBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuffer2);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData2), gl.STATIC_DRAW); 

    // return testGLError("initiliseBuffers"); 
    let elementBuffer = gl.createBuffer(); 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer); 
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(elementData), gl.STATIC_DRAW); 
    return testGLError("initialiseBuffers"); 
}


// fragmentShader 생성합니다.
function initialiseShaders() {

    // fragmentShaderSource -> Color 를 지정합니다.
    let fragmentShaderSource = `
        void main(void) 
        { 
            gl_FragColor = vec4(1.0, 1.0, 0.66, 1.0); 
        }
    `; 

    gl.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(gl.fragShader, fragmentShaderSource);
    gl.compileShader(gl.fragShader);

    // Check if compilation succeeded
    if (!gl.getShaderParameter(gl.fragShader, gl.COMPILE_STATUS)) {
        // It didn't. Display the info log as to why
        alert("Failed to compile the fragment shader.\n" + gl.getShaderInfoLog(gl.fragShader));
        return false;
    }
    
    let vertexShaderSource = `
        attribute highp vec4 myVertex; 
        uniform mediump mat4 transformationMatrix; 
        void main(void)  
        { 
            gl_Position = transformationMatrix * myVertex; 
        }
    `
    gl.vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(gl.vertexShader, vertexShaderSource);
    gl.compileShader(gl.vertexShader);

   // Check if compilation succeeded
   if (!gl.getShaderParameter(gl.vertexShader, gl.COMPILE_STATUS)) {
    // It didn't. Display the info log as to why
    alert("Failed to compile the vertex shader.\n" + gl.getShaderInfoLog(gl.vertexShader));
    return false;
    }

    // Create the shader program 
    gl.programObject = gl.createProgram(); 

    // Attach the fragment and vertex shaders to it 
    gl.attachShader(gl.programObject, gl.fragShader);
    gl.attachShader(gl.programObject, gl.vertexShader); 

    // Bind the custom vertex attribute "myVertex" to location 0
    gl.bindAttribLocation(gl.programObject, 0, "myVertex");

    // Link the program
    gl.linkProgram(gl.programObject);

        // Check if linking succeeded in a similar way we checked for compilation errors
        if (!gl.getProgramParameter(gl.programObject, gl.LINK_STATUS)) {
            alert("Failed to link the program.\n" + gl.getProgramInfoLog(gl.programObject));
            return false;
        }

    gl.useProgram(gl.programObject); 

    return testGLError("initialiseShaders");
}

let frame = 1;

function renderScene() {
    
    gl.clearColor(0.6, 0.8, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT); 

    // Get the location of the transformation maxtrix in the shader using its name 
    let matrixLocation = gl.getUniformLocation(gl.programObject, "transformationMatrix");

    // Matrix used to specify the orientation of the triangle on screen 
    let transformationMatrix = [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ];

    // Pass the identity transformation matrix to the shader using its location
    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, transformationMatrix);

    if (!testGLError("gl.uniformMatrix4fv")) {
        return false;
    }
    
    // Enable the user-defined vertex array
    gl.enableVertexAttribArray(0);

    // Set the vertex data to this attribute index, with the number of floats in each position
    gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 0, 0); 

    if (!testGLError("gl.vertexAttribPointer")) {
        return false;
    }

    
	frame = frame + 1; 
    
    // frame 에 따라 Buffer 가 다르게 보입니다.
	if ( frame < 200 ) 
		gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuffer2);
	 else
		gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuffer);

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    if (!testGLError("gl.drawArrays")) {
        return false;
    }

    return true;
}

function main() {
    let canid = document.getElementById("helloapicanvas");


    if (!initialiseGL(canid)) {
        return;
    }

    if (!initialiseBuffer()) {
        return;
    }

    if (!initialiseShaders()) {
        return;
    }

    // Render loop
    requestAnimFrame = (function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
			function (callback) {
			    window.setTimeout(callback, 1000, 60);
			};
    })();

    (function renderLoop() {
        if (renderScene()) {
            // Everything was successful, request that we redraw our scene again in the future
            requestAnimFrame(renderLoop);
        }
    })();

}