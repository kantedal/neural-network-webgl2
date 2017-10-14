import {Matrix as MyMatrix} from './matrix'
import {matMult as MyMatMult} from './mat-mult'

export namespace GpuMath {
  export const Matrix = MyMatrix
  export const matMult = MyMatMult
}