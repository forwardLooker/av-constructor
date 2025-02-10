var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './react_app/index.js',
  output: {
    path: path.resolve(__dirname, 'react_dist'),
    filename: 'index_bundle.js'
  },
  module: {
    rules: [
      {test: /\.(jsx|js)$/, use: 'babel-loader'},
      {test: /\.css$/, use: ['style-loader', 'css-loader']}
    ]
  },
  devServer: {
    historyApiFallback: true
  },
  mode: 'development',
  plugins: [
    new HtmlWebpackPlugin({
      template: 'react_app/index.html'
    })
  ]
}
