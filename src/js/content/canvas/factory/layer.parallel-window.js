import ObjectController from "../controllers/object";
import ObjectEntityController from "../controllers/object-entity";
import OrbitObjectMotionController from "../controllers/object-motion-orbit";
/**
 * 対象レイヤーのオブジェクトコントローラー作成処理
 * @param {Object} params
 * @param {number} params.layerIndex
 * @param {number} params.layerCount
 * @param {number} params.objectCountPerLayer
 * @return {ObjectController}
 */
const DENSITY = 1.3;
export function createParallelWindowControllers({
  layerIndex,
  layerCount,
  objectCountPerLayer,
}) {
  const offset = -Math.PI / 2; //分割数が2の時に上下に分かれるとイマイチなので、左右に分割するようにオフセットを指定
  const startAngle = offset + (layerIndex / layerCount) * Math.PI * 2;
  const endAngle = offset + ((layerIndex + 1) / layerCount) * Math.PI * 2;
  const maxRadius =
    DENSITY * Math.sqrt(1 / ((layerIndex + 1) * objectCountPerLayer));

  return Array.from({ length: objectCountPerLayer }, (_, index) => {
    const initialObjectParams = createOrbitMetaballObjectParams({
      startAngle,
      endAngle,
      maxRadius,
    });
    return new ObjectController({
      entityController: new ObjectEntityController(initialObjectParams.entity),
      motionController: new OrbitObjectMotionController(
        initialObjectParams.motion,
      ),
    });
  });
}

/**
 * オブジェクトパラメータの作成処理
 * @param {Object} params
 * @param {number} params.startAngle
 * @param {number} params.endAngle
 * @param {number} params.maxRadius
 * @returns {{
 *  entity: {
 *    coordinates: {x:number, y:number},
 *    size: number,
 *    scale: number,
 *    opacity: number
 *  },
 *  motion: {
 *    barycenterCoordinates: {x:number, y:number},
 *    radius: number,
 *    clockwise: boolean,
 *    velocity: number,
 *    angle: number
 *  }
 * }}
 */
function createOrbitMetaballObjectParams({ startAngle, endAngle, maxRadius }) {
  // 基本設定を作成(絶対値にするとリサイズ時の更新が面倒なので相対値)
  // 半径
  const radius = (() => {
    return Math.sqrt(Math.random()) * maxRadius;
  })();
  // 現在角度
  const angle = startAngle + Math.random() * (endAngle - startAngle);
  // 中心座標
  const barycenterCoordinates = (() => {
    // 0～1
    const r = Math.sqrt(Math.random());

    // 円内座標(-1～1)
    let x = Math.cos(angle) * r;
    let y = Math.sin(angle) * r;

    // 余白を考慮して100×100へ変換
    const margin = radius * 100;
    x = (x * 0.5 + 0.5) * (100 - margin * 2) + margin;
    y = (y * 0.5 + 0.5) * (100 - margin * 2) + margin;
    return { x, y };
  })();
  // 回転方向(true:時計回り、false:反時計回り)
  const clockwise = Math.random() > 0.3;
  // 速度
  const velocity =
    (1.2 - (radius / maxRadius) * 0.5 + Math.random() * 0.2) * 0.0025;
  // メタボールの中心基準(初期表示用に、半径を画面外まで伸ばした距離に置いておく)
  const coordinates = {
    x: barycenterCoordinates.x + Math.cos(angle) * radius * 100 + 100,
    y: barycenterCoordinates.y + Math.sin(angle) * radius * 100 + 100,
  };
  // メタボールサイズ係数
  const size = 0.8 + Math.random() * 0.4;

  return {
    entity: {
      // 現在座標
      coordinates,
      // メタボールサイズ係数
      size,
      // スケール
      scale: 1,
      // 透明度
      opacity: 1,
    },
    motion: {
      // 中心座標
      barycenterCoordinates,
      // 公転半径
      radius,
      // 回転方向
      clockwise,
      // 速度係数
      velocity,
      // 現在角度
      angle,
    },
  };
}
