const path = require('path')

const baseConfig = {
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
}

module.exports = [
	{
		...baseConfig,
		output: {
			filename: 'index.js',
			path: path.resolve(__dirname, 'dist'),
			libraryTarget: 'commonjs2',
		},
	},
	{
		...baseConfig,
		output: {
			filename: 'index.min.js',
			path: path.resolve(__dirname, 'dist'),
			libraryTarget: 'var',
			library: 'NanocurrencyWeb',
		},
	},
]
