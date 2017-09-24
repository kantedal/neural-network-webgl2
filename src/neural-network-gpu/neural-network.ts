import initGpuContext from './utils/init-gpu-context'
import DebugRenderer from './utils/debug-renderer'
import Layer from './layer'
const mnist = require('mnist')

// language=GLSL
export const imageRenderFragmentShader = `#version 300 es
  precision highp float;
  precision highp sampler3D;
  
  in vec2 v_texCoord;
  out vec4 outColor;
  
  uniform sampler3D testVolumeTexture;
  uniform float depthIndex;
  
  void main() {
    outColor = texelFetch(testVolumeTexture, ivec3(int(v_texCoord.x * 28.0), int(v_texCoord.y * 28.0), 0), 0);
  }
`

export default class NeuralNetwork {
  private _inputLayer: Layer
  private _hiddenLayer: Layer
  private _outputLayer: Layer
  private _bestIndex: number = 0

  private _debugRenderer: DebugRenderer

  constructor(inputNeurons: number, hiddenNeurons: number, outputNeurons: number) {
    initGpuContext()
    this._debugRenderer = new DebugRenderer()

    this._inputLayer = new Layer(inputNeurons)
    this._hiddenLayer = new Layer(hiddenNeurons, this._inputLayer)
    this._outputLayer = new Layer(outputNeurons, this._hiddenLayer)
  }

  public respond() {
    this._hiddenLayer.respond()
    this._outputLayer.respond()

    console.log(this._outputLayer.output)
    this._debugRenderer.renderImage(this._hiddenLayer.output, 28, 28, true)
  }

  public train(answer: number[]) {
    const error = []
    for (let i = 0; i < this._outputLayer.output.length; i++) {
      const desired = answer[i]
      const actual = this._outputLayer.output[i]
      error.push(desired - actual)
    }
    this._outputLayer.error = new Float32Array(error)
    console.log('Error', error)
    console.log('Answer', answer)
    console.log(this._outputLayer.output)
  }

  get inputLayer(): Layer { return this._inputLayer }
  get hiddenLayer(): Layer { return this._hiddenLayer }
  get outputLayer(): Layer { return this._outputLayer }
}
