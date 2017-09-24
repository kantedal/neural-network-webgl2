import ComputeShader from '../rendering/render-utils/compute-shader'
import DataTexture from '../rendering/render-utils/data-texture'
import {IUniforms, TEXTURE_TYPE, VEC2_TYPE} from '../rendering/render-utils/shader'
import DataTexture3d from '../rendering/render-utils/data-texture-3d'

// language=GLSL
export const layerComputeShader = `#version 300 es
  precision highp float;
  precision highp sampler3D;

  in vec2 v_texCoord;
  out vec4 outColor;
  
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
    for (int x = 0; x < int(inputSize.x); x++) {
      for (int y = 0; y < int(inputSize.y); y++) {
        float neuronWeight = texelFetch(neuronWeights, ivec3(x, y, weightLayerIndex), 0).x;
        float neuronValue = texelFetch(inputData, ivec2(x, y), 0).x;
        inputSum += neuronWeight * neuronValue;
      }
    }
    
    float outp = sigmoid(inputSum);
    
    vec4 clr = texture(neuronWeights, vec3(0.0));
    outColor = clr; // texture(inputData, v_texCoord); // vec4(0.0, 0.0, 0.0, 1.0);
  }
`

export default class Layer {
  private _dimensions: number
  private _computeShader: ComputeShader
  private _uniforms: IUniforms
  private _neuronWeights: Float32Array
  private _output: Float32Array

  constructor(private _size: number, private _inputLayer?: Layer) {
    this._dimensions = Math.sqrt(this._size)

    this.initNeuronWeights()
    const neuronWeightTexture = new DataTexture3d(this._dimensions, this._dimensions, this._size, this._neuronWeights)

    this._computeShader = new ComputeShader(layerComputeShader, this._dimensions, this._dimensions)
    this._uniforms = {
      inputSize: { type: VEC2_TYPE, value: [this._dimensions, this._dimensions] },
      inputData: { type: TEXTURE_TYPE, value: null },
      neuronWeights: { type: TEXTURE_TYPE, value: neuronWeightTexture.texture }
    }
    this._computeShader.uniforms = this._uniforms
  }

  public respond() {
    if (this._inputLayer) {
      this._computeShader.setUniform('inputData', {
        type: TEXTURE_TYPE,
        value: new DataTexture(this.dimensions, this.dimensions, this._inputLayer.output, 1).texture
      })
      this._output = this._computeShader.compute()
    }
  }

  private initNeuronWeights() {
    const dimX = this._dimensions
    const dimY = this._dimensions
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

  get output(): Float32Array { return this._output }
  set output(val: Float32Array) { this._output = val }
  get dimensions() { return this._dimensions }
}