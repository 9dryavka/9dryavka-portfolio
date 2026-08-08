import * as THREE from "three";
import LayerController from "./layer";
import ObjectController from "./object";
import ObjectEntityCOntroller from "./object-entity";
import FloatObjectMotionController from "./object-motion-float";

import vertexShader from "../shaders/common.vert?raw";
import fragmentShader from "../shaders/texture-bubble.frag?raw";

import environment from "../../../common/environment";
import { DEFAULT_SCALE, MAX_SCALE } from "../utils";

export default class BubbleLayerController extends LayerController {
  /**
   * レンダーオブジェクト作成処理
   * @param {Object} params
   * @param {ObjectController[]} params.objectControllers
   * @param {THREE.DataArrayTexture} params.textures
   * @returns
   */
  createRenderObject({ objectControllers, textures }) {
    const uniforms = {
      uResolution: {
        value: environment.resolution,
      },

      uTextures: {
        value: textures,
      },

      uObjectCount: {
        value: objectControllers.length,
      },

      uObjects: {
        value: this.getUniformObjectsValue(),
      },
    };

    const material = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,

      transparent: true,
      depthWrite: false,
      depthTest: false,

      uniforms: uniforms,

      // シェーダー
      vertexShader,
      fragmentShader:
        `
        #define BALL_COUNT ${objectControllers.length}
        ` + fragmentShader,
    });
    const mesh = new THREE.Mesh(LayerController.geometry, material);

    const scene = new THREE.Scene();
    scene.add(mesh);

    return { mesh, scene };
  }

  /**
   * フレーム更新
   * @param {Object} params
   * @param {number} params.controllObjectIndex
   * @param {number} params.focusObjectIndex
   * @param {number} params.scale
   */
  update({ controllObjectIndex = null, focusObjectIndex = null, scale } = {}) {
    for (let n = 0; n < this.getObjectControllers().length; n++) {
      // 衝突判定
      if (controllObjectIndex !== n) {
        // フォーカスオブジェクト以外はCoordinatesの更新はスキップ
        this.#updateObject({
          targetObject: this.getObjectControllers()[n].get(),
          controllObjectIndex,
          targetObjectIndex: n,
        });
      }
      if (focusObjectIndex === n) {
        this.getObjectControllers()[n].updateScale(MAX_SCALE);
      } else {
        this.getObjectControllers()[n].updateScale(DEFAULT_SCALE);
      }

      this.syncUniformObject(n);
    }
  }

  /**
   * オブジェクト更新処理
   * ※衝突判定を実施する都合上、オブジェクトクラスではなくレイヤークラスで処理する
   * @param {Object} params
   * @param {Object} params.targetObject
   * @param {number|null} params.controllObjectIndex
   * @param {number} params.targetObjectIndex
   */
  #updateObject({
    targetObject,
    controllObjectIndex = null,
    targetObjectIndex,
  }) {
    // 座標系はディスプレイサイズに関わらず0～100(正方形扱いの相対値)のため、距離計算する場合は画面比率を補正用の係数として用いる
    const aspect = environment.width / environment.height;
    // 各種値の取得
    const targetEntity = targetObject.entity;
    const targetVelocity = targetObject.motion.velocity;
    const coordinateX = targetEntity.coordinates.x;
    const coordinateY = targetEntity.coordinates.y;
    const targetRadius = targetEntity.size * targetEntity.scale;

    let nextCoordinateX = coordinateX + targetVelocity.x;
    let nextCoordinateY = coordinateY + targetVelocity.y;

    // 他のボールとの衝突
    for (
      let i = controllObjectIndex !== null ? 0 : targetObjectIndex + 1;
      i < this.getObjectControllers().length;
      i++
    ) {
      if (i === targetObjectIndex) continue;
      const otherObject = this.getObjectControllers()[i].get();
      const otherEntity = otherObject.entity;

      const dx = (nextCoordinateX - otherEntity.coordinates.x) * aspect;
      const dy = nextCoordinateY - otherEntity.coordinates.y;

      const distance = Math.hypot(dx, dy);

      const otherRadius = otherEntity.size * otherEntity.scale;

      const minDistance = targetRadius + otherRadius;

      if (distance < minDistance) {
        const overlap = minDistance - distance;

        const nx = dx / distance;
        const ny = dy / distance;

        const isTargetDisabled = controllObjectIndex === i;
        const pushX = (overlap * nx) / aspect;
        const pushY = overlap * ny;

        if (isTargetDisabled) {
          // 相手のみ動かす
          this.#onCollision({
            velocity: targetVelocity,
            nx,
            ny,
          });
          nextCoordinateX = targetEntity.coordinates.x + pushX;
          nextCoordinateY = targetEntity.coordinates.y + pushY;
        } else {
          // 反発させる
          this.#onCollision({
            velocity: targetVelocity,
            nx,
            ny,
          });
          this.#onCollision({
            velocity: otherObject.motion.velocity,
            nx: -nx,
            ny: -ny,
          });
          // 半分ずつ押し戻す
          nextCoordinateX = targetEntity.coordinates.x + pushX / 2;
          nextCoordinateY = targetEntity.coordinates.y + pushY / 2;

          this.getObjectControllers()[i].setCoordinates({
            x: otherEntity.coordinates.x - pushX / 2,
            y: otherEntity.coordinates.y - pushY / 2,
          });
        }
      }
    }

    // 左壁
    if (nextCoordinateX - targetRadius < 0) {
      nextCoordinateX = targetRadius;
      targetVelocity.x = Math.abs(targetVelocity.x);
    }

    // 右壁
    if (nextCoordinateX + targetRadius > 100) {
      nextCoordinateX = 100 - targetRadius;
      targetVelocity.x = -Math.abs(targetVelocity.x);
    }

    // 上壁
    if (nextCoordinateY - targetRadius < 0) {
      nextCoordinateY = targetRadius;
      targetVelocity.y = Math.abs(targetVelocity.y);
    }

    // 下壁
    if (nextCoordinateY + targetRadius > 100) {
      nextCoordinateY = 100 - targetRadius;
      targetVelocity.y = -Math.abs(targetVelocity.y);
    }

    this.getObjectControllers()[targetObjectIndex].setCoordinates({
      x: nextCoordinateX,
      y: nextCoordinateY,
    });
  }

  /**
   * 衝突判定
   *
   * @param {Object} params
   * @param {{x:number, y:number}} params.velocity
   * @param {number} params.nx
   * @param {number} params.ny
   */
  #onCollision({ velocity, nx, ny } = {}) {
    const dot = velocity.x * nx + velocity.y * ny;

    velocity.x -= 2 * dot * nx;
    velocity.y -= 2 * dot * ny;

    const angle = (Math.random() - 0.5) * 0.2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const vx = velocity.x;
    const vy = velocity.y;
    velocity.x = vx * cos - vy * sin;
    velocity.y = vx * sin + vy * cos;

    // 最低速度を保証
    const minSpeed = 0.08;
    const speed = Math.hypot(velocity.x, velocity.y);

    if (speed < minSpeed && speed > 0) {
      const scale = minSpeed / speed;
      velocity.x *= scale;
      velocity.y *= scale;
    }
  }

  /**
   * オブジェクトヒットチェック
   * @param {{x:number, y:number}} mouseCoordinates
   * @returns {{isHit:boolean, objectIndex:number}}
   */
  checkHitObject(mouseCoordinates) {
    const objectControllers = this.getObjectControllers();
    for (
      let targetObjectIndex = 0;
      targetObjectIndex < objectControllers.length;
      targetObjectIndex++
    ) {
      const targetObjectController = objectControllers[targetObjectIndex];
      const entity = targetObjectController.getEntity();

      const radius = entity.size * entity.scale;
      const dx =
        (mouseCoordinates.x - entity.coordinates.x) * environment.aspect;
      const dy = mouseCoordinates.y - entity.coordinates.y;

      if (dx * dx + dy * dy <= radius * radius) {
        return {
          isHit: true,
          objectIndex: targetObjectIndex,
        };
      }
    }

    return {
      isHit: false,
      objectIndex: null,
    };
  }
}
