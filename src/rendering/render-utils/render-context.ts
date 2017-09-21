export let gl: WebGL2RenderingContext

export const initRenderContext = (canvas: HTMLCanvasElement) => {
  gl = canvas.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true }) as WebGL2RenderingContext

  if (gl === null) {
    console.log('WebGL2 not available')
    return
  }

  gl.getExtension('EXT_color_buffer_float')
  gl.getExtension('OES_texture_float_linear')
}