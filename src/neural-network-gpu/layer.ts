import ComputeShader from '../rendering/render-utils/compute-shader'

// language=GLSL
export const layerComputeShader = `#version 300 es
  precision highp float;
  
  in vec2 v_texCoord;
  out vec4 outColor;
  uniform sampler2D inputData;
  
  void main() {
    outColor = vec4(3.0, 0.0, 0.0, 1.0);
  }
`

export default class Layer {
  private _computeShader: ComputeShader

  constructor(private _size: number, inputLayer: Layer) {
    const dimensions = Math.sqrt(this._size)

  }
}