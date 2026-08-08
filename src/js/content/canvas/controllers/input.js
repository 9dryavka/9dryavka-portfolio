import PageController from "./page";

export default class InputController {
  /** @type {InputState} */
  #inputState;

  /** @type {(cursor:string)=>void} */
  #setCursor;

  /**
   * コンストラクタ
   * @param {Object} params
   * @param {(cursor:string)=>void} params.setCursor
   */
  constructor({ setCursor }) {
    this.#inputState = INPUT_STATE.DEFAULT();
    this.#setCursor = setCursor;
  }

  /**
   * inputStateを"DISABLED"に更新する
   */
  updateStateToDisabled() {
    this.#inputState = INPUT_STATE.DISABLED();
    this.#setCursor("default");
  }
  /**
   * inputStateを"DEFAULT"に更新する
   */
  updateStateToDefault() {
    this.#inputState = INPUT_STATE.DEFAULT();
    this.#setCursor("default");
  }
  /**
   *
   * inputStateを"HOVER"に更新する
   * @param {Object} params
   * @param {number} params.targetLayerIndex
   * @param {number} params.targetObjectIndex
   */
  updateStateToHover({ targetLayerIndex, targetObjectIndex }) {
    this.#inputState = INPUT_STATE.HOVER({
      targetLayerIndex,
      targetObjectIndex,
    });
    this.#setCursor("pointer");
  }
  /**
   * inputStateを"MOUSE_DOWN"に更新する
   * @param {Object} params
   * @param {number} params.targetLayerIndex
   * @param {number} params.targetObjectIndex
   * @param {{x:number, y:number}} params.mouseCoordinates
   */
  updateStateToMouseDown({
    targetLayerIndex,
    targetObjectIndex,
    mouseCoordinates,
  }) {
    this.#inputState = INPUT_STATE.MOUSE_DOWN({
      targetLayerIndex,
      targetObjectIndex,
      downCoordinates: mouseCoordinates,
    });
    this.#setCursor("pointer");
  }
  /**
   * inputStateを"GRABBING"に更新する
   * @param {Object} params
   * @param {number} params.targetLayerIndex
   * @param {number} params.targetObjectIndex
   */
  updateStateToGrabbing({ targetLayerIndex, targetObjectIndex }) {
    this.#inputState = INPUT_STATE.GRABBING({
      targetLayerIndex,
      targetObjectIndex,
    });
    this.#setCursor("grabbing");
  }

  /**
   * inputStateを取得する
   * @returns {InputState}
   *  */
  getInputState() {
    return this.#inputState;
  }
}

/**
 * inputState種別一覧
 * @readonly
 * @enum {string}
 */
export const INPUT_STATE_TYPE = {
  DISABLED: "DISABLED",
  DEFAULT: "DEFAULT",
  HOVER: "HOVER",
  MOUSE_DOWN: "MOUSE_DOWN",
  GRABBING: "GRABBING",
};

/**
 * @typedef {DisabledState|DefaultState|HoverState|GrabbingState|MouseDownState} InputState
 */
const INPUT_STATE = {
  /**
   * コントローラ無効化
   * @typedef {Object} DisabledState
   * @property {"DISABLED"} type
   */
  DISABLED: () => ({
    type: INPUT_STATE_TYPE.DISABLED,
  }),

  /**
   * デフォルト状態
   * @typedef {Object} DefaultState
   * @property {"DEFAULT"} type
   */
  DEFAULT: () => ({
    type: INPUT_STATE_TYPE.DEFAULT,
  }),

  /**
   * つかみ状態
   * @typedef {Object} GrabbingState
   * @property {"GRABBING"} type
   * @property {number|null} targetLayerIndex
   * @property {number|null} targetObjectIndex
   */
  GRABBING: ({ targetLayerIndex = null, targetObjectIndex = null }) => ({
    type: INPUT_STATE_TYPE.GRABBING,
    targetLayerIndex: targetLayerIndex,
    targetObjectIndex: targetObjectIndex,
  }),

  /**
   * ホバー状態
   * @typedef {Object} HoverState
   * @property {"HOVER"} type
   * @property {number|null} targetLayerIndex
   * @property {number|null} targetObjectIndex
   */
  HOVER: ({ targetLayerIndex = null, targetObjectIndex = null }) => ({
    type: INPUT_STATE_TYPE.HOVER,
    targetLayerIndex: targetLayerIndex,
    targetObjectIndex: targetObjectIndex,
  }),

  /**
   * マウス押下状態
   * @typedef {Object} MouseDownState
   * @property {"MOUSE_DOWN"} type
   * @property {number|null} targetLayerIndex
   * @property {number|null} targetObjectIndex
   * @property {{x:number|null,y:number|null}} downCoordinates
   */
  MOUSE_DOWN: ({
    targetLayerIndex = null,
    targetObjectIndex = null,
    downCoordinates = { x: null, y: null },
  }) => ({
    type: INPUT_STATE_TYPE.MOUSE_DOWN,
    targetLayerIndex,
    targetObjectIndex,
    downCoordinates: downCoordinates,
  }),
};
