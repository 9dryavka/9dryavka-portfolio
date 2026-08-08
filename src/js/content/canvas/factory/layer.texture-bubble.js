import ObjectController from "../controllers/object";
import ObjectEntityCOntroller from "../controllers/object-entity";
import FloatObjectMotionController from "../controllers/object-motion-float";

const CENTER = { x: 50, y: 50 };
const INNER_RADIUS = 30;
const OUTER_RADIUS = 50;

/**
 * 対象レイヤーのオブジェクトコントローラー作成処理
 * @param {Object} params
 * @param {number} params.layerIndex
 * @param {number} params.layerCount
 * @param {number} params.objectCountPerLayer
 * @return {ObjectController}
 */
export function createTextureBubbleControllers({
  layerIndex,
  layerCount,
  objectCountPerLayer,
}) {
  return Array.from({ length: objectCountPerLayer }, (_, index) => {
    const initialObjectParams = createFloatBubbleObjectParams({
      index,
      count: objectCountPerLayer,
      layerIndex,
      layerCount,
    });
    return new ObjectController({
      entityController: new ObjectEntityCOntroller(initialObjectParams.entity),
      motionController: new FloatObjectMotionController(
        initialObjectParams.motion,
      ),
    });
  });
}

/**
 * オブジェクトパラメータの作成処理
 * @param {Object} params
 * @param {number} params.index
 * @param {number} params.count
 * @param {number} params.layerIndex
 * @param {number} params.layerCount
 * @returns {{
 *  entity: {
 *    coordinates: {x:number, y:number},
 *    size: number,
 *    scale: number,
 *    opacity: number
 *  },
 *  motion: {
 *    velocity: {x:number, y:number},
 *  }
 * }}
 */
function createFloatBubbleObjectParams({
  index,
  count,
  layerIndex,
  layerCount,
}) {
  //----------------------------------
  // 角度を均等配置＋ランダム
  //----------------------------------

  const angleStep = (Math.PI * 2) / count;

  const startAngle = angleStep * index;
  const angle = startAngle + (Math.random() - 0.5) * angleStep * 0.8;

  //----------------------------------
  // 半径
  //----------------------------------

  const radiusStep =
    (OUTER_RADIUS - INNER_RADIUS) / Math.max(layerCount - 1, 1);

  const baseRadius = INNER_RADIUS + layerIndex * radiusStep;
  const radius = baseRadius + (Math.random() - 0.5) * radiusStep * 0.6;

  //----------------------------------
  // 座標
  //----------------------------------
  const coordinates = {
    x: CENTER.x + Math.cos(angle) * radius,
    y: CENTER.y + Math.sin(angle) * radius,
  };

  //----------------------------------
  // 初期速度
  //----------------------------------

  const velocityAngle = Math.random() * Math.PI * 2;
  const speed = 0.05 + Math.random() * 0.05;

  const velocity = {
    x: Math.cos(velocityAngle) * speed,
    y: Math.sin(velocityAngle) * speed,
  };

  //----------------------------------
  // サイズ
  //----------------------------------
  const size = 10 + Math.random() * 5;

  return {
    entity: {
      coordinates,
      size,
      scale: 1,
      opacity: 1,
    },
    motion: {
      velocity,
    },
  };
}
