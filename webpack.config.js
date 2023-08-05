const webpack = require('webpack');
const path = require('path');
const packageJson = require('./package.json');
const dependencies = Object.keys(packageJson.dependencies || {});

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
    externals: dependencies.reduce((ext, name) => {
        ext[name] = `commonjs ${name}`;
        return ext;
    }, {}),
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
