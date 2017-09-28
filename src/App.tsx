import * as React from 'react'
import './App.css'
import NeuralNetwork from './neural-network-gpu/neural-network'
import NeuralNetworkCPU from './neural-network/neural-network'
import Renderer from './rendering/renderer'
import {Card} from './neural-network/utils/card'
import createFloatArrayFromSet from './rendering/utils/create-floatarray-from-set'
import Neuron from './neural-network/neuron'
import DebugRenderer from './neural-network-gpu/utils/debug-renderer'
import sigmoid from './neural-network/utils/sigmoid'
const mnist = require('mnist')

const logo = require('./logo.svg')


class App extends React.Component {
  render() {

    return (
      <div style={{ margin: 10 }}>
        <canvas width='500' height='500' id='canvas'/>
      </div>
    )
  }

  componentDidMount() {
    // const cards = mnist.set(100000, 0)
    // console.log(cards)
    // const neuralNetwork = new NeuralNetwork(784, 300, 10)
    //
    // const trainingSet: Card[] = cards.training
    // const testSet: Card[] = cards.test
    //
    // const trainIterations = 100
    // for (let i = 0; i < trainIterations; i++) {
    //   const trainingImage = trainingSet[Math.floor(Math.random() * trainingSet.length)]
    //
    //   neuralNetwork.respond(trainingImage)
    //   neuralNetwork.train(trainingImage.output)
    // }
    //
    // console.log('Neural network trained', trainIterations, 'times')
    //
    // const testIterations = 1000
    // let correctAnswers = 0
    // for (let k = 0; k < testIterations; k++) {
    //   const testCard = testSet[1000 + k]
    //
    //   neuralNetwork.respond(testCard)
    //   neuralNetwork.predict()
    //
    //   for (let i = 0; i < testCard.output.length; i++) {
    //     if (testCard.output[i] === 1) {
    //       if (neuralNetwork.bestIndex === i) { correctAnswers++ }
    //       break
    //     }
    //   }
    // }
    //
    // console.log((correctAnswers / testIterations) * 100 + '% correct answers')

    const cards = mnist.set(100000, 0)
    const trainingSet: Card[] = cards.training
    const testSet: Card[] = cards.test

    const neuralNetworkCPU = new NeuralNetworkCPU(784, 784, 10)
    const logCpuNN = () => {
      const output = []
      for (const outp of neuralNetworkCPU.hiddenLayer) {
        // for (const w of outp.weights) {
        //   output.push(w)
        // }
        output.push(outp.output)
      }
      console.log(output)

    }

    const buildWeightArray = (layer: Neuron[], neuronWidth: number, neuronHeight: number, weightWidth: number, weightHeight: number) => {
      const size = neuronWidth * neuronHeight * weightWidth * weightHeight
      const weights = new Float32Array(size)
      for (let neuronIndex = 0; neuronIndex < layer.length; neuronIndex++) {
        const neuron = layer[neuronIndex]

        const neuronRow = (neuronIndex - neuronIndex % neuronWidth) / neuronWidth
        const neuronCol = neuronIndex - neuronRow * neuronWidth
        const neuronArrayIndex = neuronCol * weightWidth + neuronRow * neuronWidth * weightWidth * weightWidth
        // console.log(neuronArrayIndex, neuronCol, neuronRow)

        for (let weightIndex = 0; weightIndex < neuron.weights.length; weightIndex++) {
          const weight = neuron.weights[weightIndex]

          const weightRow = (weightIndex - weightIndex % weightWidth) / weightWidth
          const weightCol = weightIndex - weightRow * weightWidth
          const weightArrayIndex = weightCol + weightRow * neuronWidth * weightWidth
          weights[neuronArrayIndex + weightArrayIndex] = weight
          // console.log('Weight col:', weightCol, ' Weight row:', weightRow)
        }
      }

      return weights
    }

    const neuralNetwork = new NeuralNetwork(784, 784, 10)

    const startTime = Date.now()
    const trainIterations = 5
    for (let i = 0; i < trainIterations; i++) {
      const trainingImage = trainingSet[Math.floor(Math.random() * trainingSet.length)]
      // neuralNetwork.inputLayer.output = new Float32Array(trainingImage.input)
      // neuralNetwork.respond()
      // neuralNetwork.train(trainingImage.output)
      // console.log('weights: ', neuralNetwork.hiddenLayer.neuronWeights)
      // console.log('error: ', neuralNetwork.hiddenLayer.error)

      neuralNetworkCPU.respond(trainingImage)
      neuralNetworkCPU.train(trainingImage.output)

      // logCpuNN()
      // console.log('Answer: ', trainingImage.output)
      // console.log('--------')
    }
    const duration = Date.now() - startTime
    console.log('Ran ' + trainIterations + ' iterations in ' + duration + ' ms')

    neuralNetwork.hiddenLayer.neuronWeights = buildWeightArray(neuralNetworkCPU.hiddenLayer, 28, 28, 28, 28)
    neuralNetwork.outputLayer.neuronWeights  = buildWeightArray(neuralNetworkCPU.outputLayer, 5, 2, 28, 28)


    // const debugRenderer = new DebugRenderer()
    // debugRenderer.renderImage(new Float32Array(testSet[1000].input), 28, 28, true)
    // console.log(testSet[1000].input)

    const testIterations = 1
    let correctAnswers = 0
    let correctAnswersGPU = 0
    for (let k = 0; k < testIterations; k++) {
      const testCard = testSet[1000 + k]

      // const firstWeights = []
      // for (let i = 0; i < 28 * 28; i++) {
      //   firstWeights.push(neuralNetworkCPU.hiddenLayer[i].weights[0])
      // }
      // console.log(firstWeights)

      neuralNetwork.inputLayer.output = new Float32Array(testCard.input)
      neuralNetwork.respond()
      neuralNetwork.predict()

      neuralNetworkCPU.respond(testCard)
      neuralNetworkCPU.predict()

      console.log(neuralNetwork.hiddenLayer.output)
      logCpuNN()
      console.log('--------')

      for (let i = 0; i < testCard.output.length; i++) {
        if (testCard.output[i] === 1) {
          if (neuralNetworkCPU.bestIndex === i) { correctAnswers++ }
          if (neuralNetwork.bestIndex === i) { correctAnswersGPU++ }
          break
        }
      }
    }

    console.log((correctAnswers / testIterations) * 100 + '% correct answers')
    console.log((correctAnswersGPU / testIterations) * 100 + '% correct answers on GPU')
  }
}

export default App
