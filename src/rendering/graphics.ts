// import {imageRenderFragmentShader, imageRenderVertexShader} from './shaders'
// import {gl, initRenderContext} from './utils/render-context'
// declare const webglUtils: any
//
// export const renderImage = () => {
//   console.log('render this image please')
//   render()
// }
//
// function render() {
//   initRenderContext()
//
//   // setup GLSL program
//   const program = webglUtils.createProgramFromSources(gl, [imageRenderVertexShader, imageRenderFragmentShader]);
//
//   // look up where the vertex data needs to go.
//   const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
//   const texCoordAttributeLocation = gl.getAttribLocation(program, 'a_texCoord')
//
//   // lookup uniforms
//   const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
//   const imageLocation = gl.getUniformLocation(program, 'u_image')
//
//   // Create a vertex array object (attribute state)
//   const vao = gl.createVertexArray()
//
//   // and make it the one we're currently working with
//   gl.bindVertexArray(vao)
//
//   // Create a buffer and put a single pixel space rectangle in
//   // it (2 triangles)
//   const positionBuffer = gl.createBuffer()
//
//   // Turn on the attribute
//   gl.enableVertexAttribArray(positionAttributeLocation)
//
//   // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
//   gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
//
//   // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
//   let size = 2        // 2 components per iteration
//   let type = gl.FLOAT  // the data is 32bit floats
//   let normalize = false // don't normalize the data
//   let stride = 0        // 0 = move forward size * sizeof(type) each iteration to get the next position
//   let offset = 0     // start at the beginning of the buffer
//   gl.vertexAttribPointer(
//     positionAttributeLocation, size, type, normalize, stride, offset)
//
//   // provide texture coordinates for the rectangle.
//   const texCoordBuffer = gl.createBuffer()
//   gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
//   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
//     0.0,  0.0,
//     1.0,  0.0,
//     0.0,  1.0,
//     0.0,  1.0,
//     1.0,  0.0,
//     1.0,  1.0,
//   ]), gl.STATIC_DRAW)
//
//   gl.enableVertexAttribArray(texCoordAttributeLocation)
//   size = 2          // 2 components per iteration
//   type = gl.FLOAT  // the data is 32bit floats
//   normalize = false // don't normalize the data
//   stride = 0        // 0 = move forward size * sizeof(type) each iteration to get the next position
//   offset = 0        // start at the beginning of the
//   gl.vertexAttribPointer(texCoordAttributeLocation, size, type, normalize, stride, offset)
//
//   // Create a texture.
//   const texture = gl.createTexture()
//
//   // make unit 0 the active texture uint
//   // (ie, the unit all other texture commands will affect
//   gl.activeTexture(gl.TEXTURE0)
//
//   // Bind it to texture unit 0' 2D bind point
//   gl.bindTexture(gl.TEXTURE_2D, texture)
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
//
//   // Upload the image into the texture.
//   const data = new Float32Array(32 * 32 * 4)
//   for (let i = 0; i < 32 * 32 * 4; i++) {
//     if ((i + 1) % 4 === 0) {
//       data[i] = 1.0
//     }
//     else {
//       data[i] = 0.5
//     }
//   }
//
//   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 32, 32, 0, gl.RGBA, gl.FLOAT, data)
//
//
//   webglUtils.resizeCanvasToDisplaySize(gl.canvas)
//
//   // Tell WebGL how to convert from clip space to pixels
//   gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
//
//   // Clear the canvas
//   gl.clearColor(0, 0, 0, 0);
//   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
//   gl.useProgram(program)
//   gl.bindVertexArray(vao)
//   gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height)
//   gl.uniform1i(imageLocation, 0)
//   gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
//
//   // Set a rectangle the same size as the image.
//   setRectangle(gl, 0, 0, 300, 300)
//
//   // Draw the rectangle.
//   const primitiveType = gl.TRIANGLES
//   offset = 0
//   const count = 6
//   gl.drawArrays(primitiveType, offset, count)
//
//   console.log(gl)
// }
//
// function setRectangle(gl: WebGLRenderingContext, x: number, y: number, width: number, height: number) {
//   const x1 = x
//   const x2 = x + width
//   const y1 = y
//   const y2 = y + height
//   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
//     x1, y1,
//     x2, y1,
//     x1, y2,
//     x1, y2,
//     x2, y1,
//     x2, y2,
//   ]), gl.STATIC_DRAW)
// }