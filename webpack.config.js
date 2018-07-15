var path = require("path")
var HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "docs"),
        filename: "bundle.js"
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: "./docs",
        port: 8080,
        compress: true
    },
    module: {
        rules: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"},
            { test: /\.css$/, loader: ["style-loader", "css-loader"]}
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({template: './src/index.html'})
    ],
    mode: "development",
    target: "web"
}