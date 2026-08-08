import * as THREE from "three";
import { getTextureArray, TEXTURE_TYPE } from "../utils";
import PageController from "../controllers/page";
import MetaballLayerController from "../controllers/layer-metaball";
import BubbleLayerController from "../controllers/layer-bubble";
import { createParallelWindowControllers } from "./layer.parallel-window";
import { createTextureBubbleControllers } from "./layer.texture-bubble";

const textureLoader = new THREE.TextureLoader();

export default class PageControllerFactory {
  /**
   * 入力状態
   * @type {InputState}
   */
  #getInputState;
  /**
   * ページ遷移処理
   * @type {{(toPageController: PageController) => void}}
   */
  #transitPage;
  /**
   * コンテンツ設定処理
   * @type {($content: JQuery) => void}
   */
  #setContent;

  /**
   * コンストラクタ
   * @param {Object} params
   * @param {($content: JQuery) => void} params.setContent
   * @param {() => InputState} params.getInputState
   * @param {(toPageController: PageController)=>void} params.transitPage
   */
  constructor({ setContent, getInputState = null, transitPage = null }) {
    // 型チェック
    if (
      typeof setContent !== "function" ||
      typeof getInputState !== "function" ||
      typeof transitPage !== "function"
    ) {
      throw new Error(
        `
          PageCongrollersFactoryコンストラクタに不正なパラメータが指定されました。
          setContent typeof [${typeof setContent}],
          getInputState typeof [${typeof getInputState}],
          transitPage typeof [${typeof transitPage}],
        `,
      );
    }

    this.#setContent = setContent;
    this.#getInputState = getInputState;
    this.#transitPage = transitPage;
  }

  async create(selectorId) {
    // 対象IDのリストを取得する
    const $list = $(`header #${selectorId}`);
    if (!$list) {
      return null;
    }
    // レイヤーコントローラー
    const layerControllers = [];
    // オブジェクトクリックアクション
    const clickActions = [];

    // パラレルウィンドウ設定画あるかチェック
    const parallelWindowSetting = $list.get(0).dataset.parallelWindow;
    const $listItems = $list.children("li");
    if (parallelWindowSetting) {
      const parallelWindow = JSON.parse(parallelWindowSetting);
      // パラレルウィンドウ設定がある場合、1アイテム1レイヤーでページコントローラーを作成
      const objectCountPerLayer = 8;
      const layearCount = $listItems.length;
      await Promise.all(
        $listItems.toArray().map(async (targetItem, layerIndex) => {
          const objectClickActions = [];

          const layerController = new MetaballLayerController({
            objectControllers: createParallelWindowControllers({
              layerCount: layearCount,
              layerIndex,
              objectCountPerLayer,
            }),
            textures: await getTextureArray({
              textures: [
                {
                  type: TEXTURE_TYPE.IMAGE,
                  url: Object.values(parallelWindow.texture)[layerIndex],
                },
              ],
              textureSize: parallelWindow.size,
            }),
          });

          layerControllers[layerIndex] = layerController;

          for (
            let objectIndex = 0;
            objectIndex < objectCountPerLayer;
            objectIndex++
          ) {
            objectClickActions.push(this.#getObjectClickAction($(targetItem)));
          }

          clickActions[layerIndex] = objectClickActions;
        }),
      );
    } else {
      const layerController = new BubbleLayerController({
        objectControllers: createTextureBubbleControllers({
          layerCount: 1,
          layerIndex: 0,
          objectCountPerLayer: $listItems.length,
        }),
        textures: await getTextureArray({
          textures: $listItems
            .map((_, targetItem) => {
              return {
                type: TEXTURE_TYPE.TEXT,
                text: $(targetItem).children("a").text(),
              };
            })
            .get(),
          textureSize: { width: 500, height: 500 },
        }),
      });
      layerControllers.push(layerController);
      const objectClickActions = [];
      $listItems.each((_, targetItem) => {
        objectClickActions.push(this.#getObjectClickAction($(targetItem)));
      });
      clickActions.push(objectClickActions);
    }

    const backgroundClickAction = $list.parent().is("li")
      ? async () => {
          const toPageController = await this.create(
            $list.parent().parent().attr("id"),
          );
          this.#transitPage({
            toPageController,
          });
        }
      : () => {};

    return new PageController({
      title: $list.prevAll("h1, h2, h3, h4, h5, h6").first().text(),
      layerControllers,
      getInputState: () => this.#getInputState(),
      onClickAction: async ({ targetLayerIndex, targetObjectIndex }) => {
        const action =
          clickActions[targetLayerIndex]?.[targetObjectIndex] ??
          backgroundClickAction;

        // 実行までやる
        await action();
      },
    });
  }

  /**
   * クリックアクション取得処理
   * @param {Object} clickActionData
   * @returns {() => void}
   */
  #getObjectClickAction($item) {
    if ($item.children("ul").length) {
      return async () => {
        const toPageController = await this.create(
          $item.children("ul").attr("id"),
        );
        this.#transitPage({
          toPageController,
        });
      };
    } else if ($item.children("a")) {
      const href = $item.children("a").attr("href");
      if (href.match("#")) {
        return () => {
          this.#setContent($(href));
        };
      } else {
        return () => {
          window.open(href, "_blank", "noopener,noreferrer");
        };
      }
    } else {
      return () => {
        // 何もしない
      };
    }
  }
}
