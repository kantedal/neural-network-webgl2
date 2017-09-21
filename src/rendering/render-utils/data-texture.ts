import {gl} from './render-context'

export default class DataTexture {
  public _texture: WebGLTexture

  constructor(
    private _width: number,
    private _height: number,
    private _data: Float32Array
  ) {
    this._texture = gl.createTexture() as WebGLTexture
    this.updateTexture()
  }

  public updateTexture() {
    gl.bindTexture(gl.TEXTURE_2D, this._texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, this._width, this._height, 0, gl.RED, gl.FLOAT, this._data)
  }

  get texture() { return this._texture }
  get width(): number { return this._width }
  get height(): number { return this._height }
  get textureData(): Float32Array { return this._data }
}
