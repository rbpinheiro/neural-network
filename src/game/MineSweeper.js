import Phaser from 'phaser';

export default class MineSweeper {
  constructor(index, game) {
  var x = game.world.randomX;
  var y = game.world.randomY;

  this.game = game;
  this.alive = true;
  this.name = `Sweeper ${index}`;

  this.shadow = game.add.sprite(x, y, 'fitTank', 'shadow');
  this.sweeper = game.add.sprite(x, y, 'fitTank', 'tank1');
  this.sweeper.height = this.sweeper.height / 2;
  this.sweeper.width = this.sweeper.width / 2;
  this.shadow.height = this.sweeper.height / 2;
  this.shadow.width = this.sweeper.width / 2;

  this.shadow.anchor.set(0.5);
  this.sweeper.anchor.set(0.5);

  this.sweeper.name = index.toString();
  game.physics.enable(this.sweeper, Phaser.Physics.ARCADE);
  this.sweeper.enableBody = true;
  this.sweeper.physicsBodyType = Phaser.Physics.ARCADE;
  this.sweeper.body.immovable = false;
  this.sweeper.body.collideWorldBounds = true;
  this.sweeper.body.bounce.setTo(1, 1);

  this.sweeper.angle = game.rnd.angle();
  }

  update() {
    this.shadow.x = this.sweeper.x;
    this.shadow.y = this.sweeper.y;
    this.shadow.rotation = this.sweeper.rotation;
  }

  reset() {
    const x = this.game.world.randomX;
    const y = this.game.world.randomY;
    this.sweeper.kill();

    this.sweeper.reset(x, y, 100);
  }
}