function loadShader(gl, type, source) {
  const shader = gl.createShader(type); // Create a shader object

  gl.shaderSource(shader, source); // Attach the source code to it

  gl.compileShader(shader); // Compile the source code

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Could not compile shader source code. ", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function main() {
  final("webglCanvas-preview");
  blank();
  triangle();
  final("webglCanvas-final");
}

function final(id) {
  // shaders
  const vShaderSource = `
  attribute vec4 a_position;

  varying vec4 v_color;

  void main() {
    v_color = a_position;
    gl_Position = a_position;
  }
  `

  const fShaderSource = `
  precision mediump float; // set the float precision

  varying vec4 v_color;

  void main() {
    gl_FragColor = 0.5 * (1.0 + v_color);
  }
  `

  const canvas = document.getElementById(id);


  // Create a WebGL context for the canvas element
  const gl = canvas.getContext('webgl');

  if (!gl) {
    console.warn("Your browser does not support WebGL!");
    return;
  }
  
  // Clear the canvas with black 
  gl.clearColor(0.8, 1., 1.0, 1.0); // Set clear color (RGB + alpha)
  gl.clear(gl.COLOR_BUFFER_BIT);     // Clear the color buffer with the clear color

  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vShaderSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fShaderSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error("Could not link program. ", gl.getProgramInfoLog(shader));
    gl.deleteProgram(shaderProgram);
  }

  let triangle = new Float32Array([
     0.0,  0.5, 0.0, 1.0,
    -0.5, -0.5, 0.0, 1.0,
     0.5, -0.5, 0.0, 1.0,
  ]);

  let triangleBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, triangle, gl.STATIC_DRAW);

  let positionAttribLocation = gl.getAttribLocation(shaderProgram, "a_position");

  gl.enableVertexAttribArray(positionAttribLocation);

  gl.vertexAttribPointer(
    positionAttribLocation, // Location of the attribute
    4,                      // How many elements per attribute
    gl.FLOAT,               // Attribute type
    gl.FALSE,               // Do we want our values to get normalized?
    4 * Float32Array.BYTES_PER_ELEMENT, // Offset of where to read next (stride)
    0                       // Start reading the buffer at this offset
  );

  gl.useProgram(shaderProgram);
  gl.drawArrays(
    gl.TRIANGLES, // Draw triangle tesselations between vertices
    0,            // Index where to start in the array buffer 
    3             // How many indices to be rendered
  );
}

function blank() {
  const canvas = document.getElementById('webglCanvas-blank');

  // Create a WebGL context for the canvas element
  const gl = canvas.getContext('webgl');

  if (!gl) {
    console.warn("Your browser does not support WebGL!");
    return;
  }
  
  // Clear the canvas with black 
  gl.clearColor(0.8, 1., 1.0, 1.0); // Set clear color (RGB + alpha)
  gl.clear(gl.COLOR_BUFFER_BIT);     // Clear the color buffer with the clear color

}

function triangle() {
  // shaders
  const vShaderSource = `
  attribute vec4 a_position;

  void main() {
    gl_Position = a_position;
  }
  `

  const fShaderSource = `
  precision mediump float; // set the float precision

  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.5, 1.0);
  }
  `

  const canvas = document.getElementById('webglCanvas-triangle');


  // Create a WebGL context for the canvas element
  const gl = canvas.getContext('webgl');

  if (!gl) {
    console.warn("Your browser does not support WebGL!");
    return;
  }
  
  // Clear the canvas with black 
  gl.clearColor(0.8, 1., 1.0, 1.0); // Set clear color (RGB + alpha)
  gl.clear(gl.COLOR_BUFFER_BIT);     // Clear the color buffer with the clear color

  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vShaderSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fShaderSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error("Could not link program. ", gl.getProgramInfoLog(shader));
    gl.deleteProgram(shaderProgram);
  }

  let triangle = new Float32Array([
     0.0,  0.5, 0.0, 1.0,
    -0.5, -0.5, 0.0, 1.0,
     0.5, -0.5, 0.0, 1.0,
  ]);

  let triangleBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, triangle, gl.STATIC_DRAW);

  let positionAttribLocation = gl.getAttribLocation(shaderProgram, "a_position");

  gl.enableVertexAttribArray(positionAttribLocation);

  gl.vertexAttribPointer(
    positionAttribLocation, // Location of the attribute
    4,                      // How many elements per attribute
    gl.FLOAT,               // Attribute type
    gl.FALSE,               // Do we want our values to get normalized?
    4 * Float32Array.BYTES_PER_ELEMENT, // Offset of where to read next (stride)
    0                       // Start reading the buffer at this offset
  );

  gl.useProgram(shaderProgram);
  gl.drawArrays(
    gl.TRIANGLES, // Draw triangle tesselations between vertices
    0,            // Index where to start in the array buffer 
    3             // How many indices to be rendered
  );
}
window.onload = main;
