import BaseObjectEntityController from "./object-entity";
import BaseObjectMotionController from "./object-motion-base";

export default class ObjectController {
  /**
   * @type {BaseObjectEntityController}
   */
  #entityController;
  /**
   * @type {BaseObjectMotionController}
   */
  #motionController;

  /**
   * コンストラクタ
   * @param {Object} params
   * @param {BaseObjectEntityController} params.entityController
   * @param {BaseObjectMotionController} params.motionController
   */
  constructor({ entityController, motionController }) {
    this.#entityController = entityController;
    this.#motionController = motionController;
  }

  /**
   * オブジェクトの値を取得する
   * @returns {Object}
   */
  get() {
    return {
      entity: this.#entityController.get(),
      motion: this.#motionController.get(),
    };
  }

  /**
   * オブジェクトエンティティの値を取得する
   * @returns {Object}
   */
  getEntity() {
    return this.#entityController.get();
  }

  /**
   * オブジェクトモーションの値を取得する
   * @returns {Object}
   */
  getMotion() {
    return this.#motionController.get();
  }

  /**
   * スケール更新
   * @param {number} scale
   */
  setScale(scale) {
    this.#entityController.setScale(scale);
  }

  /**
   * ObjectEntityの値をObjectMotionの値に応じて更新する処理
   */
  updateCoordinates() {
    const nextCoordinates = this.#motionController.simulate({
      entity: this.getEntity(),
    });

    this.#entityController.setCoordinates(nextCoordinates);
  }

  /**
   * フレームでのスケール処理
   * @param {number} expectedScale
   */
  updateScale(expectedScale) {
    const currentScale = this.#entityController.getScale();
    const step = 0.01;

    if (currentScale < expectedScale) {
      this.#entityController.setScale(
        Math.min(currentScale + step, expectedScale),
      );
    } else if (currentScale > expectedScale) {
      this.#entityController.setScale(
        Math.max(currentScale - step, expectedScale),
      );
    }
  }

  /**
   * 退場処理
   * @param {number} progress
   */
  updateDisplayOut(progress) {
    const nextCoordinates = this.#motionController.simulateDisplayOut({
      coordinates: this.#entityController.getCoordinates(),
      progress,
    });
    this.#entityController.setCoordinates(nextCoordinates);
  }

  /**
   * 入場処理
   * @param {number} progress
   */
  updateDisplayIn(progress) {
    const nextCoordinates = this.#motionController.simulateDisplayIn({
      coordinates: this.#entityController.getCoordinates(),
      progress,
    });
    this.#entityController.setCoordinates(nextCoordinates);

    // スケールしている場合は元に戻す
    if (this.#entityController.getScale() > 1) {
      this.#entityController.setScale(6 - progress * 5);
    }
  }

  /**
   * ObjectEntityの座標を更新する
   * @param {{
   *  x:number,
   *  y:number
   * }} coordinates
   */
  setCoordinates(coordinates) {
    this.#entityController.setCoordinates(coordinates);
  }
}
