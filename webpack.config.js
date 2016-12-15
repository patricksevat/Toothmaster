require('babel-polyfill');
const webpack = require('webpack');


module.exports = {
  entry: ["babel-polyfill","./es6/app.js"],
  devtool: 'source-map',
  output: {
    path: __dirname + "/www",
    publicPath: '/',
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        test: /.js$/,
        loader: 'babel-loader',
        exclude: [/www\/lib/, /node_modules/, /ignore/, /hooks/, /documentation/, /platforms/, /testResults/, /tests/],
        query: {
          presets: ['es2015'],
          plugins: ["syntax-async-functions", "transform-regenerator"]
        }
      },
      {
        test: /\.html$/,
        loader: "raw-loader"
      }
    ]
  },
  plugins: [  ],
  resolve: {
    extensions: ['', '.js']
  }
};
