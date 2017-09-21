import {gl} from './render-context'

export interface IUniform {
  value: any
  type: number
  location?: WebGLUniformLocation
}

export interface IUniforms {
  [name: string]: IUniform
}

export const FLOAT_TYPE = 0
export const INTEGER_TYPE = 1
export const VEC2_TYPE = 2
export const VEC3_TYPE = 3
export const VEC4_TYPE = 4
export const TEXTURE_TYPE = 5

export enum UniformTypes { FLOAT, INTEGER, VEC2, VEC3, VEC4, TEXTURE }

export default class Shader {
  needsUpdate: boolean = false
  private _vertexShader: WebGLShader
  private _fragmentShader: WebGLShader
  private _program: WebGLProgram
  private _uniforms: {[name: string]: IUniform}

  constructor(vertexSource: string, fragmentSource: string) {
    this._vertexShader = this.createShader(gl.VERTEX_SHADER, vertexSource)
    this._fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentSource)
    this._uniforms = {}
  }

  public update() {
    let textureCount = 0

    for (const uniformName in this._uniforms) {
      if (uniformName) {
        const uniform = this._uniforms[uniformName] as IUniform
        if (uniform) {
          if (uniform.location != null) {
            if (uniform.type === FLOAT_TYPE) { gl.uniform1f(uniform.location, uniform.value) }
            else if (uniform.type === VEC2_TYPE) { gl.uniform2fv(uniform.location, uniform.value) }
            else if (uniform.type === VEC3_TYPE) { gl.uniform3fv(uniform.location, uniform.value) }
            else if (uniform.type === INTEGER_TYPE) { gl.uniform1i(uniform.location, uniform.value) }
            else if (uniform.type === TEXTURE_TYPE) {
              gl.uniform1i(uniform.location, textureCount)

              if (textureCount === 0) { gl.activeTexture(gl.TEXTURE0) }
              else if (textureCount === 1) { gl.activeTexture(gl.TEXTURE1) }
              else if (textureCount === 2) { gl.activeTexture(gl.TEXTURE2) }
              else if (textureCount === 3) { gl.activeTexture(gl.TEXTURE3) }
              else if (textureCount === 4) { gl.activeTexture(gl.TEXTURE4) }
              else if (textureCount === 5) { gl.activeTexture(gl.TEXTURE5) }
              else if (textureCount === 6) { gl.activeTexture(gl.TEXTURE6) }
              else if (textureCount === 7) { gl.activeTexture(gl.TEXTURE7) }
              else if (textureCount === 8) { gl.activeTexture(gl.TEXTURE8) }
              else if (textureCount === 9) { gl.activeTexture(gl.TEXTURE9) }
              else if (textureCount === 10) { gl.activeTexture(gl.TEXTURE10) }

              gl.bindTexture(gl.TEXTURE_2D, uniform.value)
              textureCount++
            }
          }
        }
      }
    }
  }

  public setUniform(id: string, data: IUniform) {
    this._uniforms[id] = data
    this.updateUniforms()
    this.needsUpdate = true
  }

  private createShader(type: number, source: string): WebGLShader  {
    const shader = gl.createShader(type) as WebGLShader

    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
    }

    return shader
  }

  private updateUniforms() {
    if (this._program) {
      for (const name in this._uniforms) {
        if (name) {
          const uniform = this._uniforms[name] as IUniform
          uniform.location = gl.getUniformLocation(this._program, name) as WebGLUniformLocation
        }
      }
    }
  }

  set uniforms(value: {[p: string]: IUniform}) {
    this._uniforms = value
    this.updateUniforms()
  }

  get uniforms() { return this._uniforms }

  set program(value: WebGLProgram) {
    this._program = value
    this.updateUniforms()
  }

  get fragmentShader(): WebGLShader { return this._fragmentShader }
  get vertexShader(): WebGLShader { return this._vertexShader }
}
