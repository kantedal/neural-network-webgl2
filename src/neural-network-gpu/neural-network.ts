import Neuron from './neuron'
import initGpuContext from './utils/init-gpu-context'
import ComputeShader from '../rendering/render-utils/compute-shader'
import DebugRenderer from './utils/debug-renderer'
import DataTexture3d from '../rendering/render-utils/data-texture-3d'
import {FLOAT_TYPE, TEXTURE_TYPE} from '../rendering/render-utils/shader'
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
  private _inputLayer: Neuron[]
  private _hiddenLayer: Neuron[]
  private _outputLayer: Neuron[]
  private _bestIndex: number = 0

  private _debugRenderer: DebugRenderer

  constructor(inputs: number, hidden: number, outputs: number) {
    initGpuContext()
    this._debugRenderer = new DebugRenderer()

    const computeShader = new ComputeShader(imageRenderFragmentShader, 300, 300)
    computeShader.setUniform('testVolumeShader', { type: TEXTURE_TYPE, value: create3dTexture() })
    const result: Float32Array = computeShader.compute()
    this._debugRenderer.renderImage(result, 300, 300)
  }
}


const create3dTexture = () => {
  const dimX = 28
  const dimY = 28
  const dimZ = 10
  const dataArray = new Float32Array(dimX * dimY * dimZ)

  for (let z = 0; z < dimZ; z++) {
    for (let y = 0; y < dimY; y++) {
      for (let x = 0; x < dimX; x++) {
        if (y === 5) {
          dataArray[y + x * dimY + z * dimX * dimY] = 1.0
        }
        else {
          dataArray[y + x * dimY + z * dimX * dimY] = 0.0
        }
      }
    }
  }

  const texture = new DataTexture3d(dimX, dimY, dimZ, dataArray)
  return texture.texture
}