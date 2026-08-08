import * as THREE from "three";
import LayerController from "./layer";
import OrbitObjectMotionController from "./object-motion-orbit";
import ObjectEntityCOntroller from "./object-entity";
import ObjectController from "./object";

import vertexShader from "../shaders/common.vert?raw";
import fragmentShader from "../shaders/texture-metaball.frag?raw";
import { max } from "three/tsl";
import environment from "../../../common/environment";

const THRESHOLD = 0.01;
const MARGIN = 0.0005;
export default class MetaballLayerController extends LayerController {
  /**
   * レンダーオブジェクト作成処理
   * @param {Object} params
   * @param {ObjectController[]} params.objectControllers
   * @param { THREE.DataArrayTexture} params.textures
   * @returns
   */
  createRenderObject({ objectControllers, textures }) {
    const uniforms = {
      uResolution: {
        value: environment.resolution,
      },
      uTextureResolution: {
        value: new THREE.Vector2(textures.image.width, textures.image.height),
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
        #define THRESHOLD ${THRESHOLD}
        #define MARGIN ${MARGIN}
        ` + fragmentShader,
    });
    const mesh = new THREE.Mesh(LayerController.geometry, material);

    const scene = new THREE.Scene();
    scene.add(mesh);

    return { mesh, scene };
  }

  /**
   * オブジェクトヒットチェック
   * @param {{x:number, y:number}} mouseCoordinates
   * @returns {{isHit: boolean,  objectIndex: number}}
   */
  checkHitObject(mouseCoordinates) {
    let field = 0;

    let bestObjectIndex = -1;
    let bestContribution = 0;

    const objectControllers = this.getObjectControllers();

    for (let i = 0; i < objectControllers.length; i++) {
      const targetObjectController = objectControllers[i];

      const targetEntitiy = targetObjectController.getEntity();

      const dx =
        (mouseCoordinates.x - targetEntitiy.coordinates.x) * environment.aspect; // 画面比率に応じて補正する
      const dy = mouseCoordinates.y - targetEntitiy.coordinates.y;

      const d2 = dx * dx + dy * dy + 1e-4;

      // 半径（影響度）
      const radius = targetEntitiy.size * targetEntitiy.scale;
      const contribution = (radius * radius) / d2;
      field += contribution;

      // どのメタボールに触れたか判定
      if (contribution > bestContribution) {
        bestContribution = contribution;
        bestObjectIndex = i;
      }
    }

    // レイヤーとしてヒット
    if (field > THRESHOLD - MARGIN) {
      return {
        isHit: true,
        objectIndex: bestObjectIndex,
      };
    } else {
      return {
        isHit: false,
        objectIndex: null,
      };
    }
  }
}
