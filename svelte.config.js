import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex()],

	kit: {
		alias: {
			'@/*': './src/lib/*'
		},
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter({
			maxDuration: 300, // Set the timeout to 300 seconds
			headers: [
				{
					source: '/(.*)',
					headers: [
						{
							key: 'Access-Control-Allow-Origin',
							value: '*'
						},
						{
							key: 'Access-Control-Allow-Credentials',
							value: 'true'
						},
						{
							key: 'Access-Control-Allow-Methods',
							value: '*'
						},
						{
							key: 'Access-Control-Allow-Headers',
							value: '*'
						}
					]
				}
			]
		}),
		alias: {},
		csrf: {
			checkOrigin: false
		}
	},

	extensions: ['.svelte', '.svx']
};

export default config;
