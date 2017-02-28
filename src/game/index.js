import 'pixi';
import 'p2';
import Phaser from 'phaser';

export default function ({
  preload,
  create,
  update,
  render,
  width,
  height
}) {
  return new Phaser.Game(
    width,
    height,
    Phaser.AUTO,
    'game',
    {
      preload: preload,
      create: create,
      update: update,
      render: render
    }
  );
}

export MineSweeper from './MineSweeper';
export Mine from './Mine';
export ActiveMine from './ActiveMine';