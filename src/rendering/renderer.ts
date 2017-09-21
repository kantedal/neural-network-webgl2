import {initRenderContext} from './render-utils/render-context'
import RenderTarget from './render-utils/render-target'
import {imageRenderFragmentShader, imageRenderVertexShader} from './shaders'
import Shader, {FLOAT_TYPE, IUniforms, TEXTURE_TYPE} from './render-utils/shader'
import DataTexture from './render-utils/data-texture'
import {start} from 'repl'

export default class Renderer {
  renderTarget: RenderTarget
  uniforms: IUniforms

  // Some dumb testing
  newDataTexture: DataTexture
  oldDataTexture: DataTexture
  startTime: number

  constructor() {
    const shader = new Shader(imageRenderVertexShader, imageRenderFragmentShader)
    this.uniforms = {
      u_time: { type: FLOAT_TYPE, value: 1000.0 },
      u_new_texture: { type: TEXTURE_TYPE, value: null },
      u_old_texture: { type: TEXTURE_TYPE, value: null }
    }
    shader.uniforms = this.uniforms

    this.renderTarget = new RenderTarget(shader, 500, 500)
    this.renderTarget.render()

    this.startTime = Date.now()
    const render = () => {
      const currentTime = Date.now() - this.startTime
      this.uniforms['u_time'].value = currentTime

      this.renderTarget.render()
      requestAnimationFrame(render)
    }

    render()
  }

  public renderImage(data: Float32Array, width: number, height: number) {
    this.oldDataTexture = this.newDataTexture
    this.newDataTexture = new DataTexture(width, height, data)

    this.uniforms['u_new_texture'].value = this.newDataTexture.texture
    this.uniforms['u_old_texture'].value = this.oldDataTexture && this.oldDataTexture.texture

    this.startTime = Date.now()
  }

}
