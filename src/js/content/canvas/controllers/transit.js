import InputController from "./input";
import PageController from "./page";

/**
 * 遷移コントローラー
 */
export class TransitController {
  /**
   * タイトル
   * @type {string}
   */
  #title;
  /**
   * 遷移の進捗度(0～1)
   * @type {number}
   */
  #progress = 0;
  /**
   * 遷移元ページコントローラー
   * @type {PageController}
   */
  #fromPageController;
  /**
   * 遷移先ページコントローラー
   * @type {PageController}
   */
  #toPageController;
  /**
   * ページコントローラー切り替えタイミング(0～1)
   * @type {number}
   */
  #transitionThreshold = 0.5;
  /**
   * 遷移時間
   * @type {number}
   */
  #durationTime = 1;

  /**
   * 遷移完了アニメーション
   * @type {()=>void}
   */
  #transitCompleteAction;

  /**
   * 開始時刻（フレーム更新用）
   */
  #startTime;

  /**
   * コンストラクタ
   * @param {Object} params
   * @param {string} parasm.title ページタイトル
   * @param {PageController} params.fromPageController 遷移元ページコントローラー
   * @param {PageController} params.toPageController 遷移先ページコントローラー
   * @param {number} params.transitionThreshold ページコントローラーを切り替える進捗の閾値（0～1）
   * @param {()=>void} params.transitCompleteAction
   */
  constructor({
    title,
    fromPageController,
    toPageController,
    transitionThreshold = 0.5,
    transitCompleteAction = () => {},
  }) {
    if (!fromPageController || !toPageController) {
      console.error(
        `TransitControllerの初期化に失敗しました。
        fromPageController=[${fromPageController}], toPageController=[${toPageController}].`,
      );
    }
    this.#title = title;
    this.#fromPageController = fromPageController;
    this.#toPageController = toPageController;
    this.#transitionThreshold = transitionThreshold;
    this.#transitCompleteAction = transitCompleteAction;
  }

  /**
   * フレーム更新
   * @param {number} deltaTime
   */
  update(deltaTime) {
    if (this.#progress === 0) {
      this.#startTime = performance.now();
    }
    // ページ情報を更新
    this.#fromPageController.updateDisplayOut({
      progress: this.#progress,
      deltaTime,
    });
    if (this.#progress > this.#transitionThreshold) {
      const localProgress =
        (this.#progress - this.#transitionThreshold) /
        (1 - this.#transitionThreshold);
      this.#toPageController.updateDisplayIn({
        progress: localProgress,
        deltaTime,
      });
    }

    // プログレスを更新
    this.#progress += deltaTime / this.#durationTime;
    // progressが1を超えた場合、コントローラーを切り替え
    if (this.#progress > 1) {
      console.log(`actual: ${(performance.now() - this.#startTime) / 1000}s`);
      this.#transitCompleteAction();
    }
  }

  /**
   * 対象ページコントローラーが保持する全Scenesを順番に取得する
   * @returns {Generator<THREE.Scene, void, void>}
   */
  *getScenes() {
    if (this.#progress < this.#transitionThreshold) {
      yield* this.#fromPageController.getScenes();
    } else {
      yield* this.#toPageController.getScenes();
    }
  }

  /**
   * オブジェクトヒットチェック
   * ※遷移中は明示的に無効化
   * @returns {{isHit: boolean, layerIndex: number, objectIndex: number}}
   */
  checkHitObject() {
    return { isHit: false, objectIndex: null, layerIndex: null };
  }

  /**
   * タイトル取得処理
   * @returns {string}
   */
  getTitle() {
    return this.#title;
  }
}
