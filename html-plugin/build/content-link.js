import { CONTENT_DEFINES } from "../define/contents";
import { setDataAttributes } from "../common";

/**
 * コンテンツリンク作成処理
 * @param { Document } document
 */
export function buildContentLink(document) {
  const nav = document.querySelector("#content-link");

  const list = createList(document, CONTENT_DEFINES);

  nav.appendChild(list);
}

/**
 * 定義JSONをもとに、各コンテンツへのリンクリスト(headerの目次要素)を作成する
 * @param { Document } document
 * @param { Object } currentDefine
 * @returns { HTMLUListElement }
 */
function createList(document, currentDefine) {
  const ul = document.createElement("ul");
  ul.id = `${currentDefine.id}-list`;

  // dataをdata-*属性として付与
  if (currentDefine.data) {
    setDataAttributes({ element: ul, data: currentDefine.data });
  }

  if (currentDefine.children) {
    for (const node of currentDefine.children) {
      const li = document.createElement("li");

      const a = document.createElement("a");
      a.href = `#${node.id}`;
      a.textContent = node.title;

      li.appendChild(a);

      if (node.children) {
        li.appendChild(createList(document, node));
      }

      ul.appendChild(li);
    }
  }

  return ul;
}
