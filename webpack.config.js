const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  context: __dirname,
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  devServer: {
    port: 3000
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html',
      inject: true,
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.DefinePlugin({
      'process.env.NEAR_NO_LOGS': JSON.stringify(process.env.NEAR_NO_LOGS),
    })
  ],
  module: {
    rules: [
      {
        test: /\.ts(x)?$/,
        loader: 'ts-loader',
      }
    ],
  },
  resolve: {
    extensions: ['.js', '.ts']
  }
}
