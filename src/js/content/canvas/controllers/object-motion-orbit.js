import BaseObjectMotionController from "./object-motion-base";

export default class OrbitObjectMotionController extends BaseObjectMotionController {
  /**
   * 公転の中心座標
   * @type {{x:number, y:number}}
   */
  #barycenterCoordinates;
  /**
   * 公転半径
   * @type {number}
   */
  #radius;
  /**
   * 回転方向(true:時計回り、false:反時計回り)
   * @type {boolean}
   */
  #clockwise;
  /**
   * 速度(角度で更新するため、0~360の範囲)
   * @type {number}
   */
  #velocity;
  /**
   * 角度
   * @type {number}
   */
  #angle;

  /**
   * コンストラクタ
   * @param {Object} params
   * @param {{x:number, y:number}} params.barycenterCoordinates
   * @param {number} params.radius
   * @param {boolean} params.clockwise
   * @param {number} params.velocity
   * @param {number} params.angle
   */
  constructor({
    barycenterCoordinates,
    radius,
    clockwise = true,
    velocity,
    angle = 0,
  }) {
    super();

    this.#barycenterCoordinates = barycenterCoordinates;
    this.#radius = radius;
    this.#clockwise = clockwise;
    this.#velocity = velocity;
    this.#angle = angle;
  }

  /**
   * 取得処理
   * @returns {{
   *  barycenterCoordinates: {x:number, y:number}
   *  radius: number
   *  clockwise: boolean
   *  velocity: number
   *  angle: number
   * }}
   */
  get() {
    return {
      barycenterCoordinates: this.#barycenterCoordinates,
      radius: this.#radius,
      clockwise: this.#clockwise,
      velocity: this.#velocity,
      angle: this.#angle,
    };
  }

  /**
   * 演算処理
   * @param {{x:number, y:number}} coordinates 現在座標
   * @returns {{x:number, y:number}} 更新後座標
   */
  simulate({ entity }) {
    const direction = this.#clockwise ? 1 : -1;
    this.#angle += this.#velocity * direction;

    const targetX =
      this.#barycenterCoordinates.x +
      Math.cos(this.#angle) * this.#radius * 100;

    const targetY =
      this.#barycenterCoordinates.y +
      Math.sin(this.#angle) * this.#radius * 100;

    const distanceX = targetX - entity.coordinates.x;
    const distanceY = targetY - entity.coordinates.y;

    const distance = Math.hypot(distanceX, distanceY);

    const maxMoveDistance = 10;

    if (distance < maxMoveDistance) {
      return {
        x: entity.coordinates.x + distanceX,
        y: entity.coordinates.y + distanceY,
      };
    }

    // 軌道外なら吸着
    const pull = 0.01;

    return {
      x: entity.coordinates.x + distanceX * pull,
      y: entity.coordinates.y + distanceY * pull,
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
    // progressをもとに対象オブジェクトの公転半径を伸ばして画面外に移動させる
    const distance = this.#radius + progress;
    // 座標計算
    const nextCoordinateX =
      this.#barycenterCoordinates.x +
      Math.cos(this.#angle) * distance * 100 +
      (Math.random() - 0.5) * progress * 3;
    const nextCoordinateY =
      this.#barycenterCoordinates.y +
      Math.sin(this.#angle) * distance * 100 +
      (Math.random() - 0.5) * progress * 3;

    return {
      x: nextCoordinateX,
      y: nextCoordinateY,
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
    const startDistance = 100;

    const distance = startDistance + this.#radius * progress;

    return {
      x:
        this.#barycenterCoordinates.x +
        Math.cos(this.#angle) * distance +
        (Math.random() - 0.5) * (1 - progress) * 3,
      y:
        this.#barycenterCoordinates.y +
        Math.sin(this.#angle) * distance +
        (Math.random() - 0.5) * (1 - progress) * 3,
    };
  }
}
