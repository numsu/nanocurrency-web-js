const path = require('path')

module.exports = {
	entry: './index.ts',
	mode: 'production',
	module: {
		rules: [
			{
				test: /\.ts?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.js', '.json'],
	},
	output: {
		filename: 'index.min.js',
		path: path.resolve(__dirname, 'dist'),
		libraryTarget: 'var',
		library: 'NanocurrencyWeb',
	},
}