import ComputeShader from '../rendering/render-utils/compute-shader'
import DataTexture from '../rendering/render-utils/data-texture'
import {IUniforms, UniformTypes} from '../rendering/render-utils/shader'
import DataTexture3d from '../rendering/render-utils/data-texture-3d'

// language=GLSL
const respondComputeShader = `#version 300 es
  precision highp float;

  in vec2 v_texCoord;
  out float outColor;
  
  uniform vec2 inputSize;
  uniform sampler2D inputData;
  uniform sampler2D neuronWeights;
  
  float sigmoid(float x) {
    return 1.0 / (1.0 + exp(-1.0 * x - 0.5));
  }
  
  float accumulateNeuronInput() {    
    vec2 startPosition = v_texCoord;
    
    float stepSizeX = 1.0 / inputSize.x;
    float stepSizeY = 1.0 / inputSize.y;
    
    float inputSum = 0.0;
    for (float x = 0.0; x <= 1.0; x += stepSizeX) {
      for (float y = 0.0; y <= 1.0; y += stepSizeY) {
        float neuronValue = texture(inputData, vec2(x, y)).x;
        float neuronWeight = texture(neuronWeights, startPosition + vec2(x / inputSize.x, y / inputSize.y)).x;
        inputSum += neuronWeight * neuronValue;
      }
    }
    
    return inputSum;
  }
  
  void main() {
    float inputSum = accumulateNeuronInput();
    outColor = sigmoid(inputSum);
  }
`

export default class Layer {
  private _dimensionsX: number
  private _dimensionsY: number
  private _respondComputeShader: ComputeShader
  private _respondUniforms: IUniforms
  private _trainComputeShader: ComputeShader
  private _trainUniforms: IUniforms
  private _neuronWeights: Float32Array
  private _output: Float32Array
  private _error: Float32Array

  constructor(private _size: number, private _inputLayer?: Layer) {
    this.calcDimensions()

    this.initNeuronWeights()
    const neuronWeightTexture = new DataTexture(this._dimensionsX * this._dimensionsX, this._dimensionsY * this._dimensionsY, this._neuronWeights, 1)

    this._respondComputeShader = new ComputeShader(respondComputeShader, this._dimensionsX, this._dimensionsY, 1)
    this._respondUniforms = {
      inputSize: { type: UniformTypes.Vec2, value: [this._dimensionsX, this._dimensionsY] },
      inputData: { type: UniformTypes.Texture2d, value: null },
      neuronWeights: { type: UniformTypes.Texture2d, value: neuronWeightTexture.texture }
    }
    this._respondComputeShader.uniforms = this._respondUniforms

    // this._trainComputeShader = new ComputeShader(respondComputeShader, this._dimensionsX * this._dimensionsX, this._dimensionsY * this._dimensionsY, 1)
    // this._trainUniforms = {
    //   inputSize: { type: UniformTypes.Vec2, value: [this._dimensionsX, this._dimensionsY] },
    //   inputData: { type: UniformTypes.Texture2d, value: null },
    //   neuronWeights: { type: UniformTypes.Texture2d, value: neuronWeightTexture.texture }
    // }
    // this._trainComputeShader.uniforms = this._trainUniforms
  }

  public respond() {
    if (this._inputLayer) {
      this._respondComputeShader.setUniform('inputData', {
        type: UniformTypes.Texture2d,
        value: new DataTexture(this.dimensionsX, this.dimensionsY, this._inputLayer.output, 1).texture
      })
      this._output = this._respondComputeShader.compute()
      this.output = this._output.filter((val: number, index: number) => index % 4 === 0)
    }
  }

  public train() {
    console.log(this._output)
  }

  private initNeuronWeights() {
    this._neuronWeights = new Float32Array(this._dimensionsY * this._dimensionsY * this._dimensionsX * this._dimensionsX)
    for (let i = 0; i < this._neuronWeights.length; i++) {
      this._neuronWeights[i] = 2.0 * (Math.random() - 0.5)
    }
  }

  private calcDimensions() {
    this._dimensionsX = Math.ceil(Math.sqrt(this._size))

    while (true) {
      if (this._size % this._dimensionsX === 0) {
        this._dimensionsY = this._size / this._dimensionsX
        break
      }
      this._dimensionsX++
    }
  }

  get output(): Float32Array { return this._output }
  set output(val: Float32Array) { this._output = val }
  get dimensionsX() { return this._dimensionsX }
  get dimensionsY() { return this._dimensionsY }
  set error(err: Float32Array) { this._error = err }
}