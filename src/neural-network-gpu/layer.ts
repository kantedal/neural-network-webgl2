import ComputeShader from '../rendering/render-utils/compute-shader'
import DataTexture from '../rendering/render-utils/data-texture'
import {IUniforms, TEXTURE_TYPE, VEC2_TYPE} from '../rendering/render-utils/shader'

// language=GLSL
export const layerComputeShader = `#version 300 es
  precision highp float;
  
  in vec2 v_texCoord;
  out vec4 outColor;
  
  uniform vec2 inputSize;
  uniform sampler2D inputData;
  
  void main() {
    outColor = vec4(3.0, 0.0, 0.0, 1.0);
  }
`

export default class Layer {
  private _dimensions: number
  private _computeShader: ComputeShader
  private _uniforms: IUniforms
  private _output: Float32Array

  constructor(private _size: number, private _inputLayer: Layer) {
    this._dimensions = Math.sqrt(this._size)
    this._computeShader = new ComputeShader(layerComputeShader, this._dimensions, this._dimensions)
    this._uniforms = {
      inputSize: { type: VEC2_TYPE, value: [] },
      inputData: { type: TEXTURE_TYPE, value: null },
      weights: { type: TEXTURE_TYPE, value: null }
    }
    this._computeShader.uniforms = this._uniforms
  }

  public respond() {
    this._computeShader.setUniform('inputData', {
      type: TEXTURE_TYPE,
      value: new DataTexture(this.dimensions, this.dimensions, this._inputLayer.output).texture
    })
    this._output = this._computeShader.compute()
  }

  get output(): Float32Array { return this._output }
  set output(val: Float32Array) { this._output = val }
  get dimensions() { return this._dimensions }
}