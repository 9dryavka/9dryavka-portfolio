import * as THREE from "three";
import { INPUT_STATE_TYPE } from "./controllers/input";

/**
 * DataArrayTextureを生成する
 *
 * @param {Object} params
 * @param {{type: string, url?: string, text?: string}[]} params.textures テクスチャ一覧
 * @param {{width: number, height: number}} params.textureSize 各テクスチャのサイズ
 * @returns {Promise<THREE.DataArrayTexture>} 生成したDataArrayTexture
 */
export function getOrderedLayerIndexList({ inputState, layerControllerCount }) {
  // レイヤーの処理順配列を作成
  const orderedLayerIndexList = [...Array(layerControllerCount).keys()];
  // 入力コントローラーが操作状態("HOVER"、"MOUSE_DOWN"、"GRABBING")の場合、対象レイヤーを処理優先
  if (
    [
      INPUT_STATE_TYPE.HOVER,
      INPUT_STATE_TYPE.MOUSE_DOWN,
      INPUT_STATE_TYPE.GRABBING,
    ].includes(inputState.type) &&
    inputState.targetLayerIndex !== null
  ) {
    const targetLayerIndex = inputState.targetLayerIndex;
    orderedLayerIndexList.splice(targetLayerIndex, 1);
    orderedLayerIndexList.unshift(targetLayerIndex);
  }
  return orderedLayerIndexList;
}
/**
 * オブジェクトのデフォルト拡大率
 * @type {number}
 */
export const DEFAULT_SCALE = 1;

/**
 * オブジェクトの最大拡大率
 * @type {number}
 */
export const MAX_SCALE = 1.2;

/**
 * テクスチャ種別
 * @readonly
 * @enum {string}
 */
export const TEXTURE_TYPE = {
  IMAGE: "IMAGE",
  TEXT: "TEXT",
};

/**
 * テクスチャデータ配列を取得する
 * @param {Object} params
 * @param {{type: string, url: string, text: string}[]} params.textures
 * @param {{width: number, height: number}} params.textureSize
 * @returns {THREE.DataArrayTexture}
 */
export async function getTextureArray({ textures, textureSize }) {
  const size = textureSize.width * textureSize.height * 4;

  const imageDatas = await Promise.all(
    textures.map((targetTexture) =>
      getTexture({
        targetTexture,
        textureSize,
      }),
    ),
  );

  const pixels = new Uint8Array(size * imageDatas.length);
  imageDatas.forEach((imageData, index) => {
    const flippedImageData = flipImageDataVertical(imageData);

    pixels.set(flippedImageData, index * size);
  });

  const resultTextureArray = new THREE.DataArrayTexture(
    pixels,
    textureSize.width,
    textureSize.height,
    imageDatas.length,
  );
  resultTextureArray.minFilter = THREE.NearestFilter;
  resultTextureArray.magFilter = THREE.NearestFilter;

  resultTextureArray.needsUpdate = true;

  return resultTextureArray;
}

/**
 * テクスチャデータを取得する
 *
 * @param {Object} params
 * @param {{type: string, url?: string, text?: string}} params.targetTexture テクスチャ情報
 * @param {{width: number, height: number}} params.textureSize テキスト描画時のテクスチャサイズ
 * @returns {Promise<ImageData>} テクスチャのImageData
 */
async function getTexture({ targetTexture, textureSize }) {
  switch (targetTexture.type) {
    case TEXTURE_TYPE.IMAGE:
      return await loadImageDataFromUrl(targetTexture.url);
    case TEXTURE_TYPE.TEXT:
      return convertTextToTexture({ text: targetTexture.text, textureSize });
    default:
      throw new Error(
        `不正なテクスチャ種別が指定されました。texture.type=[${targetTexture.type}]`,
      );
  }
}

/**
 * URLから画像を読み込み、ImageDataとして取得する
 *
 * @param {string} url 画像URL
 * @returns {Promise<ImageData>} 読み込んだ画像のImageData
 */
async function loadImageDataFromUrl(url) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    // srcを設定する前に必ず設定
    img.crossOrigin = "anonymous";

    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);

  return ctx.getImageData(0, 0, image.width, image.height);
}

/**
 * テキストを描画したImageDataを生成する
 *
 * @param {Object} params
 * @param {string} params.text 描画する文字列
 * @param {{width: number, height: number}} params.textureSize テクスチャサイズ
 * @returns {ImageData} 描画結果のImageData
 */
function convertTextToTexture({ text, textureSize }) {
  const canvas = document.createElement("canvas");
  canvas.width = textureSize.width;
  canvas.height = textureSize.height;

  const ctx = canvas.getContext("2d");

  // 背景(透明)
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 文字設定
  ctx.fillStyle = "#000000";
  ctx.font = "bold 50px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // 描画
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * WebGLで読み込む際に画像が上下反転するため、ImageDataを上下反転した配列を生成する
 *
 * @param {ImageData} imageData 元のImageData
 * @returns {Uint8ClampedArray} 上下反転後のRGBA配列
 */
function flipImageDataVertical(imageData) {
  const { width, height, data } = imageData;
  const flipped = new Uint8ClampedArray(data.length);

  for (let y = 0; y < height; y++) {
    const srcY = height - 1 - y;

    for (let x = 0; x < width; x++) {
      const srcIndex = (srcY * width + x) * 4;
      const dstIndex = (y * width + x) * 4;

      flipped[dstIndex] = data[srcIndex];
      flipped[dstIndex + 1] = data[srcIndex + 1];
      flipped[dstIndex + 2] = data[srcIndex + 2];
      flipped[dstIndex + 3] = data[srcIndex + 3];
    }
  }

  return flipped;
}
