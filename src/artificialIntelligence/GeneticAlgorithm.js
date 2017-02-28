import math from 'mathjs';

const genome = (weights, fitness) => ({
  weights,
  fitness,
});

export default class GenethicAlgorithm {
  constructor({ populationSize, mutationRate, crossoverRate, numWeights }) {
    this.population = math.ones(populationSize).map(() => 
      genome(math.ones(numWeights).map(() => math.random(-1, +1)).valueOf(), 0)
    ).valueOf();
    this.populationSize = populationSize;
    this.numWeights = numWeights;
    this.mutationRate = mutationRate;
    this.crossoverRate = crossoverRate;
    this.eliteThreshold = 3; // even number
    this.eliteCopies = 3;
    this.maxPerturbation = 0.3;
    this.generation = 0;
    this.fittestGenome = 0;
    this.reset();
  }

  reset() {
    this.totalFitness = 0;
    this.bestFitness = 0;
    this.worstFitness = 99999999;
    this.averageFitness = 0;
  }

  mutate(weights) {
    return weights.map(weight => {
      if (Math.random() < this.mutationRate) {
        return weight + Math.random() * this.maxPerturbation;
      }

      return weight;
    });
  }

  getChromosomeRoulette() {
    const slice = math.random(0.0, this.totalFitness);
    let fitnessCount = 0;

    return this.population.find(chromosome => {
      fitnessCount += chromosome.fitness;

      return fitnessCount >= slice;
    });
  }

  crossover(parent1, parent2) {
    if (Math.random() < this.mutationRate || parent1 === parent2) {
      return [parent1, parent2];
    }

    const crossoverPoint = math.random(0, this.numWeights -1);

    return [
      [
        ...parent1.slice(0, crossoverPoint),
        ...parent2.slice(crossoverPoint)
      ],
      [
        ...parent2.slice(0, crossoverPoint),
        ...parent1.slice(crossoverPoint)
      ]
    ];
  }

  epoch() {
    this.reset();
    
    this.calculateStatistics();
    
    let nextPopulation = this.grabNBest();
    
    while (nextPopulation.length < this.populationSize) {
      const parent1 = this.getChromosomeRoulette();
      const parent2 = this.getChromosomeRoulette();

      this
        .crossover(parent1.weights, parent2.weights)
        .map(::this.mutate)
        .map(weights => genome(weights, 0))
        .map(g => nextPopulation.push(g));

    }

    this.population = nextPopulation;
    return this.population;
  }

  grabNBest() {
    // works only for even numbers, otherwise roulette sampling will crash
    if (!(this.eliteCopies * this.eliteThreshold % 2)) {
      throw new Error('Selection works only for even numbers, otherwise roulette sampling will crash');
    }
    
    return this
      .population
      .slice(0, this.eliteThreshold)
      .reduce(
        (result, current) => [
          ...result,
          ...math.ones(this.eliteCopies).map(() => current).valueOf()
        ],
        []
      );
  }

  calculateStatistics() {
    this.population.sort((a, b) => b.fitness - a.fitness);
    this.totalFitness = this.population.reduce(
      (total, current) => total + current.fitness,
      0
    );
    
    this.bestFitness = this.population[0].fitness;
    this.worstFitness = this.population[this.population.length - 1];
    this.averageFitness = this.totalFitness / this.population.length;
  }
}