import Neuron from './neuron'
import initGpuContext from './utils/init-gpu-context'
import ComputeShader from '../rendering/render-utils/compute-shader'
import DebugRenderer from './utils/debug-renderer'
const mnist = require('mnist')

// language=GLSL
export const imageRenderFragmentShader = `#version 300 es
  precision highp float;
  
  in vec2 v_texCoord;
  out vec4 outColor;
  
  void main() {
    outColor = vec4(1.0, 1.0, 0.0, 1.0);
  }
`

export default class NeuralNetwork {
  private _inputLayer: Neuron[]
  private _hiddenLayer: Neuron[]
  private _outputLayer: Neuron[]
  private _bestIndex: number = 0

  private _debugRenderer: DebugRenderer

  constructor(inputs: number, hidden: number, outputs: number) {
    initGpuContext()
    this._debugRenderer = new DebugRenderer()

    const computeShader = new ComputeShader(imageRenderFragmentShader, 300, 300)
    const result: Float32Array = computeShader.compute()

    console.log(result)
    this._debugRenderer.renderImage(result, 300, 300)
  }
}
