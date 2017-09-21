import * as React from 'react'
import './App.css'
import NeuralNetwork from './neural-network-gpu/neural-network'
import Renderer from './rendering/renderer'
import {Card} from './neural-network/utils/card'
import createFloatArrayFromSet from './rendering/utils/create-floatarray-from-set'
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

    const neuralNetwork = new NeuralNetwork(784, 784, 10)
    neuralNetwork.inputLayer.output = new Float32Array(trainingSet[0].input)
    neuralNetwork.respond()

    // const renderer = new Renderer()
    // renderer.renderImage(createFloatArrayFromSet(testCard), 28, 28)

    // setInterval(() => renderer.renderImage(inputDataSets[currentImage++], 28, 28), 300)
  }
}

export default App
