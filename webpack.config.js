const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const customConfig = require('./config.json');

module.exports = (env, argv) => {
    const isDev = argv.mode !== 'production';

    return {
        entry: {
            app: './src/app/index.js',
            controller: './src/controller/index.js'
        },
        output: {
            filename: 'js/[name].js',
            path: path.resolve(__dirname, 'dist')
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
                        'css-loader'
                    ]
                },
                {
                    test: /\.jsx$/,
                    exclude: /node_modules/,
                    use: ['babel-loader']
                }
            ]
        },
        externals: {
            oimo: true,
            cannon: true,
            earcut: true
        },
        optimization: {
            minimize: false // minimization breaks brain.js
        },
        plugins: [
            new webpack.DefinePlugin({
                // setting up the websocket endpoint as an environment variable
                'process.env.APP_ENDPOINT': JSON.stringify(customConfig.endpoint) || ''
            }),
            new MiniCssExtractPlugin({
                filename: 'css/[name].css'
            })
        ],
        devServer: {
            contentBase: path.join(__dirname, 'dist'),
            publicPath: '/',
            port: 9000,
            host: '0.0.0.0'
        }
    };
};
