import DataTexture from '../render-utils/data-texture'

export class Matrix {
  private _data: Float32Array
  private _texture: DataTexture

  constructor(private _height: number, private _width: number, data?: Float32Array | number[], private _isGpuCalculated: boolean = false) {
    this._data = data && (data.length === _width * _height || data.length === _width * _height * 4) ? new Float32Array(data as Float32Array) : new Float32Array(_width * _height)

    // When calculated on GPU the data has four channels instead of just one
    this._texture = _isGpuCalculated ? new DataTexture(_width, _height, this._data, 4) : new DataTexture(_width, _height, this._data, 1)
  }

  public setAtPos(col: number, row: number, value: number) {
    this._data[(row * this._width + col) * (this._isGpuCalculated ? 4 : 1)] = value
  }

  public print() {
    const spaceStr = '      '
    let matStr = ''
    for (let y = 0; y < this._height; y++) {
      matStr += '| '
      for (let x = 0; x < this._width; x++) {
        const numberStr = this._data[(y * this._width + x) * (this._isGpuCalculated ? 4 : 1)].toFixed(2)
        matStr += spaceStr.substr(0, spaceStr.length - numberStr.length) + numberStr + ' '
      }
      matStr += ' |\n'
    }
    console.log(matStr)
  }

  set data(newData: Float32Array) {
    this._data = newData.length === this._data.length ? newData : this._data
    this._texture.textureData = this._data
  }
  get data() { return this._data }

  get width() { return this._width }
  get height() { return this._height }

  get texture() { return this._texture }
}

