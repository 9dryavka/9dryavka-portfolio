import { convert } from "three/tsl";
import { toCamelCase } from "../common";
import { convertSkillValue } from "./skill-common";

/**
 * 定義JSONをもとに、スキル詳細用のaside要素を作成する
 * @param { Document } document
 * @param { Object } define
 * @returns { HTMLElement }
 */
export function generateSkillDetail(document, define) {
  const aside = document.createElement("aside");

  define.list.forEach((targetSkillData) => {
    const article = document.createElement("article");
    const detailId = `${targetSkillData.id}-detail`;
    article.id = detailId;

    // 1行目
    const header = document.createElement("header");
    header.className = "header";

    // 2行目
    const meta = document.createElement("div");
    meta.className = "meta";

    // 詳細
    const content = document.createElement("div");
    content.className = "content";

    // 子要素
    const children = document.createElement("div");
    children.className = "children";

    const appendElement = (parent, key) => {
      const value = targetSkillData[key];

      // 項目が存在しない場合は何もしない
      if (value === undefined || value === null) return;

      const element = convertSkillValue({
        document,
        key,
        value,
      });

      if (!element) return;

      const wrapper = document.createElement("div");
      wrapper.id = `${detailId}-${toCamelCase(key)}`;
      wrapper.appendChild(element);

      parent.appendChild(wrapper);
    };

    // ヘッダー
    appendElement(header, "category");
    appendElement(header, "title");
    appendElement(header, "link");
    appendElement(header, "level");

    // 経験情報
    appendElement(meta, "years");
    appendElement(meta, "workExperience");
    appendElement(meta, "date");

    // 詳細情報
    appendElement(content, "description");
    appendElement(content, "tag");

    // 子要素
    appendElement(children, "children");

    article.append(header, meta, content, children);

    aside.appendChild(article);
  });

  return aside;
}
