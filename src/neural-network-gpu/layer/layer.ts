import ComputeShader from '../../rendering/render-utils/compute-shader'
import DataTexture from '../../rendering/render-utils/data-texture'
import {IUniforms, UniformTypes} from '../../rendering/render-utils/shader'
import DataTexture3d from '../../rendering/render-utils/data-texture-3d'

// language=GLSL
const respondComputeShader = `#version 300 es
  precision highp float;

  in vec2 v_texCoord;
  out float outColor;
  
  uniform vec2 inputSize;
  uniform sampler2D inputData;
  uniform sampler2D neuronWeights;
  
  float sigmoid(float x) {
    return 1.0 / (1.0 + exp(-1.0 * x));
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

// language=GLSL
const trainErrorComputeShader = `#version 300 es
  precision highp float;

  in vec2 v_texCoord;
  out float outColor;
  
  uniform vec2 prevLayerSize;
  uniform sampler2D errorData;
  uniform sampler2D neuronWeights;
  
  float calculateError() {
    vec2 startPosition = v_texCoord;
    
    float stepSizeX = 1.0 / prevLayerSize.x;
    float stepSizeY = 1.0 / prevLayerSize.y;
    
    float errorSum = 0.0;
    for (float x = 0.0; x <= 1.0; x += stepSizeX) {
      for (float y = 0.0; y <= 1.0; y += stepSizeY) {
        float weight = texture(neuronWeights, vec2(x / prevLayerSize.x, y / prevLayerSize.y) + vec2(startPosition.x / prevLayerSize.x, startPosition.x / prevLayerSize.y)).x;
        float currentError = texture(errorData, vec2(x, y)).x;
        errorSum += weight * currentError;
      }
    }
    
    return errorSum;
  }
  
  void main() {
    outColor = calculateError();
  }
`

// language=GLSL
const trainWeightsComputeShader = `#version 300 es
  precision highp float;

  in vec2 v_texCoord;
  out float outColor;
  
  uniform vec2 inputSize;
  uniform sampler2D inputData;
  uniform sampler2D outputData;
  uniform sampler2D errorData;
  uniform sampler2D neuronWeights;
  
  float calculateWeight() {
    vec2 startPosition = v_texCoord;
    
    float stepSizeX = 1.0 / inputSize.x;
    float stepSizeY = 1.0 / inputSize.y;
     
    float outputValue = texture(outputData, startPosition + 0.0 * vec2(stepSizeX, stepSizeY)).x;
    float errorValue = texture(errorData, startPosition + 0.0 * vec2(stepSizeX, stepSizeY)).x;
    float delta = (1.0 - outputValue) * (1.0 + outputValue) * errorValue * 0.01;
    
    float weightSum = 0.0;
    for (float x = 0.0; x <= 1.0; x += stepSizeX) {
      for (float y = 0.0; y <= 1.0; y += stepSizeY) {
        float inputOutput = texture(inputData, vec2(x, y)).x;
        weightSum += delta * inputOutput;
      }
    }
    
    float currentWeight = texture(neuronWeights, startPosition).x;
    return currentWeight;
  }
  
  void main() {
    outColor = calculateWeight();
  }
