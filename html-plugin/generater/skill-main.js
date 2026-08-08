import { setDataAttributes, toCamelCase } from "../common";
import { convertSkillValue } from "./skill-common";

/**
 * 定義JSONを元にスキルテーブル用のHTMLを作成する
 * @param { Object } params
 * @param { Document } params.document
 * @param { Object } params.define
 * @param { string } params.prefix
 * @returns { HTMLTableElement }
 */
export function generateSkillTable({ document, define, prefix = "" }) {
  const table = document.createElement("table");
  table.id = define.id;

  // キャプション
  const caption = document.createElement("caption");
  caption.textContent = define.caption;
  table.appendChild(caption);

  // ヘッダー
  const thead = document.createElement("thead");
  const theadTr = document.createElement("tr");
  Object.entries(define.headerColumns).forEach(([key, value]) => {
    const th = document.createElement("th");
    th.textContent = define.fieldName[key];
    th.setAttribute("scope", "col");
    setDataAttributes({
      element: th,
      data: {
        ...value,
        colKey: key,
      },
    });
    theadTr.appendChild(th);
  });
  thead.appendChild(theadTr);
  table.appendChild(thead);
  // ボディ
  const tbody = document.createElement("tbody");
  define.list.forEach((rowData) => {
    const tbodyTr = document.createElement("tr");
    let firstColumn = true;
    setDataAttributes({ element: tbodyTr, data: { detailId: rowData.id } });
    Object.entries(define.headerColumns).forEach(
      ([targetColumn, targetDefine], index) => {
        const cell = document.createElement(firstColumn ? "th" : "td");
        const value = rowData[targetColumn];

        if (firstColumn) {
          cell.setAttribute("scope", "row");
          firstColumn = false;
        }

        cell.appendChild(
          convertSkillValue({
            document,
            key: targetColumn,
            value,
          }),
        );
        setDataAttributes({
          element: cell,
          data: {
            colKey: targetColumn,
          },
        });

        if (targetDefine.action === "sort") {
          setDataAttributes({
            element: cell,
            data: {
              sortKey: value,
            },
          });
        }

        tbodyTr.appendChild(cell);
      },
    );
    tbody.appendChild(tbodyTr);
  });
  table.appendChild(tbody);

  return table;
}
