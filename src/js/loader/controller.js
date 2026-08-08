import { ASSETS_DEFINES } from "./assets";
import "../../scss/loader.scss";
import { LoadingAnimation } from "./animation";

export class LoadingController {
  #loadingAnimation;

  constructor() {
    // ローディング用にメイン要素を一旦隠す
    $("main").attr("hidden");
    // ローディング画面をbodyに追加
    const $loading = $("<div>", { id: "loading" })
      .append(
        $("<div>", { id: "loading-content" })
          .append(
            $("<div>", {
              class:
                "starry-sky starry-sky--bright flex items-center justify-center",
            }).append(
              $("<div>").append(
                $("<div>", {
                  id: "loading-title",
                }),
              ),
            ),
          )
          .append($("<div>", { class: "starry-sky starry-sky--normal-bright" }))
          .append($("<div>", { class: "starry-sky starry-sky--normal" }))
          .append($("<div>", { class: "starry-sky starry-sky--dim" })),
      )
      .append(
        $("<div>", {
          id: "rocket",
        }).append("<img>", {
          src: ASSETS_DEFINES.assets.rocket.default,
          alt: "ロケット_デフォルト",
        }),
      );
    $("body").append($loading);
    // ローディング中はユーザー操作無効化
    $loading.on("wheel", (e) => e.preventDefault(), {
      passive: false,
    });
    $loading.on("touchmove", (e) => e.preventDefault(), {
      passive: false,
    });
    // 初期位置を一番下に設定
    $loading.scrollTop($("#loading")[0].scrollHeight);
    // ローディング完了後の後処理を設定
    this.#loadingAnimation = new LoadingAnimation(() => {
      $loading.fadeOut(500, function () {
        $(this).remove();
        $("main").removeAttr("hidden");
      });
    });
  }

  /**
   * ローディング実行処理
   * @param {async () => void} initializePage
   */
  async executeLoading(initializePage) {
    // ローディングアニメーションを初期化&開始
    await this.#loadingAnimation.init();
    this.#loadingAnimation.startLaunchSequence();
    // ページローディング開始
    await initializePage();
  }
}
