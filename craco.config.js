const path = require("node:path");
const { launchEditorMiddleware } = require("@react-dev-inspector/middleware");
 
module.exports = {
	devServer: (serverConfig) => {
		// https://webpack.js.org/configuration/dev-server/#devserversetupmiddlewares
		serverConfig.setupMiddlewares = (middlewares) => {
			middlewares.unshift(launchEditorMiddleware);
			return middlewares;
		};

		return serverConfig;
	},
	webpack: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
	babel: {
		plugins: ["styled-jsx/babel"],
	},
};
