export default class BaseObjectMotionController {
  /**
   * コンストラクタ
   * @param {Object} params
   */
  constructor() {}

  /**
   * @returns {Object}
   */
  get() {}

  /**
   * 演算処理
   * @param {{x:number, y:number}} coordinates
   * @returns {{x:number, y:number}}
   */
  simulate(coordinates) {
    return coordinates;
  }

  /**
   * 座標リセット
   * @param {{x:number, y:number}} coordinates
   * @returns {{x:number, y:number}}
   */
  resetPosition(coordinates) {
    return coordinates;
  }

  /**
   * 退場処理
   * @param {Object} params
   * @param {{x:number, y:number}} params.coordinates
   * @param {number} params.progress
   * @returns {{x:number, y:number}}
   */
  simulateDisplayOut({ coordinates, progress }) {
    return coordinates;
  }

  /**
   * 入場処理
   * @param {Object} params
   * @param {{x:number, y:number}} params.coordinates
   * @param {number} params.progress
   * @returns {{x:number, y:number}}
   */
  simulateDisplayIn({ coordinates, progress }) {
    return coordinates;
  }
}
