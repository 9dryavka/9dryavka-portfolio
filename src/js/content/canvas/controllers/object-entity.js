export default class ObjectEntityController {
  /**
   * スケール
   * ※sizeを直接更新すると不可逆になるため、別管理
   * @type {number}
   */
  #scale = 1;

  /**
   * 透明度
   * @type {number}
   */
  #opacity = 1;

  /**
   * 座標
   * ※相対値
   * @type {Coordinates}
   */
  #coordinates = { x: null, y: null };

  /**
   * サイズ
   * ※相対値
   * @type {number}
   */
  #size = null;

  /**
   * コンストラクタ
   * @param {Object} params
   * @param {{x:number, y:number}} params.coordinates
   * @param {number} params.size
   */
  constructor({ coordinates, size }) {
    this.#coordinates = coordinates;
    this.#size = size;
  }

  /**
   * 値取得処理
   * @return {{
   *  coordinates: {x:number, y:number}
   *  size: number
   *  scale: number
   *  opacity: number
   * }}
   */
  get() {
    return {
      coordinates: {
        x: this.#coordinates.x,
        y: this.#coordinates.y,
      },
      size: this.#size,
      scale: this.#scale,
      opacity: this.#opacity,
    };
  }

  /**
   * 座標値取得処理
   * @return {{x:number, y:number}}
   */
  getCoordinates() {
    return this.#coordinates;
  }

  /**
   * スケール値取得処理
   * @return {number}
   */
  getScale() {
    return this.#scale;
  }

  /**
   * スケール更新
   * @param {number} scale
   */
  setScale(scale) {
    this.#scale = scale;
  }

  /**
   * 透明度更新
   * @param {number} opacity
   */
  setOpacity(opacity) {
    this.#opacity = opacity;
  }

  /**
   * 座標更新
   * @param {{x:number, y:number} } coordinates
   */
  setCoordinates(coordinates) {
    this.#coordinates.x = coordinates.x;
    this.#coordinates.y = coordinates.y;
  }
}
