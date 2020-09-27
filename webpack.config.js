
const path = require('path');
var HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const CopyPlugin = require('copy-webpack-plugin');

module.exports = 
[
	{
		mode: "development",
		devtool: "inline-source-map",

		entry: './src/main.tsx',

		output:
		{
			filename: '[name].js',
			path: path.resolve( __dirname, './dist' ),
		},

		plugins:
		[
			new HtmlWebpackPlugin(
				{
					hash: true,
					filename: "./index.html",
					template: "./src/index.html",
					now: Date.now()
				}
			),
			new CopyPlugin(
				[
					{ from: './src/styles.css', to: 'styles.css' },
					{ from: './src/manifest.webmanifest', to: 'manifest.webmanifest' },
					{ from: './src/models/placeholder.glb', to: 'models/placeholder.glb' },
					{ from: './src/models/mood.glb', to: 'models/mood.glb' },
					{ from: './src/models/mood-handle.glb', to: 'models/mood-handle.glb' },
					{ from: './src/images/svg/', to: 'images/svg/' },
				]
				),
		],
		
		module: 
		{
			rules:
			[
				{ 
					test: /.tsx?$/,
					use: 'ts-loader',
					exclude: /node_modules/
				},
				{
					test: /.css$/,
					use: 
					[
						'style-loader',
						'css-loader'
					]
				},
				{
					test: /.(png|svg|jpg|gif)$/,
					use: 
					[
						'file-loader'
					]
				}
					
			]
		},

		resolve:
		{
			modules:[ path.resolve( __dirname, 'node_modules' ) ],
			extensions: [ '.ts', '.tsx', '.js' ]
		},
	
	}
];

