import * as THREE from "three";
import LayerController from "./layer";
import { INPUT_STATE_TYPE } from "./input";
import { getOrderedLayerIndexList, MAX_SCALE, DEFAULT_SCALE } from "../utils";

export default class PageController {
  /**
   * @type {string}
   */
  #title;

  /**
   * @type {LayerController[]}
   */
  #layerControllers;

  /**
   * @type {() => InputState}
   */
  #getInputState;

  /**
   * @type {(targetLayerIndex: number, targetObjectIndex: number)=>void}
   */
  async onClickAction() {}

  /**
   * コンストラクタ
   * @param {Object} params
   * @param {string} params.title
   * @param {LayerController[]} params.layerControllers
   * @param {() => InputState} params.getInputState
   * @param {(targetLayerIndex: number, targetObjectIndex: number)=>Promise<void>} params.onClickAction
   */
  constructor({ title, layerControllers, getInputState, onClickAction }) {
    if (
      typeof getInputState !== "function" ||
      typeof onClickAction !== "function"
    ) {
      throw new Error(
        `PageCongrollerコンストラクタに不正なパラメータが指定されました。getInputState=[${typeof getInputState}], onClickAction=[${typeof onClickAction}]`,
      );
    }

    this.#title = title;
    this.#layerControllers = layerControllers;
    this.#getInputState = getInputState;
    this.onClickAction = onClickAction;
  }

  /**
   * 更新処理
   */
  update() {
    const inputState = this.#getInputState();
    for (let i = 0; i < this.#layerControllers.length; i++) {
      this.#layerControllers[i].update({
        focusObjectIndex:
          (INPUT_STATE_TYPE.HOVER === inputState.type ||
            INPUT_STATE_TYPE.GRABBING === inputState.type ||
            INPUT_STATE_TYPE.MOUSE_DOWN === inputState.type) &&
          inputState.targetLayerIndex === i
            ? inputState.targetObjectIndex
            : null,
        controllObjectIndex:
          (INPUT_STATE_TYPE.GRABBING === inputState.type ||
            INPUT_STATE_TYPE.MOUSE_DOWN === inputState.type) &&
          inputState.targetLayerIndex === i
            ? inputState.targetObjectIndex
            : null,
        scale:
          (INPUT_STATE_TYPE.HOVER === inputState.type ||
            INPUT_STATE_TYPE.GRABBING === inputState.type) &&
          inputState.targetLayerIndex === i
            ? MAX_SCALE
            : DEFAULT_SCALE,
      });
    }
  }

  /**
   * 退場処理
   * @param {Object} params
   * @param {number} params.progress
   * @param {number} params.deltaTime
   */
  updateDisplayOut({ progress, deltaTime }) {
    for (let i = 0; i < this.#layerControllers.length; i++) {
      this.#layerControllers[i].updateDisplayOut({ progress, deltaTime });
    }
  }
  /**
   * 入場処理
   * @param {Object} params
   * @param {number} params.progress
   * @param {number} params.deltaTime
   */
  updateDisplayIn({ progress, deltaTime }) {
    for (let i = 0; i < this.#layerControllers.length; i++) {
      this.#layerControllers[i].updateDisplayIn({ progress, deltaTime });
    }
  }

  /**
   * 対象ページコントローラーが保持する全Scenesを順番に取得する
   * @returns {Generator<THREE.Scene, void, void>}
   */
  *getScenes() {
    const orderedLayerIndexList = getOrderedLayerIndexList({
      inputState: this.#getInputState(),
      layerControllerCount: this.#layerControllers.length,
    });
    for (let i = orderedLayerIndexList.length - 1; i >= 0; i--) {
      const targetLayerIndex = orderedLayerIndexList[i];
      yield this.#layerControllers[targetLayerIndex].getScene();
    }
  }

  /**
   * ページコントローラーが管理するレイヤーコントローラー配列を取得する
   * @returns {LayerController[]}
   */
  getLayerControllers() {
    return this.#layerControllers;
  }

  /**
   * オブジェクトヒットチェック
   * @param {{x:number, y:number}} mouseCoordinates
   * @returns {{isHit: boolean, layerIndex: number, objectIndex: number}}
   */
  checkHitObject(mouseCoordinates) {
    // レイヤーインデックスを処理優先順に並び替えて処理
    const layerIndexOrder = getOrderedLayerIndexList({
      inputState: this.#getInputState(),
      layerControllerCount: this.#layerControllers.length,
    });

    for (const targetLayerIndex of layerIndexOrder) {
      const targetLayerControler = this.#layerControllers[targetLayerIndex];
      const hitResult = targetLayerControler.checkHitObject(mouseCoordinates);
      if (hitResult.isHit) {
        return { ...hitResult, layerIndex: targetLayerIndex };
      }
    }
    return { isHit: false, objectIndex: null, layerIndex: null };
  }

  /**
   * スケール処理
   * @param {Object} params
   * @param {number} params.scale
   * @param {number|null} params.targetLayerIndex
   * @param {number|null} params.targetObjectIndex
   */
  setScale({ scale, targetLayerIndex = null, targetObjectIndex = null }) {
    const layerControllers = this.#layerControllers;
    if (targetLayerIndex === null) {
      this.#layerControllers.forEach((targetLayerController) => {
        targetLayerController.setScale({ targetObjectIndex, scale });
      });
    } else {
      this.#layerControllers[targetLayerIndex].setScale({
        targetObjectIndex,
        scale,
      });
    }
  }

  /**
   * 座標更新処理
   * @param {Object} params
   * @param {{x:number, y:number}} params.coordinates
   * @param {number} params.targetLayerIndex
   * @param {number} params.targetObjectIndex
   */
  setCoordinates({
    coordinates,
    targetLayerIndex = null,
    targetObjectIndex = null,
  }) {
    if (targetLayerIndex === null || targetObjectIndex === null) {
      // 更新対象が指定されていない場合は不正のため何もしない
      console.error(
        `座標更新には対象オブジェクトの指定が必須です。targetLayerIndex=[${targetLayerIndex}], targetObjectIndex=[${targetObjectIndex}].`,
      );
      return;
    }
    this.#layerControllers[targetLayerIndex].setCoordinates({
      targetObjectIndex,
      coordinates,
    });
  }

  /**
   * タイトル取得処理
   * @returns {string}
   */
  getTitle() {
    return this.#title;
  }

  /** リサイズ */
  resize() {
    this.#layerControllers.forEach((layerController) => {
      layerController.resize();
    });
  }
}
