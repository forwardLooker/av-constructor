var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './react_app/index.jsx',
  output: {
    path: path.resolve(__dirname, 'react_dist'),
    filename: 'index_bundle.js'
  },
  module: {
    rules: [
      {test: /\.(jsx|js)$/, use: 'babel-loader'},
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192, // Inline fonts smaller than 8kb
              name: 'assets/fonts/[name].[hash:8].[ext]' // Fallback path
            },
          },
        ],
      },
      // {
      //   test: /\.(woff|woff2|eot|ttf|otf)$/i,
      //   use: [
      //     {
      //       loader: 'file-loader',
      //       options: {
      //         name: '[name].[ext]',
      //         outputPath: 'fonts', // optional: puts fonts in a subfolder
      //       },
      //     },
      //   ],
      // }
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
