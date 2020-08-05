module.exports={
  entry: {
    main: './game2.js'
  },
  mode: 'development',
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      { 
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [[
              "@babel/plugin-transform-react-jsx",
              {pragma:"ToyReact.createElement"}
            ]]
          }
        } 
      }
    ]
  }
}