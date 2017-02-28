import Phaser from 'phaser';

export default class Mine {
  constructor(index, game) {
    const x = game.world.randomX;
    const y = game.world.randomY;

    this.game = game;
    this.name = `Mine ${index}`;
    this.mineGraphics = game.add.graphics(16, 16);
    this.mineGraphics.lineStyle(0);
    this.mineGraphics.beginFill(0xFFFF0B, 0.5);
    this.mineGraphics.drawCircle(0, 0, 30);
    this.mineGraphics.endFill();
    this.mineGraphics.boundsPadding = 0;
    this.mine = game.add.sprite(x, y);
    this.mine.addChild(this.mineGraphics);
    this.mine.enableBody = true;
    this.mine.physicsBodyType = Phaser.Physics.ARCADE;
    game.physics.enable(this.mine, Phaser.Physics.ARCADE);
  }

  collect() {
    const x = Math.max(Math.min(this.game.world.randomX,  880), 20);
    const y = Math.max(Math.min(this.game.world.randomY, 480), 20);
    this.mine.kill();

    this.mine.reset(x, y, 100);
  }
}