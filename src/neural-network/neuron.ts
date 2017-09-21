import sigmoid from './utils/sigmoid'

const LEARNING_RATE = 0.01

export default class Neuron {
  inputs: Neuron[]
  weights: number[]
  output: number
  error: number = 0.0

  constructor(prevInputs?: Neuron[]) {
    this.inputs = []
    this.weights = []

    if (prevInputs) {
      for (const input of prevInputs) {
        this.inputs.push(input)
        this.weights.push(2.0 * (Math.random() - 0.5))
      }
    }
  }

  respond() {
    let sumInput = 0.0
    for (let i = 0; i < this.inputs.length; i++) {
      sumInput += this.inputs[i].output * this.weights[i]
    }
    this.output = sigmoid(sumInput)
    this.error = 0.0
  }

  calcError(desired: number) {
    this.error = desired - this.output
  }

  train() {
    const delta = (1.0 - this.output) * (1.0 + this.output) * this.error * LEARNING_RATE
    for (let i = 0; i < this.inputs.length; i++) {
      this.inputs[i].error += this.weights[i] * this.error
      this.weights[i] += this.inputs[i].output * delta
    }
  }
}
