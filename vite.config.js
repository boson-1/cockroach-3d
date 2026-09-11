import { defineConfig } from "vite";
import { resolve } from "node:path";
import { speciesFromPath } from "./src/species.js";
import { createAtlasData } from "./src/atlas-data.js";
import { renderAtlasPage } from "./src/page-template.js";
import { renderMetadata } from "./src/seo.js";
export default defineConfig({
  base: "./",
  plugins: [{
    name: "static-atlas-pages",
    transformIndexHtml: {
      order: "pre",
      handler(html, context) {
        const species = speciesFromPath(context.filename.replaceAll("\\", "/"));
        return html
          .replace("<!-- atlas:metadata -->", renderMetadata(species, createAtlasData(species).sources))
          .replace("<!-- atlas:content -->", renderAtlasPage(species));
      },
    },
  }],
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        [
          "index",
          "german",
          "brown",
          "brown-banded",
          "harlequin",
          "australian",
        ].map((name) => [name, resolve(import.meta.dirname, name + ".html")]),
      ),
      output: { manualChunks: { three: ["three"] } },
    },
  },
});
