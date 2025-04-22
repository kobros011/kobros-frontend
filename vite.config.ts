import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		watch: {
			usePolling: true,
		},
		port: 5050,
		host: true,
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@assets": path.resolve(__dirname, "./src/assets"),
			"@infrastructure": `${path.resolve(__dirname, './src/infrastructure')}`,
			"@domain": `${path.resolve(__dirname, './src/domain')}`,
			"@routes": `${path.resolve(__dirname, "./src/UI/Routes")}`,
			"@components": `${path.resolve(__dirname, "./src/UI/Components")}`
		}
	}
})
