import "../../../scss/common/table.scss";
import { ModalController } from "../modal/controller";

/**
 * テーブルに対して、マウスイベントを追加数処理
 * @param { ModalController } detailModalController
 */
export function addTableEventHandlers(detailModalController) {
  $("#content-source article").each((_, targetArticle) => {
    const $table = $(targetArticle).find("table");

    if ($table.length === 0) {
      return;
    }

    // ヘッダーの各カラムに対してソート＆フィルターボタンを追加
    $table.find("thead tr th").each((columnIndex, th) => {
      $(th).on("click", (event) => {
        const $currentTable = $(event.currentTarget).closest("table");
        const tbody = $currentTable.find("tbody");
        const rows = tbody.children("tr").get();
        switch ($(event.currentTarget).data("action")) {
          case "sort":
            const order = $(event.currentTarget).data("order");
            const sortType = $(event.currentTarget).data("sortType");
            rows.sort((a, b) => {
              const aCell = $(a).children().eq(columnIndex);
              const bCell = $(b).children().eq(columnIndex);
              const aValue = aCell.data("sortKey");
              const bValue = bCell.data("sortKey");
              switch (sortType) {
                case "date": {
                  const result =
                    new Date(aValue).getTime() - new Date(bValue).getTime();
                  return order === "asc" ? result : -result;
                }
                case "number": {
                  return order === "asc"
                    ? Number(aValue) - Number(bValue)
                    : Number(bValue) - Number(aValue);
                }
                case "string":
                default: {
                  return order === "asc"
                    ? String(aValue).localeCompare(String(bValue), "ja")
                    : String(bValue).localeCompare(String(aValue), "ja");
                }
              }
            });
            $(event.currentTarget).data(
              "order",
              order === "asc" ? "desc" : "asc",
            );
            // ソート対象を切り替え
            $currentTable.find("th").each((_, targetTh) => {
              $(targetTh).removeClass("order-desc order-asc");
            });
            $(event.currentTarget).addClass(
              order === "asc" ? "order-asc" : "order-desc",
            );
            tbody.empty().append(rows);
            break;
          case "filter":
            detailModalController.setContent(
              createFilterSelectContent({
                $targetTh: $(event.currentTarget),
              }),
            );
            detailModalController.open();
            break;
          default:
            break;
        }
      });
    });

    // ボディに詳細表示機能を追加
    $table.find("tbody").on("click", "tr", (event) => {
      const $detailContent = $(
        `#${$(event.currentTarget).data("detailId")}-detail`,
      );

      if ($detailContent.length === 0) {
        // 詳細コンテンツがなければスキップ
        return;
      }
      detailModalController.setContent($detailContent);
      detailModalController.open();
    });
  });
}

// カテゴリ名→ID読み替え用
const category2Id = {
  AI: "ai",
  プログラミング言語: "programming-language",
  "マークアップ/スタイリング": "markup-styling",
  "ライブラリ/フレームワーク": "library-framework",
  インフラ: "infra",
  データベース: "database",
  ツール: "tool",
};

/**
 * フィルター選択モーダルコンテンツ作成処理
 * @param { Object } params
 * @param { JQuery } params.$targetTh
 */
