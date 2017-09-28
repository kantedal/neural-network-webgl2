import RenderTarget from '../../rendering/render-utils/render-target'
import Shader, {IUniforms, UniformTypes} from '../../rendering/render-utils/shader'
import DataTexture from '../../rendering/render-utils/data-texture'

export default class DebugRenderer {
  private _renderTarget: RenderTarget
  private _uniforms: IUniforms
  private _dataTexture: DataTexture

  constructor() {
    const shader = new Shader(debugRendererVertexShader, debugRendererFragmentShader)
    this._uniforms = { u_texture: {type: UniformTypes.Texture2d, value: null} }
    shader.uniforms = this._uniforms

    this._renderTarget = new RenderTarget(shader, 500, 500)
    this._renderTarget.render()
  }

  public renderImage(data: Float32Array, width: number, height: number, mono: boolean) {
    this._dataTexture = new DataTexture(width, height, data, mono ? 1 : 4)
    this._uniforms['u_texture'].value = this._dataTexture.texture
    this._renderTarget.render()
  }

}

// language=GLSL
export const debugRendererVertexShader = `#version 300 es
  in vec2 a_texCoord;
  in vec4 a_position;
  
  out vec2 v_texCoord;
  
  void main() {
    gl_Position = a_position;
    v_texCoord = a_texCoord;
  }
`

// language=GLSL
export const debugRendererFragmentShader = `#version 300 es
  precision mediump float;
  
  uniform sampler2D u_texture;
  in vec2 v_texCoord;
  out vec4 outColor;
  
  void main() {
    vec2 uv = vec2(v_texCoord.x, 1.0 - v_texCoord.y);
    outColor = vec4(texture(u_texture, uv).xyz, 1.0);
  }
`
