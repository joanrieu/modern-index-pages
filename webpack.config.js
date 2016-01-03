module.exports = {
    entry: "./src/index.js",
    output: {
        path: "build/",
        filename: "index.js"
    },
    module: {
        loaders: [
            {
                test: /\.json$/,
                loader: "json"
            }
        ]
    }
};
