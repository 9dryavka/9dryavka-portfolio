import {
  CONTENT_DEFINES,
  CONTENT_TYPE,
  GENERATOR_TYPE,
} from "../define/contents";
import fs from "node:fs";
import path from "node:path";
import { generateSkillTable } from "../generater/skill-main";
import { generateSkillDetail } from "../generater/skill-detail";

const RESOURCE_DIR = path.resolve("html-plugin/define/resources");

/**
 * コンテンツソース作成処理
 * @param { Document } document
 */
export function buildContentSource(document) {
  const container = document.querySelector("#content-source");

  const resourceMap = loadResources();

  const contentSource = createContent({
    document,
    currentDefine: CONTENT_DEFINES,
    resourceMap,
  });
  container.appendChild(contentSource);
}

/**
 * リソース読み込み処理
 * @returns {Map<string, string>}
 */
function loadResources() {
  const map = new Map();

  walk(RESOURCE_DIR);

  return map;

  /**
   * 対象ディレクトリ読み込みの再帰処理
   * @param { string } dir
   */
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      const relativePath = path
        .relative(RESOURCE_DIR, fullPath)
        .replace(/\\/g, "/");

      map.set(relativePath, fs.readFileSync(fullPath, "utf-8"));
    }
  }
}

/**
 * コンテンツ作成処理
 * @param { Object } params
 * @param { Document } params.document
 * @param { Object } params.currentDefine
 * @param { Map<string, string> } params.resourceMap
 * @param { number } params.depth
 * @returns { HTMLElement }
 */
function createContent({ document, currentDefine, resourceMap, depth = 2 }) {
  const section = document.createElement("section");
  section.id = currentDefine.id;
  const header = document.createElement("header");
  const heading = document.createElement(`h${depth}`);
  heading.textContent = currentDefine.title;
  header.appendChild(heading);
  if (currentDefine?.titleLink) {
    const linkContainer = document.createElement("div");
    linkContainer.className = "links-container";
    currentDefine.titleLink.forEach((targetLink) => {
      const linkIcon = document.createElement("img");
      linkIcon.src = targetLink.icon.src;
      linkIcon.alt = targetLink.icon.alt;
      linkIcon.width = targetLink.icon.width;
      linkIcon.height = targetLink.icon.height;
      const linkAnchor = document.createElement("a");
      linkAnchor.href = targetLink.url;
      linkAnchor.target = targetLink.target;
      linkAnchor.appendChild(linkIcon);
      linkContainer.appendChild(linkAnchor);
    });
    header.appendChild(linkContainer);
  }
  section.appendChild(header);

  if (currentDefine.children) {
    const children = document.createElement("div");
    children.id = `${currentDefine.id}-children`;
    for (const node of currentDefine.children) {
      const child = createContent({
        document,
        currentDefine: node,
        resourceMap,
        depth: depth + 1,
      });
      if (child === null) {
        continue;
      }
      children.appendChild(child);
    }
    if (children.childElementCount === 0) {
      return null;
    }
    section.appendChild(children);
  } else {
    const content = document.createElement("article");
    content.id = `${currentDefine.id}-content`;
    switch (currentDefine.content.type) {
      case CONTENT_TYPE.GENERATE_HTML:
        // リソースのJSONファイル定義をもとに、実際のHTMLを作成する
        // コンテナ
        const resource = JSON.parse(
          resourceMap.get(currentDefine.content.resource),
        );
        // テーブル
        const table = generateSkillTable({
          document,
          define: resource,
          prefix: currentDefine.id,
        });
        content.appendChild(table);
        // 更新日時
        const updateAt = document.createElement("time");
        updateAt.className = "updated-at";
        updateAt.dateTime = resource.updatedAt;
        const [year, month, date] = resource.updatedAt.split("-");
        updateAt.textContent = `${year}年${month}月${date}更新`;
        content.appendChild(updateAt);
        const detail = generateSkillDetail(
          document,
          resource,
          currentDefine.id,
        );
        detail.id = `${currentDefine.id}-detail`;
        content.appendChild(detail);
        break;
      case CONTENT_TYPE.HTML:
        // リソースに定義したHTMLファイルをindex.htmlにそのまま注入する
        content.insertAdjacentHTML(
          "beforeend",
          resourceMap.get(currentDefine.content.resource),
        );
        break;
      case CONTENT_TYPE.EXTERNAL_PAGE:
      // 外部ページはコンテンツ化不要(link側で外部リンクにする)
      default:
        return null;
    }
    section.appendChild(content);
  }

  return section;
}
