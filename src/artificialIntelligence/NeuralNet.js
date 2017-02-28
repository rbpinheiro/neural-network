import math from 'mathjs';

const neuron = (numInputs) => ({
  numInputs,
  weights: math.ones(numInputs + 1).map(() => math.random(-1, +1)).valueOf()
});

const neuronLayer = (numNeurons, numInputsPerNeuron) => ({
  neurons: math.ones(numNeurons).map(() => neuron(numInputsPerNeuron)).valueOf()
});
let index = 0;
export default class NeuralNet {
  constructor({numInputs, numOutputs, numHiddenLayers, numNeuronsPerHiddenLayer}) {
    this.name = `NeuralNet ${index++}`;
    this.numInputs = numInputs;
    this.numOutputs = numOutputs;
    this.numHiddenLayers = numHiddenLayers;
    this.numNeuronsPerHiddenLayer = numNeuronsPerHiddenLayer;
    this.layers = null;
    this.bias = -1;
    this.activationResponse = 1;
    this.createNet();
  }

  createNet() {
    this.layers = [];

    if (this.numHiddenLayers <= 0) {
      this.layers.push(neuronLayer(this.numOutputs, this.numInputs));
      return this.layers;
    }

    this.layers.push(
      neuronLayer(
        this.numNeuronsPerHiddenLayer,
        this.numInputs
      )
    );

    math.ones(this.numHiddenLayers-1).forEach(() => {
      this.layers.push(
        neuronLayer(
          this.numNeuronsPerHiddenLayer,
          this.numNeuronsPerHiddenLayer
        )
      );
    });

    this.layers.push(
      neuronLayer(
        this.numOutputs,
        this.numNeuronsPerHiddenLayer
      )
    );
  }

  getWeights() {
    return this.layers.reduce(
      (weights, layer) => [
        ...weights,
        ...layer.neurons.reduce(
          (neurons, neuron) => neuron.weights.map(w => w),
          []
        )
      ],
      []
    );
  }

  putWeights(weights) {
    let weightIndex = 0;

    this.layers.forEach(layer => layer.neurons.forEach(neuron => {
      neuron.weights = neuron.weights.map(() => {
        weightIndex += 1;
        // console.log(weights.length, weightIndex);
        return weights[weightIndex - 1];
      });
    }));
  }

  getNumberOfWeights() {
    return this.layers.reduce(
      (total, layer) => {
        return total + layer.neurons.reduce(
          (total, neuron) => {
            return total + neuron.weights.reduce(
              (total) => total + 1,
              0
            );
          },
          0
        );
      },
      0
    );
  }

  sigmoid(netInput, response) {
    return (1 / (1 + Math.exp(-netInput / response)));
  }

  update(_inputs) {
    // if (this.name === 'NeuralNet 0') console.log(_inputs);
    if (_inputs.length !== this.numInputs) {
      return [];
    }
    let outputs = [];
    let weightIndex = 0;

    this.layers.forEach((layer, layerIndex) => {
      let inputs = (layerIndex > 0) ? outputs : _inputs;
      outputs = [];

      weightIndex = 0;

      layer.neurons.forEach((neuron, index) => {
        let netInput = 0;
        
        neuron.weights.slice(0, this.numInputs).forEach(weight => {
          netInput += weight * inputs[weightIndex];
          weightIndex += 1;
        });

        netInput += neuron.weights[neuron.weights.length - 1] * this.bias;
        outputs.push(this.sigmoid(netInput, this.activationResponse));


        weightIndex = 0;
      });
      
    });
    
    return outputs;
  }
}