function createFilterSelectContent({ $targetTh }) {
  const container = $("<div>");
  switch ($targetTh.data("colKey")) {
    case "tag":
      container
        .append(
          $("<div>", { class: "detail-modal-title" }).text("タグ選択モーダル"),
        )
        .append(
          $("<div>", { id: "filter-type-selector" })
            .append($("<p>").text("検索種別："))
            .append(
              $("<label>")
                .append(
                  $("<input>", {
                    type: "radio",
                    name: `filter-type`,
                    checked: $targetTh.data("filterType") === "OR",
                  }).on("change", () => {
                    $targetTh.data("filterType", "OR");
                    applyFilterToRows($targetTh);
                  }),
                )
                .append(" OR検索"),
            )
            .append(
              $("<label>")
                .append(
                  $("<input>", {
                    type: "radio",
                    name: `filter-type`,
                    checked: $targetTh.data("filterType") === "AND",
                  }).on("change", () => {
                    $targetTh.data("filterType", "AND");
                    applyFilterToRows($targetTh);
                  }),
                )
                .append(" AND検索"),
            ),
        )
        .append(
          $("<ul>").append(
            $targetTh.data("values").map((targetValue) =>
              $("<li>", {
                class: `tag-label ${$targetTh.data("selected").includes(targetValue) ? "selected" : ""}`,
              }).append(
                $("<button>")
                  .text(targetValue)
                  .on("click", (event) => {
                    const selectedList = $targetTh.data("selected");
                    if (selectedList.includes(targetValue)) {
                      $targetTh.data(
                        "selected",
                        $targetTh
                          .data("selected")
                          .filter((value) => value !== targetValue),
                      );
                      $targetTh.removeClass("selected");
                      $(event.currentTarget).parent().removeClass("selected");
                      applyFilterToRows($targetTh);
                    } else {
                      $targetTh.addClass("selected");
                      $(event.currentTarget).parent().addClass("selected");
                      selectedList.push(targetValue);
                      $targetTh.data("selected", selectedList);
                      applyFilterToRows($targetTh);
                    }
                  }),
              ),
            ),
          ),
        );
      break;
    case "category":
      container
        .append(
          $("<div>", { class: "detail-modal-title" }).text(
            "カテゴリ選択モーダル",
          ),
        )
        .append(
          $("<ul>").append(
            $targetTh.data("values").map((targetValue) =>
              $("<li>", {
                class: `category-label ${`category-type-${category2Id[targetValue]}`} ${$targetTh.data("selected").includes(targetValue) ? "selected" : ""}`,
              }).append(
                $("<button>")
                  .text(targetValue)
                  .on("click", (event) => {
                    const selectedList = $targetTh.data("selected");
                    if (selectedList.includes(targetValue)) {
                      $targetTh.data(
                        "selected",
                        $targetTh
                          .data("selected")
                          .filter((value) => value !== targetValue),
                      );
                      $targetTh.removeClass("selected");
                      $(event.currentTarget).parent().removeClass("selected");
                      applyFilterToRows($targetTh);
                    } else {
                      $targetTh.addClass("selected");
                      $(event.currentTarget).parent().addClass("selected");
                      selectedList.push(targetValue);
                      $targetTh.data("selected", selectedList);
                      applyFilterToRows($targetTh);
                    }
                  }),
              ),
            ),
          ),
        );
      break;
  }

  return container;
}

/**
 * テーブルの全行に対してフィルター設定を適用する処理
 * @param {JQuery} $targetTh
 */
function applyFilterToRows($targetTh) {
  const selected = $targetTh.data("selected");
  const filterType = $targetTh.data("filterType");
  const colKey = $targetTh.data("colKey");

  $targetTh
    .closest("table")
    .find("tbody tr")
    .each((_, targetRow) => {
      switch ($targetTh.data("colKey")) {
        case "tag":
          const $tagItems = $(targetRow).find(
            `[data-col-key="${colKey}"] ul li`,
          );

          const tags = $tagItems.map((_, li) => $(li).text()).get();
          const matched =
            filterType === "OR"
              ? selected.some((tag) => tags.includes(tag))
              : selected.every((tag) => tags.includes(tag));

          // OR検索の場合、タグのselected状態を更新
          if (filterType === "OR") {
            $tagItems.each((_, li) => {
              const $li = $(li);
              const tag = $li.text();

              $li.toggleClass("selected", selected.includes(tag));
            });
          }

          $(targetRow).toggleClass("hidden", !matched);
          break;
        case "category":
          const category = $(targetRow)
            .find(`[data-col-key="${colKey}"] div`)
            .text();
          $(targetRow).toggleClass("hidden", !selected.includes(category));
          break;
      }
    });

  if (selected.length !== $targetTh.data("values").length) {
    $targetTh.addClass("active");
  } else {
    $targetTh.removeClass("active");
  }
}
