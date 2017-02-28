var path = require('path');

var phaserModule = path.join(__dirname, '/node_modules/phaser/');
var phaser = path.join(phaserModule, 'build/custom/phaser-split.js'),
  pixi = path.join(phaserModule, 'build/custom/pixi.js'),
  p2 = path.join(phaserModule, 'build/custom/p2.js');

module.exports = {
  entry: "./src/app.js",
  output: {
    path: __dirname + '/build',
    filename: "bundle.js"
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
      { test: /pixi/, loader: "script-loader" },
      { test: /p2/, loader: "script-loader" },
    ]
  },
  resolve: {
    alias: {
      phaser: phaser,
      pixi: pixi,
      p2: p2,
    }
  },
  watch: true,
  devServer: {
    inline: true
  }
};