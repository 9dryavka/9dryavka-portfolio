import * as THREE from "three";
import InputController from "../controllers/input";
import PageController from "../controllers/page";
import environment from "../../../common/environment";

export default class ScreenRenderer {
  /**
   * アニメーション実行状態
   * @type {boolean}
   */
  #isAnimate = false;
  /**
   * 更新に使用するページコントローラー
   * @type {PageController}
   */
  #renderPageController;
  /**
   * レンダラー本体
   * @type {THREE.WebGLRenderer}
   */
  #renderer;
  /**
   * カメラ
   * @type {THREE.OrthographicCamera}
   */
  #camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  /**
   * タイマー
   * @type {THREE.Timer}
   */
  #timer = new THREE.Timer();

  /**
   * コンストラクタ
   * @param {{
   *  $screenCanvas: JQuery
   * }} params
   */
  constructor({ $screenCanvas }) {
    // Three.js
    this.#renderer = (() => {
      const renderer = new THREE.WebGLRenderer({
        canvas: $screenCanvas.get(0),
        antialias: true,
        alpha: true,
      });
      renderer.setClearColor(0x000000, 0);
      renderer.autoClear = false;
      return renderer;
    })();
    this.resize();

    this.#animate();
  }

  /**
   * アニメーションを開始
   */
  start() {
    this.#isAnimate = true;
  }

  /**
   * アニメーションを停止
   */
  stop() {
    this.#isAnimate = false;
  }

  /**
   * 描画コントローラー付け替え
   * @param {PageController} renderPageController
   */
  setRenderPageController(renderPageController) {
    this.#renderPageController = renderPageController;
  }

  /**
   * イベント追加処理
   * @param {Object} params
   * @param {string} params.events
   * @param {(event:JQuery.Event)=>void} params.handler
   */
  on(events, handler) {
    $(this.#renderer.domElement).on(events, (event) => {
      handler(event);
    });
  }

  /**
   * マウス座標をキャンバス上の相対座標に変換する処理
   * @param {MouseEvent} event
   * @returns {{x: number, y: number}}
   */
  convertMouseCoordinates(event) {
    // マウス座標をキャンバス上の相対座標に修正する
    const rect = this.#renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = 100 - ((event.clientY - rect.top) / rect.height) * 100;

    return { x, y };
  }

  /**
   * レンダラーのリサイズ処理
   */
  resize() {
    // レンダラーの設定をリサイズ
    this.#renderer.setSize(environment.width, environment.height, false);
    this.#renderer.setPixelRatio(Math.min(environment.devicePixelRatio, 2));
  }

  /**
   * レンダラーのstyle.cursor更新処理
   * @param {string} cursor
   */
  setCursor(cursor) {
    this.#renderer.domElement.style.cursor = cursor;
  }

  /**
   * アニメート実処理
   */
  #animate = () => {
    requestAnimationFrame(this.#animate);

    if (!this.#isAnimate) return; // アニメーション停止状態であれば、以降の更新処理はスキップ

    // ページの状態更新
    this.#renderer.clear();
    this.#timer.update();
    this.#renderPageController.update(this.#timer.getDelta());

    // 最新状態をレンダラーに反映
    for (const targetScene of this.#renderPageController.getScenes()) {
      this.#renderer.render(targetScene, this.#camera);
    }
  };
}
