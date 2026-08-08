export class ModalController {
  /**
   * @type {JQuery}
   */
  #$modal;

  /**
   * コンストラクタ
   * @param { Object } params
   * @param { string } params.selector
   */
  constructor({ selector }) {
    const $modal = $(selector);
    if (!$modal) {
      throw new Error(`不正なセレクターが指定されました。${selector}`);
    }
    this.#$modal = $modal;
    this.#$modal.on("click", (event) => {
      const dialog = this.#$modal[0];

      if (event.target === dialog) {
        this.close();
      }
    });
  }

  /**
   * モーダルを開く
   */
  open() {
    this.#$modal[0].showModal();
  }

  /**
   * モーダルを閉じる
   */
  close() {
    this.#$modal[0].close();
  }

  /**
   * モーダルコンテンツを設定する処理
   * @param { JQuery } $content
   */
  setContent($content) {
    const $clone = $content.clone(true, true);

    this.#$modal.empty().append($clone);
  }
}
