const path = require('path');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/renderer/scripts/app.js',
    output: {
      path: path.resolve(__dirname, 'dist/renderer'),
      filename: 'bundle.js',
      publicPath: isProduction ? './' : 'http://localhost:3000/'
    },
    target: 'electron-renderer',
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? false : 'eval-source-map',
    devServer: {
      port: 3000,
      hot: true,
      static: {
        directory: path.join(__dirname, 'src/renderer'),
        publicPath: '/'
      },
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          type: 'asset/resource'
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@shared': path.resolve(__dirname, 'src/shared'),
        '@renderer': path.resolve(__dirname, 'src/renderer'),
        '@main': path.resolve(__dirname, 'src/main')
      }
    },
    optimization: {
      minimize: isProduction,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      }
    },
    plugins: []
  };
};
