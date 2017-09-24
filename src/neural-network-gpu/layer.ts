import ComputeShader from '../rendering/render-utils/compute-shader'
import DataTexture from '../rendering/render-utils/data-texture'
import {IUniforms, UniformTypes} from '../rendering/render-utils/shader'
import DataTexture3d from '../rendering/render-utils/data-texture-3d'

// language=GLSL
const respondComputeShader = `#version 300 es
  precision highp float;
  precision highp sampler3D;

  in vec2 v_texCoord;
  out float outColor;
  
  uniform vec2 inputSize;
  uniform sampler2D inputData;
  uniform sampler3D neuronWeights;
  
  int getWeightLayerForNeuron() {
    vec2 realCoordintes = inputSize * v_texCoord;
    return int(realCoordintes.x + inputSize.y * realCoordintes.y);
  }
  
  float sigmoid(float x) {
    return 1.0 / (1.0 + exp(-1.0 * x - 0.5));
  }
  
  void main() {
    int weightLayerIndex = getWeightLayerForNeuron();
    
    float inputSum = 0.0;
    for (int y = 0; y < int(inputSize.y); y++) {
      for (int x = 0; x < int(inputSize.x); x++) {
        float neuronWeight = texelFetch(neuronWeights, ivec3(x, y, weightLayerIndex), 0).x;
        float neuronValue = texelFetch(inputData, ivec2(x, y), 0).x;
        inputSum += neuronWeight * neuronValue;
      }
    }
    
    float outp = sigmoid(inputSum);
    outColor = outp;
  }
`

// language=GLSL
const trainComputeShader = `#version 300 es
  precision highp float;
  precision highp sampler3D;

  in vec2 v_texCoord;
  out float outColor;
  
  uniform vec2 inputSize;
  uniform sampler2D inputData;
  uniform sampler3D neuronWeights;
  
  int getWeightLayerForNeuron() {
    vec2 realCoordintes = inputSize * v_texCoord;
    return int(realCoordintes.x + inputSize.y * realCoordintes.y);
  }
  
  float sigmoid(float x) {
    return 1.0 / (1.0 + exp(-1.0 * x - 0.5));
  }
  
  void main() {
    int weightLayerIndex = getWeightLayerForNeuron();
    
    float inputSum = 0.0;
    for (int y = 0; y < int(inputSize.y); y++) {
      for (int x = 0; x < int(inputSize.x); x++) {
        float neuronWeight = texelFetch(neuronWeights, ivec3(x, y, weightLayerIndex), 0).x;
        float neuronValue = texelFetch(inputData, ivec2(x, y), 0).x;
        inputSum += neuronWeight * neuronValue;
      }
    }
    
    float outp = sigmoid(inputSum);
    outColor = outp;
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
    const neuronWeightTexture = new DataTexture3d(this._dimensionsX, this._dimensionsY, this._size, this._neuronWeights)

    this._respondComputeShader = new ComputeShader(respondComputeShader, this._dimensionsX, this._dimensionsY, 1)
    this._respondUniforms = {
      inputSize: { type: UniformTypes.Vec2, value: [this._dimensionsX, this._dimensionsY] },
      inputData: { type: UniformTypes.Texture2d, value: null },
      neuronWeights: { type: UniformTypes.Texture3d, value: neuronWeightTexture.texture }
    }
    this._respondComputeShader.uniforms = this._respondUniforms

    this._trainComputeShader = new ComputeShader(respondComputeShader, this._dimensionsX * this._dimensionsX, this._dimensionsY * this._dimensionsY, 1)
    this._trainUniforms = {
      inputSize: { type: UniformTypes.Vec2, value: [this._dimensionsX, this._dimensionsY] },
      inputData: { type: UniformTypes.Texture2d, value: null },
      neuronWeights: { type: UniformTypes.Texture3d, value: neuronWeightTexture.texture }
    }
    this._trainComputeShader.uniforms = this._trainUniforms
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
    const dimX = this._dimensionsX
    const dimY = this._dimensionsY
    const dimZ = this._size
    this._neuronWeights = new Float32Array(dimX * dimY * dimZ)

    for (let z = 0; z < dimZ; z++) {
      for (let y = 0; y < dimY; y++) {
        for (let x = 0; x < dimX; x++) {
          this._neuronWeights[y + x * dimY + z * dimX * dimY] = 2.0 * (Math.random() - 0.5)
        }
      }
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