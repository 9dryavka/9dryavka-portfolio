import { setDataAttributes } from "../common";

const category2Id = {
  AI: "ai",
  プログラミング言語: "programming-language",
  "マークアップ/スタイリング": "markup-styling",
  "ライブラリ/フレームワーク": "library-framework",
  インフラ: "infra",
  データベース: "database",
  ツール: "tool",
};

const tagOrder = [
  "実務経験あり",
  "個人開発",
  "フロントエンド",
  "バックエンド",
  "得意",
  "忘れ気味",
  "デザイン系",
  "勉強中",
];

/**
 * スキル用の値を適切なHTML要素に変換する処理
 * ※デザイン的な部分はCSSに一任するため、セマンティックと値の正規化のみ対応
 *
 * @param { Object } params
 * @param { Document } params.document
 * @param { string } params.key
 * @param { string } params.value
 * @returns { HTMLElement | null }
 */
export function convertSkillValue({ document, key, value }) {
  // 値がない or キーがIDの場合はnullを返却
  if (!value || key === "id") return null;

  switch (key) {
    case "title":
    case "description":
      const p = document.createElement("p");
      p.textContent = value;
      p.className = key;
      return p;
    case "level":
      const meter = document.createElement("meter");
      meter.setAttribute("min", "1");
      meter.setAttribute("max", "5");
      meter.setAttribute("value", String(value));
      meter.textContent = "★".repeat(value) + "☆".repeat(5 - value);
      const star = document.createElement("span");
      star.className = "level-star";
      star.setAttribute("aria-hidden", "true");
      star.textContent = "★".repeat(value) + "☆".repeat(5 - value);
      const div = document.createElement("div");
      div.append(star, meter);
      return div;
    case "years":
    case "workExperience":
      const years = document.createElement("data");
      years.setAttribute("value", String(value));
      years.textContent = `約${value}年`;
      years.className = key;
      return years;
    case "link":
      const anchor = document.createElement("a");
      anchor.href = value;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.textContent = value;
      anchor.className = key;
      return anchor;
    case "tag":
      const container = document.createElement("ul");
      container.className = key;
      value
        .slice()
        .sort((a, b) => tagOrder.indexOf(a) - tagOrder.indexOf(b))
        .forEach((targetTag) => {
          const tag = document.createElement("li");
          tag.textContent = targetTag;
          tag.className = "tag-label selected";
          container.appendChild(tag);
        });

      return container;
    case "category":
      const category = document.createElement("div");
      category.className = `category-label category-type-${category2Id[value]} selected`;
      category.textContent = value;
      return category;
    case "children":
      const list = document.createElement("ul");
      list.className = key;
      value.forEach((targetService) => {
        const item = document.createElement("li");
        Object.entries(targetService).forEach(([childKey, childValue]) => {
          item.appendChild(
            convertSkillValue({
              document,
              key: childKey,
              value: childValue,
            }),
          );
        });
        list.appendChild(item);
      });
      return list;
    case "date":
      const date = document.createElement("time");
      date.className = key;
      const [year, month] = value.split("-");
      date.setAttribute("datetime", value);
      date.textContent = `${year}年${month}月`;
      return date;
    default:
      // 予期せぬキーが指定された場合は例外を投げる(ビルド時に転けるので、要修正対応)
      throw new Error(`不正なフィールド名が指定されました。key=[${key}]`);
  }
}
