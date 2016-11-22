const webpack = require('webpack');
require('babel-polyfill');

module.exports = {
  entry: "./es6/app.js",
  devtool: 'source-map',
  output: {
    path: __dirname + "/www/js",
    publicPath: '/',
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        test: /.js$/,
        loader: 'babel-loader',
        exclude: [/www\/lib/, /node_modules/, /ignore/, /hooks/, /documentation/, /platforms/, /testResults/],
        query: {
          presets: ['es2015'],
          plugins: ["syntax-async-functions", "transform-regenerator"]
        }
      }
    ]
  },
  plugins: [  ],
  resolve: {
    extensions: ['', '.js']
  }
};
