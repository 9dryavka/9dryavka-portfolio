/**
 * dataset設定処理
 * ※オブジェクトの場合はJSON文字列。それ以外の場合はStringで設定
 * @param { Object } params
 * @param { HTMLElement } params.element
 * @param { object } params.data
 * @param { string } params.prefix
 */
export function setDataAttributes({ element, data, prefix = "" }) {
  for (const [key, value] of Object.entries(data)) {
    const attribute = prefix ? `${prefix}-${key}` : key;
    if (!value) {
      continue;
    } else if (typeof value === "object") {
      element.dataset[toCamelCase(attribute)] = JSON.stringify(value);
    } else {
      element.dataset[toCamelCase(attribute)] = String(value);
    }
  }
}

/**
 * キャメルケース変換処理
 * @param { string } text
 * @returns { string }
 */
export function toCamelCase(text) {
  return text.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
