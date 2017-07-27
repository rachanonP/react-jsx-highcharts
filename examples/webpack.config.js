const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const path = require('path');
const zipObject = require('lodash/zipObject');

const highchartsExamples = [
  { name: 'AddSeries' },
  { name: 'Combo', additional: ['highcharts-more'] },
  { name: 'Events' },
  { name: 'Funnel', additional: ['highcharts-funnel'] },
  { name: 'LiveUpdate' },
  { name: 'SimpleLine' },
  { name: 'SplineWithPlotBands' },
  { name: 'SynchronisedCharts', additional: ['promise-polyfill', 'fetch-polyfill'] },
  { name: 'Sparkline', additional: ['promise-polyfill', 'fetch-polyfill'] },
  { name: 'InvertedChart' }
];

const highstockExamples = [
  { name: 'CustomComponent', additional: ['moment', 'react-day-picker'] },
  { name: 'Highstocks' }
];

const examples = [].concat(
  highchartsExamples.map(({ name, additional = [] }) => ({ name, additional: ['highcharts', 'react-jsx-highcharts'].concat(additional) })),
  highstockExamples.map(({ name, additional = [] }) => ({ name, additional: ['highstock-release', 'react-jsx-highstock'].concat(additional) }))
);

const exampleNames = examples.map(e => e.name);

const externals = {
  'react-jsx-highcharts': '../../packages/react-jsx-highcharts/dist/react-jsx-highcharts.min.js',
  'react-jsx-highstock':  '../../packages/react-jsx-highstock/dist/react-jsx-highstock.min.js',
  'react':                'https://cdnjs.cloudflare.com/ajax/libs/react/15.5.4/react.js',
  'react-dom':            'https://cdnjs.cloudflare.com/ajax/libs/react/15.5.4/react-dom.js',
  'highcharts':           'https://code.highcharts.com/highcharts.js',
  'highstock-release':    'https://code.highcharts.com/stock/highstock.js',
  'highcharts-more':      'https://code.highcharts.com/highcharts-more.js',
  'highcharts-funnel':    'https://code.highcharts.com/modules/funnel.js',
  'prism':                'https://cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/prism.min.js',
  'prism-jsx':            'https://cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/components/prism-jsx.min.js',
  'moment':               'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js',
  'react-day-picker':     'https://unpkg.com/react-day-picker@6.0.5/lib/daypicker.js',
  'promise-polyfill':     'https://www.promisejs.org/polyfills/promise-6.1.0.js',
  'fetch-polyfill':       'https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.3/fetch.min.js'
};

module.exports = {
  entry: zipObject(exampleNames, exampleNames.map(name => path.resolve(__dirname, name))),

  output: {
    filename: '[name]/bundle.js',
    path: __dirname,
    library: 'example',
    libraryTarget: 'var'
  },

  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
    'highcharts': 'Highcharts',
    'highstock-release': 'Highcharts',
    'moment': 'moment',
    'react-day-picker': 'DayPicker',
    'react-jsx-highcharts': 'ReactHighcharts',
    'react-jsx-highstock': 'ReactHighcharts'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          cacheDirectory: true,
          plugins: ['transform-runtime'],
          presets: ['es2015', 'react', 'stage-0']
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ].concat(
    // Example code
    examples.map(({ name }) => {
      return new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'template.html'),
        filename: `${name}/index.html`,
        chunks: [name],
        inject: 'body'
      });
    })
  ).concat(
    // Additional dependencies
    examples.map(({ name, additional = [] }) => {
      return new HtmlWebpackIncludeAssetsPlugin({
        files: `${name}/index.html`,
        assets: additional.map(d => externals[d]),
        publicPath: false,
        append: false
      });
    })
  ).concat(
    // Default dependencies
    new HtmlWebpackIncludeAssetsPlugin({
      files: '**/index.html',
      assets: ['react', 'react-dom', 'prism', 'prism-jsx'].map(d => externals[d]),
      publicPath: false,
      append: false
    })
  )
};