module.exports = {
  mode: "development",
  entry: {
    "bundle": ["./src/render/index.tsx"],
    "main": ["./main.ts"],
    "screen": ["./src/render/screen.tsx"],
    "image": ["./src/render/image.tsx"]
  },
  output: {
    filename: "[name].js",
    path: __dirname + "/dist"
  },

  devtool: "source-map",

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"]
  },

  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" },

      { enforce: "pre", test: /\.tsx?$/, loader: "source-map-loader" },

      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader'
        ]
      }
    ]
  },

  plugins: [
  ],

  target: "electron-renderer"
};