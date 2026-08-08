import { defineConfig } from "vite";
import htmlPlugin from "./html-plugin/index.js";

function replacePublicPaths() {
  let base = "/";

  return {
    name: "replace-public-paths",

    configResolved(config) {
      base = config.base;
    },

    transformIndexHtml(html) {
      return html.replace(/(["'])\/(assets|resources)/g, `$1${base}$2`);
    },
  };
}

export default defineConfig({
  base: "/portfolio/9dryavka/",

  plugins: [htmlPlugin(), replacePublicPaths()],
});
