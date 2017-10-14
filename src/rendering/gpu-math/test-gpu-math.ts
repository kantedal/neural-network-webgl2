import {GpuMath} from './gpu-math'

export const testGpuMath = () => {
  let mat1 = new GpuMath.Matrix(2, 4, [1, 4, 6, 10, 2, 7, 5, 3])
  let mat2 = new GpuMath.Matrix(4, 3, [1, 4, 6, 2, 7, 5, 9, 0, 11, 3, 1, 0])
  let testTimerStart = Date.now()
  let res = GpuMath.matMult(mat1, mat2)
  res.print()
  console.log('Test 1 ran at', Date.now() - testTimerStart, 'ms')

  mat1 = new GpuMath.Matrix(1024, 1024)
  mat2 = new GpuMath.Matrix(1024, 1024)
  testTimerStart = Date.now()
  res = GpuMath.matMult(mat1, mat2)
  console.log('Test 2 ran at', Date.now() - testTimerStart, 'ms')

  mat1 = new GpuMath.Matrix(2048, 2048)
  mat2 = new GpuMath.Matrix(2048, 2048)
  testTimerStart = Date.now()
  res = GpuMath.matMult(mat1, mat2)
  console.log('Test 3 ran at', Date.now() - testTimerStart, 'ms')
}