`

export default class Layer {
  private _dimensionsX: number
  private _dimensionsY: number

  private _respondComputeShader: ComputeShader
  private _respondUniforms: IUniforms

  private _trainErrorComputeShader: ComputeShader
  private _trainErrorUniforms: IUniforms

  private _trainWeightsComputeShader: ComputeShader
  private _trainWeightsUniforms: IUniforms

  private _neuronWeights: Float32Array
  private _output: Float32Array
  private _error: Float32Array

  constructor(private _size: number, private _inputLayer?: Layer) {
    const dimensions = this.calcDimensionsFromSize(this._size)
    this._dimensionsX = dimensions[0]
    this._dimensionsY = dimensions[1]

    if (this._inputLayer) {
      this.initNeuronWeights()

      const inputDimX = this._inputLayer.dimensionsX
      const inputDimY = this._inputLayer.dimensionsY

      const neuronWeightTexture = new DataTexture(this._dimensionsX * inputDimX, this._dimensionsY * inputDimY, this._neuronWeights, 1)

      this._respondComputeShader = new ComputeShader(respondComputeShader, this._dimensionsX, this._dimensionsY, 1)
      this._respondUniforms = {
        inputSize: { type: UniformTypes.Vec2, value: [this._dimensionsX, this._dimensionsY] },
        inputData: { type: UniformTypes.Texture2d, value: null },
        neuronWeights: { type: UniformTypes.Texture2d, value: neuronWeightTexture.texture }
      }
      this._respondComputeShader.uniforms = this._respondUniforms

      this._trainErrorComputeShader = new ComputeShader(trainErrorComputeShader, inputDimX, inputDimY, 1)
      this._trainErrorUniforms = {
        prevLayerSize: { type: UniformTypes.Vec2, value: [this._dimensionsX, this._dimensionsY] },
        errorData: { type: UniformTypes.Texture2d, value: null },
        neuronWeights: { type: UniformTypes.Texture2d, value: neuronWeightTexture.texture }
      }
      this._trainErrorComputeShader.uniforms = this._trainErrorUniforms

      this._trainWeightsComputeShader = new ComputeShader(trainWeightsComputeShader, this._dimensionsX * inputDimX, this._dimensionsY * inputDimY, 1)
      this._trainWeightsUniforms = {
        inputSize: { type: UniformTypes.Vec2, value: [inputDimX, inputDimY] },
        inputData: { type: UniformTypes.Texture2d, value: null },
        outputData: { type: UniformTypes.Texture2d, value: null },
        errorData: { type: UniformTypes.Texture2d, value: null },
        neuronWeights: { type: UniformTypes.Texture2d, value: neuronWeightTexture.texture }
      }
      this._trainWeightsComputeShader.uniforms = this._trainWeightsUniforms
    }
  }

  public respond() {
    if (this._inputLayer) {
      const inputDataTexture = new DataTexture(this._inputLayer.dimensionsX, this._inputLayer.dimensionsY, this._inputLayer.output, 1)
      const neuronWeightTexture = new DataTexture(this._dimensionsX * this._inputLayer.dimensionsX, this._dimensionsY * this._inputLayer.dimensionsY, this._neuronWeights, 1)

      // console.log(neuronWeightTexture.textureData)
      this._respondComputeShader.setUniform('inputData', { type: UniformTypes.Texture2d, value: inputDataTexture.texture })
      this._respondComputeShader.setUniform('neuronWeights', { type: UniformTypes.Texture2d, value: neuronWeightTexture.texture })
      this._respondComputeShader.setUniform('inputSize', { type: UniformTypes.Vec2, value: [this._inputLayer.dimensionsX, this._inputLayer.dimensionsY] })

      this._output = this._respondComputeShader.compute()
      this._output = this._output.filter((val: number, index: number) => index % 4 === 0)
    }
  }

  public train() {
    if (this._inputLayer) {

      const errorDataTexture = new DataTexture(this._dimensionsX, this._dimensionsY, this._error, 1)
      const inputDataTexture = new DataTexture(this._inputLayer.dimensionsX, this._inputLayer.dimensionsY, this._inputLayer.output, 1)
      const outputDataTexture = new DataTexture(this._dimensionsX, this._dimensionsY, this._output, 1)
      const neuronWeightTexture = new DataTexture(this._dimensionsX * this._inputLayer.dimensionsX, this._dimensionsY * this._inputLayer.dimensionsY, this._neuronWeights, 1)

      this._trainErrorComputeShader.setUniform('errorData', { type: UniformTypes.Texture2d, value: errorDataTexture.texture})
      this._trainErrorComputeShader.setUniform('neuronWeights', { type: UniformTypes.Texture2d, value: neuronWeightTexture.texture})
      this._inputLayer.error = this._trainErrorComputeShader.compute().filter((val: number, index: number) => index % 4 === 0)

      this._trainWeightsComputeShader.setUniform('inputSize', { type: UniformTypes.Vec2, value: [ this._inputLayer.dimensionsX, this._inputLayer.dimensionsY ]})
      this._trainWeightsComputeShader.setUniform('inputData', { type: UniformTypes.Texture2d, value: inputDataTexture.texture})
      this._trainWeightsComputeShader.setUniform('outputData', { type: UniformTypes.Texture2d, value: outputDataTexture.texture})
      this._trainWeightsComputeShader.setUniform('errorData', { type: UniformTypes.Texture2d, value: errorDataTexture.texture})
      this._trainWeightsComputeShader.setUniform('neuronWeights', { type: UniformTypes.Texture2d, value: neuronWeightTexture.texture})

      this._neuronWeights = this._trainWeightsComputeShader.compute()
      this._neuronWeights = this._neuronWeights.filter((val: number, index: number) => index % 4 === 0)
    }
  }

  private initNeuronWeights() {
    if (this._inputLayer) {
      this._neuronWeights = new Float32Array(this._dimensionsY * this._inputLayer.dimensionsY * this._dimensionsX * this._inputLayer.dimensionsX)
      for (let i = 0; i < this._neuronWeights.length; i++) {
        this._neuronWeights[i] = 2.0 * (Math.random() - 0.5)
      }
    }
  }

  private calcDimensionsFromSize(size: number): number[] {
    let dimX = Math.ceil(Math.sqrt(size))
    let dimY = 0

    while (true) {
      if (size % dimX === 0) {
        dimY = size / dimX
        break
      }
      dimX++
    }

    return [dimX, dimY]
  }

  get output(): Float32Array { return this._output }
  set output(val: Float32Array) {
    this._output = val
    const dimensions = this.calcDimensionsFromSize(this._size)
    this._dimensionsX = dimensions[0]
    this._dimensionsY = dimensions[1]
  }

  get dimensionsX() { return this._dimensionsX }
  get dimensionsY() { return this._dimensionsY }
  set error(err: Float32Array) { this._error = err }
  get error() { return this._error }
}