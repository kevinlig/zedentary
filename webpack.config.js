const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const customConfig = require('./config.json');

module.exports = (env, argv) => {
    const isDev = argv.mode !== 'production';

    return {
        entry: './src/index.js',
        output: {
            filename: 'js/app.js',
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
                }
            ]
        },
        externals: {
            oimo: true,
            cannon: true,
            earcut: true
        },
        plugins: [
            new webpack.DefinePlugin({
                // setting up the websocket endpoint as an environment variable
                'process.env.APP_ENDPOINT': JSON.stringify(customConfig.endpoint) || ''
            }),
            new MiniCssExtractPlugin({
                filename: 'css/style.css'
            })
        ],
        devServer: {
            contentBase: path.join(__dirname, 'dist'),
            publicPath: '/',
            port: 9000
        }
    };
};
