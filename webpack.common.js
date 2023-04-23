// const currentTask = process.env.npm_lifecycle_event;
const HTMLWebpackPlugin = require('html-webpack-plugin');
// const miniCSSExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

const config = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: './src/index.html',
    }),
  ],
};

module.exports = config;
