import { parseHTML } from "linkedom";
import { buildContentLink } from "./build/content-link";
import { buildContentSource } from "./build/content-source";

/**
 * index.htmlにコンテンツを注入する
 */
export default function htmlPlugin() {
  return {
    name: "html-plugin",

    transformIndexHtml(html) {
      const { document } = parseHTML(html);

      // コンテンツリンク
      buildContentLink(document);
      // コンテンツソース
      buildContentSource(document);

      return document.toString();
    },
  };
}
