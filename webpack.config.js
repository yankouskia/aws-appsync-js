const webpack = require('webpack');

const webpackConfig = {
  context: __dirname,
  entry: { appsync: './src/index.js' },
  output: {
    path: `${__dirname}/dist`,
    filename: '[name].js',
    library: 'aws-appsync-js',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      { test: /\.js?$/, use: 'babel-loader', exclude: /node_modules/ },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development',
      ),
    }),
    new webpack.ProvidePlugin({
      fetch: 'exports-loader?self.fetch!whatwg-fetch',
    }),
  ],
};

if (process.env.NODE_ENV === 'production') {
  const additionalPlugins = [
    new webpack.optimize.OccurrenceOrderPlugin(false),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_debugger: true,
        drop_console: true,
      },
    }),
  ];
  webpackConfig.plugins = webpackConfig.plugins.concat(additionalPlugins);
} else {
  webpackConfig.devtool = '#eval-source-map';
}

module.exports = webpackConfig;