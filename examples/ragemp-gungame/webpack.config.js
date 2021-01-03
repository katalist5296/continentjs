const path = require('path');

module.exports = (env, argv) => {
  const commonConfig = {
    target: 'node',
    resolve: {
      modules: [
        'node_modules',
      ],
      extensions: ['.js', '.json', '.ts'],
    },
    optimization: {
      minimize: false,
    },
    node: {
      __filename: true,
      __dirname: false,
    },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules|lib/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-typescript'
              ],
            },
          },
        },
        {
          test: /\.ts?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                experimentalWatchApi: true,
                configFile: path.resolve(__dirname, 'tsconfig.json'),
              },
            },
          ],
        },
      ],
    },
  };

  const clientConfig = {
    entry: './src/client/index.ts',
    output: {
      path: path.join(__dirname, './dist', 'client_packages'),
      filename: 'index.js',
    }
  };

  const serverConfig = {
    entry: './src/server/index.ts',
    output: {
      path: path.join(__dirname, './dist', 'packages', 'gungame'),
      filename: 'index.js',
    }
  };

  const client = { ...commonConfig, ...clientConfig };
  const server = { ...commonConfig, ...serverConfig };

  return [client, server];
};

