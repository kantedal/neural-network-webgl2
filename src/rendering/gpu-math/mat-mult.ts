import {Matrix} from './matrix'
import ComputeShader from '../render-utils/compute-shader'
import {IUniform, UniformTypes} from '../render-utils/shader'
import DataTexture from '../render-utils/data-texture'
import {gl} from '../render-utils/render-context'

// language=GLSL
const matMultShader = `#version 300 es
  precision highp float;

  in vec2 v_texCoord;
  out float outColor;
  
  uniform vec2 matSize;
  uniform vec2 outputSize;
  uniform sampler2D matrix1;
  uniform sampler2D matrix2;
  
  void main() {
    float result = 0.0;
    
    float delta = 1.0 / matSize.x;
    float current = 0.0;
    for (float i = 0.0; i < matSize.x; i += 1.0) {
      result += texture(matrix1, vec2(current, v_texCoord.y)).x * texture(matrix2, vec2(v_texCoord.x, current)).x;
      current += delta;
    }
    outColor = result;
  }
`
let matMultComputeShader: ComputeShader

const matMultUniforms: {[p: string]: IUniform } = {
  matSize: { type: UniformTypes.Vec2, value: [0, 0] },
  outputSize: { type: UniformTypes.Vec2, value: [0, 0] },
  matrix1: { type: UniformTypes.Texture2d, value: null },
  matrix2: { type: UniformTypes.Texture2d, value: null },
}

export const matMult = (mat1: Matrix, mat2: Matrix) => {
  if (matMultComputeShader != null) {
    matMultComputeShader.resize(mat2.width, mat1.height)
  }
  else {
    matMultComputeShader = new ComputeShader(matMultShader, mat2.width, mat1.height)
  }

  matMultUniforms.matSize.value = [ mat1.width, mat1.height ]
  matMultUniforms.outputSize.value = [ mat2.width, mat1.height ]
  matMultUniforms.matrix1.value = mat1.texture.texture
  matMultUniforms.matrix2.value = mat2.texture.texture
  matMultComputeShader.uniforms = matMultUniforms

  // console.log(mat2.width, mat1.height)
  const output = matMultComputeShader.compute()
  return new Matrix(mat1.height, mat2.width, output, true)
}