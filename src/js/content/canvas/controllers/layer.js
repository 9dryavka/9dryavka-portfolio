import * as THREE from "three";
import ObjectController from "./object";
import environment from "../../../common/environment";

export default class LayerController {
  static geometry = new THREE.PlaneGeometry(2, 2);
  /**
   * @type {ObjectController[]}
   */
  #objectControllers;

  /**
   * @type {{
   *  scene: THREE.Scene
   *  mesh: THREE.Mesh
   * }}
   */
  #renderObject;

  /**
   * コンストラクタ
   * @param {Object} params
   * @param {ObjectController[]} params.objectControllers
   * @param {THREE.DataArrayTexture} params.textures
   */
  constructor({ objectControllers, textures }) {
    this.#objectControllers = objectControllers;
    this.#renderObject = this.createRenderObject({
      objectControllers,
      textures,
    });
  }

  /**
   * 座標更新
   * @param {Object} params
   * @param {number} params.targetObjectIndex
   * @param {{x:number, y:number}} params.coordinates
   */
  setCoordinates({ targetObjectIndex, coordinates }) {
    this.#objectControllers[targetObjectIndex].setCoordinates(coordinates);

    this.syncUniformObject(targetObjectIndex);
  }

  /**
   * オブジェクトのスケール更新
   * ※targetObjectIndexを指定していない場合はレイヤー配下の全オブジェクトをスケール
   * @param {Object} params
   * @param {number} params.scale
   * @param {number | null} params.targetObjectIndex
   */
  setScale({ scale, targetObjectIndex = null }) {
    if (targetObjectIndex !== null) {
      this.#objectControllers[targetObjectIndex].setScale(scale);
      this.syncUniformObject(targetObjectIndex);
    } else {
      for (let n = 0; n < this.#objectControllers.length; n++) {
        this.#objectControllers[n].setScale(scale);
        this.syncUniformObject(n);
      }
    }
  }

  /**
   * フレーム更新
   * @param {Object} params
   * @param {number | null} params.controllObjectIndex
   * @param {number} params.scale
   */
  update({ controllObjectIndex = null, scale = 1 } = {}) {
    for (let n = 0; n < this.#objectControllers.length; n++) {
      if (controllObjectIndex !== n) {
        this.#objectControllers[n].updateCoordinates();
      }
      this.#objectControllers[n].updateScale(scale);
      this.syncUniformObject(n);
    }
  }

  /**
   * 入場処理
   * @param {Object} params
   * @param {number} params.progress
   * @param {number} params.deltaTime
   */
  updateDisplayIn({ progress, deltaTime }) {
    for (let n = 0; n < this.#objectControllers.length; n++) {
      this.#objectControllers[n].updateDisplayIn(progress);
      this.syncUniformObject(n);
    }
  }

  /**
   * 退場処理
   * @param {Object} params
   * @param {number} params.progress
   * @param {number} params.deltaTime
   */
  updateDisplayOut({ progress, deltaTime }) {
    for (let n = 0; n < this.#objectControllers.length; n++) {
      this.#objectControllers[n].updateDisplayOut(progress);
      this.syncUniformObject(n);
    }
  }

  /**
   * Scene取得
   * @returns {THREE.Scene}
   */
  getScene() {
    return this.#renderObject.scene;
  }

  /**
   * オブジェクトヒットチェック
   * @param {{x:number, y:number}} mouseCoordinates
   * @returns {{isHit:boolean, objectIndex:number}}
   */
  checkHitObject(mouseCoordinates) {
    return {
      isHit: false,
      objectIndex: null,
    };
  }

  /**
   * レイヤーが管理する全オブジェクトコントローラーを取得
   * @returns {ObjectController[]}
   */
  getObjectControllers() {
    return this.#objectControllers;
  }

  /**
   * 対象インデックスのオブジェクトコントローラーとレンダーオブジェクトの値を同期させる
   * @param {number} index
   */
  syncUniformObject(index) {
    const uniformObject =
      this.#renderObject.mesh.material.uniforms.uObjects.value[index];

    const objectEntity = this.#objectControllers[index].getEntity();

    uniformObject.coordinates.set(
      objectEntity.coordinates.x,
      objectEntity.coordinates.y,
    );

    uniformObject.size = objectEntity.size;
    uniformObject.scale = objectEntity.scale;
    uniformObject.opacity = objectEntity.opacity;
  }

  /**
   * uniforms.uBalls[n].valueに設定する値をobjectControllerから取得する処理
   * @returns {{coordinates:THREE.Vector2, size:number, scale:number, opacity:number}
   */
  getUniformObjectsValue() {
    return this.#objectControllers.map((objectController) => {
      const objectEntity = objectController.getEntity();
      return {
        coordinates: new THREE.Vector2(
          objectEntity.coordinates.x,
          objectEntity.coordinates.y,
        ),
        size: objectEntity.size,
        scale: objectEntity.scale,
        opacity: objectEntity.opacity,
      };
    });
  }

  /**
   * レンダーオブジェクト作成処理(シェーダーや演算処理を独自に実装する必要があるため、継承先の子要素で実装)
   */
  createRenderObject() {
    throw new Error("createRenderObject is not implemented.");
  }

  /**
   * リサイズ処理
   */
  resize() {
    this.#renderObject.mesh.material.uniforms.uResolution.value =
      environment.resolution;
  }
}
