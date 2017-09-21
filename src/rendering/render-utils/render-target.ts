import Shader from './shader'
import createProgram from './create-program'
import {gl} from './render-context'

export default class RenderTarget {

  public _program: WebGLProgram
  protected _positionAttribLocation: number
  protected _positionBuffer: WebGLBuffer
  protected _texCoordAttribLocation: number
  protected _texCoordBuffer: WebGLBuffer
  private _scaleFactor: number

  constructor(protected _shader: Shader, private _sizeX: number, private _sizeY: number) {
    this._program = createProgram(gl, this._shader)
    this._shader.program = this._program

    this._scaleFactor = 1.0

    const positions = new Float32Array([
      -1.0, -1.0,
      -1.0,  1.0,
      1.0, -1.0,
      -1.0,  1.0,
      1.0,  1.0,
      1.0, -1.0,
    ])

    const texCoords = new Float32Array([
      0.0,  0.0,
      0.0,  1.0,
      1.0,  0.0,
      0.0,  1.0,
      1.0,  1.0,
      1.0,  0.0,
    ])

    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    this._positionAttribLocation = gl.getAttribLocation(this._program, 'a_position')
    this._texCoordAttribLocation = gl.getAttribLocation(this._program, 'a_texCoord')

    this._positionBuffer = gl.createBuffer() as WebGLBuffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    this._texCoordBuffer = gl.createBuffer() as WebGLBuffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW)

    gl.viewport(0, 0, this._sizeX, this._sizeY)
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }

  public render() {
    gl.viewport(0, 0, this._sizeX, this._sizeY)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.useProgram(this._program)

    gl.enableVertexAttribArray(this._positionAttribLocation)
    gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer)
    gl.vertexAttribPointer(this._positionAttribLocation, 2, gl.FLOAT, false, 0, 0)

    gl.enableVertexAttribArray(this._texCoordAttribLocation)
    gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordBuffer)
    gl.vertexAttribPointer(this._texCoordAttribLocation, 2, gl.FLOAT, false, 0, 0)

    this._shader.update()

    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }

  public setWindowSize(sizeX: number, sizeY: number) {
    this._sizeX = sizeX
    this._sizeY = sizeY
  }

  get scaleFactor(): number { return this._scaleFactor }
  set scaleFactor(value: number) { this._scaleFactor = value }
  get sizeX(): number { return this._sizeX }
  get sizeY(): number { return this._sizeY }
}
