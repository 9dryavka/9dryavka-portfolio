export class SliderController {
  constructor($slider) {
    const pages = $slider.find(".page");
    const currentPage = $slider.data("currentPage");
    pages.addClass("hidden");
    $(pages[currentPage - 1]).removeClass("hidden");

    this.#addEventHandlers($slider);
  }

  /**
   * イベントハンドラー追加処理
   * @param {JQuery} $slider
   */
  #addEventHandlers($slider) {
    if ($slider.find(".page").length <= 1) {
      return;
    }

    const $parent = $slider.parent();

    const $pageController = $("<div>", { class: "slider-page-controller" });

    const $prev = $("<button>", {
      class: "prev",
      text: "前へ",
    });
    const $pageNumber = $("<span>", {
      class: "page-number",
    });
    const $next = $("<button>", {
      class: "next",
      text: "次へ",
    });

    $prev.on("click", (event) => {
      const $targetSlider = $(event.currentTarget)
        .closest("article")
        .find(".slider");

      const currentPage = $targetSlider.data("currentPage");

      if (currentPage > 1) {
        this.#changePage({
          $slider: $targetSlider,
          currentPage,
          nextPage: currentPage - 1,
        });
      }
    });

    $next.on("click", (event) => {
      const $targetSlider = $(event.currentTarget)
        .closest("article")
        .find(".slider");

      const currentPage = $targetSlider.data("currentPage");

      if (currentPage < $targetSlider.find(".page").length) {
        this.#changePage({
          $slider: $targetSlider,
          currentPage,
          nextPage: currentPage + 1,
        });
      }
    });

    $pageController.append($prev, $pageNumber, $next);
    $parent.append($pageController);

    // 初期状態を反映
    this.#updatePageNumber($slider);
    this.#updateButtonState($slider);
  }

  /**
   * ページ更新処理
   * @param {Object} params
   * @param {JQuery} params.$slider
   * @param {number} params.currentPage
   * @param {number} params.nextPage
   */
  #changePage({ $slider, currentPage, nextPage }) {
    $slider.data("currentPage", nextPage);

    const pages = $slider.find(".page");
    $(pages[currentPage - 1]).addClass("hidden");
    $(pages[nextPage - 1]).removeClass("hidden");

    this.#updatePageNumber($slider);
    this.#updateButtonState($slider);
  }

  #updatePageNumber($slider) {
    const currentPage = $slider.data("currentPage");
    const pageCount = $slider.find(".page").length;

    $slider
      .siblings(".slider-page-controller")
      .find(".page-number")
      .text(`${currentPage} / ${pageCount}`);
  }

  /**
   * ボタン状態更新処理
   * @param {JQuery} $slider
   */
  #updateButtonState($slider) {
    const currentPage = $slider.data("currentPage");
    const pageCount = $slider.find(".page").length;

    const $controller = $slider.siblings(".slider-page-controller");

    $controller.find(".prev").prop("disabled", currentPage === 1);
    $controller.find(".next").prop("disabled", currentPage === pageCount);
  }
}
