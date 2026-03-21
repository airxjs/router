import pkg from './package.json' with { type: 'json' }
import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from 'rollup-plugin-esbuild'

const baseOutputOptions = {
	sourcemap: true,
	name: pkg.name,
	globals: { airx: 'airx' }
}

const umdOutputOptions = {
	...baseOutputOptions,
	file: pkg.main,
	format: 'umd',
	name: pkg.name
}

const moduleOutputOptions = {
	...baseOutputOptions,
	file: pkg.module,
	format: 'module',
	name: pkg.name
}

export default [
	{
		input: 'source/index.ts',
		external: ['airx'],
		plugins: [
			resolve(),
			commonjs(),
			typescript(),
			esbuild({
				jsx: 'transform',
				target: 'es2017',
				jsxFragment: '__airx__.Fragment',
				jsxFactory: '__airx__.createElement',
				banner: 'import * as __airx__ from \'airx\''
			})
		],
		output: [
			umdOutputOptions,
			moduleOutputOptions,
		]
	}
]
