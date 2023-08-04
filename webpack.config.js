const webpack = require('webpack');
const path = require('path');

module.exports = {
    target: 'node',
    entry: path.resolve(__dirname, 'src/app.js'),
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js',
    },
    resolve: {
        alias: {
            src: path.resolve(__dirname, 'src/'),
            models: path.resolve(__dirname, 'models/'),
            config: path.resolve(__dirname, 'config/'),
        },
        extensions: ['.js', '.json'],
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
        ],
    },
    externals: 'sequelize',
    plugins: [
        new webpack.IgnorePlugin({
            resourceRegExp: /\/index.js$/,
        }),
    ],
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 8080,
    },
};
