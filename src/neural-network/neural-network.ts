import Neuron from './neuron'
import {Card} from './utils/card'
const mnist = require('mnist')

export default class NeuralNetwork {
  inputLayer: Neuron[]
  hiddenLayer: Neuron[]
  outputLayer: Neuron[]
  bestIndex: number = 0

  constructor(inputs: number, hidden: number, outputs: number) {
    this.inputLayer = []
    this.hiddenLayer = []
    this.outputLayer = []

    for (let i = 0; i < inputs; i++) {
      this.inputLayer.push(new Neuron())
    }

    for (let i = 0; i < hidden; i++) {
      this.hiddenLayer.push(new Neuron(this.inputLayer))
    }

    for (let i = 0; i < outputs; i++) {
      this.outputLayer.push(new Neuron(this.hiddenLayer))
    }
  }

  public respond(card: Card) {
    let inputCount = 0
    for (const input of this.inputLayer) {
      input.output = card.input[inputCount]
      inputCount++
    }

    for (const hidden of this.hiddenLayer) {
      hidden.respond()
    }

    for (const output of this.outputLayer) {
      output.respond()
    }
  }

  public train(outputs: number[]) {
    // adjust the output layer
    for (let k = 0; k < this.outputLayer.length; k++) {
      this.outputLayer[k].calcError(outputs[k])
      this.outputLayer[k].train()
    }

    let best = -1.0
    for (let i = 0; i < this.outputLayer.length; i++) {
      if (this.outputLayer[i].output > best) {
        this.bestIndex = i
        best = this.outputLayer[i].output
      }
    }

    // propagate back to the hidden layer
    for (const hidden of this.hiddenLayer) {
      hidden.train()
    }
  }

  predict() {
    const resp: number[] = []
    let respTotal = 0.0
    for (let k = 0; k < this.outputLayer.length; k++) {
      resp.push(this.outputLayer[k].output)
      respTotal += resp[k] + 1
    }

    // for (let k = 0; k < this.outputLayer.length; k++) {
    //   // console.log(k + ': ' + (((this.outputLayer[k].output + 1) / respTotal) * 100) + '%')
    // }

    let best = -1.0
    for (let i = 0; i < resp.length; i++) {
      if (resp[i] > best) {
        best = resp[i]
        this.bestIndex = i
      }
    }

    // console.log('best:', this.bestIndex)
  }

}
