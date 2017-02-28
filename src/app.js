import math from 'mathjs';


import game, {
  MineSweeper as GameMineSweeper,
  Mine,
  ActiveMine
} from './game';
import {
  NeuralNet,
  GeneticAlgorithm
} from './artificialIntelligence';
import Phaser from 'phaser';

class MineSweeper extends GameMineSweeper {
  constructor(index, game, controller) {
    super(index, game);

    this.fitness = 0;
    this.controller = controller;
    this.physics = this.game.physics.arcade;
    this.numOutputs = 1;
    this.brain = new NeuralNet({
      numInputs: 2,
      numOutputs: this.numOutputs,
      numHiddenLayers: controller.numHiddenLayers,
      numNeuronsPerHiddenLayer: controller.numNeuronsPerHiddenLayer
    });

    const style = {
      font: "20px Helvetica",
      fill: "#ff0044",
      wordWrap: true,
      wordWrapWidth: this.sweeper,
      align: "center",
      backgroundColor: "#ffffbb"
    };
    this.fitnessText = game.add.text(0, 0, this.fitness, style);
    this.fitnessText.anchor.set(0.5);
  }

  update() {
    super.update();

    this.fitnessText.x = Math.floor(this.sweeper.x + this.sweeper.width / 2);
    this.fitnessText.y = Math.floor(this.sweeper.y + this.sweeper.height / 2);
    this.fitnessText.setText(this.fitness);

    const inputs = [];

    const closestMine = this.getClosestMine();
    const closestActiveMine = this.getClosestActiveMine();
    const angleToMine = this.physics.angleBetween(
      this.sweeper,
      closestMine.mine.mine
    );
    const angleToActiveMine = this.physics.angleBetween(
      this.sweeper,
      closestActiveMine.mine.mine
    );

    inputs.push(angleToMine);
    inputs.push(angleToActiveMine);

    const output = this.brain.update(inputs);
    
    if (output.length < this.numOutputs) {
      throw new Error(`Invalid output ${output}`);
    }

    this.sweeper.angle = this.outputToAngle(output);

    this.sweeper.body.velocity = this.physics.velocityFromRotation(
      this.sweeper.body.rotation,
      150
    );
  }

  outputToAngle(output) {
    return Math.round((((360 * output) / 10) - 18) * 10);
  }

  getClosest(mines) {
    const mine = mines.map(
      mine => ({
        distance: this.physics.distanceBetween(
          this.sweeper,
          mine.mine
        ),
        mine,
      })
    ).sort((a, b) => a.distance - b.distance);

    return mine[0];
  }

  getClosestMine() {
    return this.getClosest(this.controller.mines);
  }

  getClosestActiveMine() {
    return this.getClosest(this.controller.activeMines);
  }

  reset() {
    this.fitness = 0;
    super.reset();
  }
}


class App {
  constructor({
    numSweepers,
    numMines,
    numActiveMines,
    ticksPerGeneration,
    numHiddenLayers,
    numNeuronsPerHiddenLayer,
    mutationRate,
    crossoverRate,
  }) {
    this.width = 900;
    this.height = 500;
    this.game = game({
      width: this.width,
      height: this.height,
      preload: ::this.preload,
      create: ::this.create,
      render: ::this.render,
      update: ::this.update,
    });
    
    this.numSweepers = numSweepers;
    this.numMines = numMines;
    this.numActiveMines = numActiveMines;
    this.ticksPerGeneration = ticksPerGeneration;
    this.numHiddenLayers = numHiddenLayers;
    this.numNeuronsPerHiddenLayer = numNeuronsPerHiddenLayer;
    this.mutationRate = mutationRate;
    this.crossoverRate = crossoverRate;
    this.currentTick = 0;
    this.generation = 0;
  }

  preload() {
    this.game.load.atlas('fitTank', 'assets/fit-tanks.png', 'assets/tanks.json');
    this.game.load.atlas('unfitTank', 'assets/unfit-tanks.png', 'assets/tanks.json');
    this.game.load.image('earth', 'assets/scorched_earth.png');
  }

  create() {
    // terrain
    this.game.add.tileSprite(0, 0, this.width, this.height, 'earth');
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.physics = this.game.physics.arcade;

    this.sweepers = math.ones(this.numSweepers).map(
      (_, index) => new MineSweeper(index, this.game, this)
    ).valueOf();
    this.mines = math.ones(this.numMines).map(
      (_, index) => new Mine(index, this.game)
    ).valueOf();
    this.activeMines = math.ones(this.numActiveMines).map(
      (_, index) => new ActiveMine(index, this.game)
    ).valueOf();

    this.geneticAlgorithm = new GeneticAlgorithm({
      populationSize: this.sweepers.length,
      mutationRate: this.mutationRate,
      crossoverRate: this.crossoverRate,
      numWeights: this.sweepers[0].brain.getNumberOfWeights()
    });

    const { population } = this.geneticAlgorithm;

    this.sweepers.forEach((sweeper, index) => {
      sweeper.brain.putWeights(population[index].weights);
    });
  }

  render() {
    this.geneticAlgorithm.calculateStatistics();
    this.game.debug.text(`Generation: ${this.generation}`, 10, 20);
    this.game.debug.text(`Next generation in: ${this.ticksPerGeneration - this.currentTick}`, 10, 40);
    this.game.debug.text(`Average Fitness: ${this.geneticAlgorithm.averageFitness}`, 10, 60);
    this.game.debug.text(`Best Fitness: ${this.geneticAlgorithm.bestFitness}`, 10, 80);
    this.game.debug.text(`Sweepers: ${this.sweepers.length}`, 10, 100);
    this.game.debug.text(`Mines: ${this.mines.length}`, 10, 120);
    this.game.debug.text(`Active Mines: ${this.activeMines.length}`, 10, 140);
  }

  update() {
    const { population } = this.geneticAlgorithm;
    if (this.currentTick >= this.ticksPerGeneration) {
      return this.nextGeneration();
    }

    this.currentTick += 1;

    this.sweepers.forEach((sweeper, index) => {
      sweeper.update();
      const closestMine = sweeper.getClosestMine();
      const closestActiveMine = sweeper.getClosestActiveMine();
      
      if (this.physics.overlap(sweeper.sweeper, closestMine.mine.mine)) {
        
        sweeper.fitness += 1;

        closestMine.mine.collect();
      }

      if (this.physics.overlap(sweeper.sweeper, closestActiveMine.mine.mine)) {
        
        sweeper.fitness -= 1;

        closestActiveMine.mine.collect();
      }

      population[index].fitness = sweeper.fitness;
    });
  }

  nextGeneration() {
    const newPopulation = this.geneticAlgorithm.epoch();

    this.sweepers.forEach((sweeper, index) => {
      sweeper.brain.putWeights(newPopulation[index].weights);
      sweeper.reset();
    });

    this.generation += 1;
    this.currentTick = 0;
  }
}

const conf = (name) => Number(document.getElementsByName(name)[0].value);

const start = () => {
  const app = new App({
    numSweepers: conf('numSweepers'),
    numMines: conf('numMines'),
    numActiveMines: conf('numActiveMines'),
    ticksPerGeneration: conf('ticksPerGeneration'),
    numHiddenLayers: conf('numHiddenLayers'),
    numNeuronsPerHiddenLayer: conf('numNeuronsPerHiddenLayer'),
    mutationRate: conf('mutationRate'),
    crossoverRate: conf('crossoverRate'),
  });
  document.querySelector('.control-panel').remove();
}

document
  .getElementById('start-button')
  .addEventListener('click', () => start());