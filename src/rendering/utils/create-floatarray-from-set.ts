import {Card} from '../../neural-network/utils/card'

const createFloatArrayFromSet = (set: Card) => {
  const data = new Float32Array(set.input.length * 4)
  for (let i = 0; i < set.input.length; i++) {
    data[i * 4    ] = 1.0 - set.input[i]
    data[i * 4 + 1] = 1.0 - set.input[i]
    data[i * 4 + 2] = 1.0 - set.input[i]
    data[i * 4 + 3] = 1.0
  }
  return data
}

export default createFloatArrayFromSet
