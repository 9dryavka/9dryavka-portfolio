import ScreenRenderer from "./renderers/screen";
import InputController, { INPUT_STATE_TYPE } from "./controllers/input";
import PageController from "./controllers/page";
import { TransitController } from "./controllers/transit";
import PageControllerFactory from "./factory/page-controller";

const TRANSIT_BORDER = 0.5;

export class CanvasController {
  /**
   * ページコントローラー
   * @type {PageController}
   */
  #currentPageController;
  /**
   * スクリーンレンダラー
   * @type {ScreenRenderer}
   */
  #screenRenderer;
  /**
   * 入力コントローラー
   * @type {InputController}
   */
  #inputController;

  /**
   * ページコントローラーファクトリー
   */
  #pageControllerFactory;

  /**
   * コンテンツ設定処理
   */
  #setContent;

  /**
   * コンストラクタ
   * @param { Object } params
   * @param { string } params.selector
   * @param { setContent} params.setContent
   */
  constructor({ selector, setContent }) {
    const $screenCanvas = $(selector);
    if (
      !($screenCanvas.length && $screenCanvas[0] instanceof HTMLCanvasElement)
    ) {
      throw new Error(
        `不正なセレクターが指定されました。selector=[${selector}] selectorType=[${$screenCanvas[0]?.tagName ?? "undefined"}]`,
      );
    }
    if (typeof setContent !== "function") {
      throw new Error(`不正なコンテンツ更新用関数が指定されました。`);
    }

    // スクリーンレンダラー初期化
    this.#screenRenderer = new ScreenRenderer({
      $screenCanvas,
    });
    // 入力コントローラー初期化
    this.#inputController = new InputController({
      setCursor: (cursor) => {
        this.#screenRenderer.setCursor(cursor);
      },
    });
    this.#setContent = setContent;
  }

  async load() {
    // ページコントローラー作成
    this.#pageControllerFactory = new PageControllerFactory({
      setContent: ($content) => {
        this.#setContent($content);
      },
      getInputState: () => {
        return this.#inputController.getInputState();
      },
      transitPage: ({ toPageController }) => {
        this.#transitPage({ toPageController });
      },
      convertMouseCoordinates: (event) => {
        return this.#screenRenderer.convertMouseCoordinates(event);
      },
    });

    // ページコントローラー設定
    this.#setCurrentPageController(
      await this.#pageControllerFactory.create("content-list"),
    );

    // 各種マウスイベントをレンダラーに追加
    this.#screenRenderer.on("mousemove", (event) => {
      this.#mouseMoveHandler(event);
    });
    this.#screenRenderer.on("mousedown", (event) => {
      this.#mouseDownHandler(event);
    });
    this.#screenRenderer.on("mouseup", (event) => {
      this.#mouseUpHandler(event);
    });

    this.#screenRenderer.start();
  }

  /**
   * リサイズ処理
   * ※画面情報の更新が必要な場合、ここに集約して一括で更新すること
   */
  resize() {
    // 各種クラスに環境設定を反映
    this.#screenRenderer.resize();
    this.#currentPageController.resize();
  }

  /**
   * ページコントローラー付け替え処理
   * @param {PageController} pageController
   */
  #setCurrentPageController(pageController) {
    this.#currentPageController = pageController;
    this.#screenRenderer.setRenderPageController(pageController);
  }

  /**
   * mousemoveイベントハンドラー
   * @param {MouseEvent} event
   */
  #mouseMoveHandler(event) {
    const inputState = this.#inputController.getInputState();
    // 入力コントローラーが無効状態の場合、以降の処理は不要のためスキップ
    if (inputState.type === INPUT_STATE_TYPE.DISABLED) {
      return;
    }

    // マウス座標をキャンバス上の相対座標に変換する
    const mouseCoordinates =
      this.#screenRenderer.convertMouseCoordinates(event);
    // オブジェクトのヒット判定
    const hitResult =
      this.#currentPageController.checkHitObject(mouseCoordinates);

    // マウスが対象オブジェクトに当たっていない場合、以降の処理はスキップ
    if (!hitResult.isHit) {
      if (inputState.type === INPUT_STATE_TYPE.HOVER) {
        // 入力コントローラーが"HOVER"状態の場合、HOVER状態を解除
        this.#inputController.updateStateToDefault();
      }
      return;
    }

    // 入力状態ごとに処理を実施
    switch (inputState.type) {
      case INPUT_STATE_TYPE.DEFAULT:
      case INPUT_STATE_TYPE.HOVER:
        // コントローラーがマウス操作状態（"GRABBING"あるいは"MOUSE_DOWN"状態）でない場合、コントローラーとマウスカーソルをホバー状態に更新 ※操作状態の場合は上書きになるので更新しない
        this.#inputController.updateStateToHover({
          targetLayerIndex: hitResult.layerIndex,
          targetObjectIndex: hitResult.objectIndex,
        });
        break;
      case INPUT_STATE_TYPE.MOUSE_DOWN:
        // MOUSE_DOWN状態の場合、移動判定を実施
        const dx = mouseCoordinates.x - inputState.downCoordinates.x;
        const dy = mouseCoordinates.y - inputState.downCoordinates.y;

        const distance = Math.sqrt(dx * dx + dy * dy);
        this.#currentPageController.setCoordinates({
          targetLayerIndex: inputState.targetLayerIndex,
          targetObjectIndex: inputState.targetObjectIndex,
          coordinates: mouseCoordinates,
        });
        if (distance > 5) {
          // 移動距離が一定以上の場合、コントローラーを"GRABBING"状態に更新
          this.#inputController.updateStateToGrabbing({
            targetLayerIndex: inputState.targetLayerIndex,
            targetObjectIndex: inputState.targetObjectIndex,
          });
        }
        break;
      case "GRABBING":
        // "GRABBING"状態の場合、対象オブジェクトの位置を更新
        this.#currentPageController.setCoordinates({
          targetLayerIndex: inputState.targetLayerIndex,
          targetObjectIndex: inputState.targetObjectIndex,
          coordinates: mouseCoordinates,
        });
        break;
      default:
        break;
    }
  }

  /**
   * mouseupイベントハンドラー
   * @param {MouseEvent} event
   * @returns
   */
  #mouseUpHandler(event) {
    const inputState = this.#inputController.getInputState();
    // 入力コントローラーが無効状態の場合、以降の処理はスキップ
    if (inputState.type === INPUT_STATE_TYPE.DISABLED) {
      return;
    }

    // マウス座標をキャンバス上の相対座標に変換
    const mouseCoordinates =
      this.#screenRenderer.convertMouseCoordinates(event);

    // オブジェクトのヒット判定
    const hitResult =
      this.#currentPageController.checkHitObject(mouseCoordinates);

    if (inputState.type === INPUT_STATE_TYPE.MOUSE_DOWN) {
      // いずれかのオブジェクトにヒットしつつ、入力状態が"MOUSE_DOWN"の場合はクリックアクションを発火させる
      this.#currentPageController.onClickAction({
        targetLayerIndex: hitResult.layerIndex,
        targetObjectIndex: hitResult.objectIndex,
      });
      this.#inputController.updateStateToDefault();
    } else {
      // それ以外の場合(入力状態が"GRABBING"など)、inputStateをデフォルト状態に更新する
      this.#inputController.updateStateToDefault();
    }
  }

  /**
   * mousedownイベントハンドラー
   * @param {MouseEvent} event
   */
  #mouseDownHandler(event) {
    const inputState = this.#inputController.getInputState();
    // 入力コントローラーが無効状態の場合、以降の処理はスキップ
    if (inputState.type === INPUT_STATE_TYPE.DISABLED) {
      return;
    }

    const mouseCoordinates =
      this.#screenRenderer.convertMouseCoordinates(event);

    // オブジェクトのヒット判定
    const hitResult =
      this.#currentPageController.checkHitObject(mouseCoordinates);

    // 入力コントローラーをマウス押下状態に更新
    this.#inputController.updateStateToMouseDown({
      targetLayerIndex: hitResult.layerIndex,
      targetObjectIndex: hitResult.objectIndex,
      mouseCoordinates,
    });
  }

  /**
   * ページ切り替え
   * @param {Object} params
   * @param {PageController} params.toPageController
   * @param {number} params.transitionThreshold
   * @returns {void}
   */
  #transitPage({ toPageController, transitionThreshold = 0.5 }) {
    if (!toPageController) return; // 切り替え対象ページコントローラーがなければスキップ
    const fromPageController = this.#currentPageController;
    // 切り替え用の仮想コントローラーを作成して設定
    const transitPageController = new TransitController({
      title: `${fromPageController.getTitle()} → ${toPageController.getTitle()}`,
      fromPageController: fromPageController,
      toPageController,
      transitionThreshold,
      transitCompleteAction: () => {
        // ページコントローラー付け替え & 入力コントローラーをデフォルト状態に更新
        this.#setCurrentPageController(toPageController);
        this.#inputController.updateStateToDefault();
      },
    });
    this.#setCurrentPageController(transitPageController);
    // 切り替え中は入力コントローラーを無効化
    this.#inputController.updateStateToDisabled();
  }
}
