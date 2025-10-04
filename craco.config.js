const path = require("path");
module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  babel: {
    plugins: ["styled-jsx/babel"],
  },
};
