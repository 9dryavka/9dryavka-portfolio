import BaseObjectMotionController from "./object-motion-base";

export default class FloatObjectMotionController extends BaseObjectMotionController {
  /**
   * 速度
   * @param {{x:number, y:number}}
   */
  #velocity;
  #displayInStart;
  #displayInTarget;
  #initial = false;

  /**
   *コンストラクタ
   * @param {{x:number, y:number}} velocity
   */
  constructor({ velocity }) {
    super();

    this.#velocity = velocity;
  }

  get() {
    return {
      velocity: this.#velocity,
    };
  }

  /**
   * 退場処理
   * @param {Object} params
   * @param {{x:number, y:number}} params.coordinates
   * @param {number} params.progress
   * @returns {{x:number, y:number}}
   */
  simulateDisplayOut({ coordinates, progress }) {
    const length = Math.hypot(this.#velocity.x, this.#velocity.y) || 1;

    const directionX = this.#velocity.x / length;
    const directionY = this.#velocity.y / length;

    const distance = 2.5 * progress;

    return {
      x: coordinates.x + directionX * distance,
      y: coordinates.y + directionY * distance,
    };
  }

  /**
   * 入場処理
   * @param {Object} params
   * @param {{x:number, y:number}} params.coordinates
   * @param {number} params.progress
   * @returns {{x:number, y:number}}
   */
  simulateDisplayIn({ coordinates, progress }) {
    if (!this.#initial) {
      this.#resetPosition(coordinates);
      this.#initial = true;
    }
    return {
      x:
        this.#displayInStart.x +
        (this.#displayInTarget.x - this.#displayInStart.x) * progress,
      y:
        this.#displayInStart.y +
        (this.#displayInTarget.y - this.#displayInStart.y) * progress,
    };
  }

  /**
   * 座標初期化処理
   * @param {{x:number, y:number}} coordinates
   */
  #resetPosition(coordinates) {
    this.#displayInTarget = {
      x: coordinates.x,
      y: coordinates.y,
    };

    const length = Math.hypot(this.#velocity.x, this.#velocity.y) || 1;

    // 移動方向の逆
    const dx = -this.#velocity.x / length;
    const dy = -this.#velocity.y / length;

    const tx =
      dx > 0
        ? (100 - coordinates.x) / dx
        : dx < 0
          ? (0 - coordinates.x) / dx
          : Infinity;

    const ty =
      dy > 0
        ? (100 - coordinates.y) / dy
        : dy < 0
          ? (0 - coordinates.y) / dy
          : Infinity;

    // 画面端までの距離
    const t = Math.min(tx, ty);

    const margin = 5;

    this.#displayInStart = {
      x: coordinates.x + dx * (t + margin),
      y: coordinates.y + dy * (t + margin),
    };

    return {
      x: this.#displayInStart.x,
      y: this.#displayInStart.y,
    };
  }
}
