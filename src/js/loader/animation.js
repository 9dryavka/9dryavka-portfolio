import { ASSETS_DEFINES } from "./assets";
import * as THREE from "three";

const ANIMATION_STATE = {
  DEFAULT: "default",
  READY: "ready",
  BOOST: "boost",
  BROKEN: "broken",
};

export class LoadingAnimation {
  // ロケットのアニメーション状態
  #animationState = ANIMATION_STATE.DEFAULT;

  // アニメーション切り替えの早さ
  #frameInterval = 0.5;

  // ロケット表示用jQueryオブジェクト
  #$rocket;

  // ロケット画像 状態保存
  #rocketFrames = new Map();

  // ロケット画像配列のインデックス
  #currentFrame;

  // アニメーション完了後アクション
  #onComplete;

  /**
   * コンストラクタ
   * @param {()=>void} onComplete
   */
  constructor(onComplete) {
    this.#onComplete = onComplete;
  }

  /**
   * 初期化処理
   */
  async init() {
    const loadPromises = [];

    this.#rocketFrames = Object.entries(ASSETS_DEFINES.assets.rocket).reduce(
      (map, [key, value]) => {
        const currentState = key.replace(/\d+$/, "");

        const image = new Image();
        image.alt = key;
        image.width = 200;
        image.height = 200;

        loadPromises.push(
          new Promise((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = reject;
          }),
        );

        image.src = value;

        if (!map.has(currentState)) {
          map.set(currentState, []);
        }

        map.get(currentState).push(image);

        return map;
      },
      new Map(),
    );

    // 全画像の読み込み待ち
    await Promise.all(loadPromises);

    // HTMLエレメント取得
    this.#$rocket = $("#rocket");

    // デフォルト画像設定
    this.#updateRocketFrames(ANIMATION_STATE.DEFAULT);

    // テキストを分割
    this.#prepareTitleAnimation();

    // アニメーション開始
    this.#startRocketAnimation();
  }

  /**
   * アニメーションスタート
   */
  startLaunchSequence() {
    setTimeout(async () => {
      this.#animationState = ANIMATION_STATE.BOOST;

      // ローディングスクロール
      await new Promise((resolve) => {
        $("#loading").animate(
          {
            scrollTop: 0,
          },
          {
            duration: 2000,
            complete: resolve,
          },
        );
      });
      this.#animationState = ANIMATION_STATE.BROKEN;
      const elementHeight = this.#$rocket.outerHeight();
      const moveY = -(window.innerHeight - elementHeight - 20);
      this.#$rocket.css({
        transform: `translateY(${moveY}px)`,
        pointerEvents: "none",
      });

      await this.#sleep(1000);

      // ロケット非表示
      this.#$rocket.css("opacity", 0);

      // タイトル表示
      $("#loading-title").addClass("show");

      await this.#animateTitleText();

      this.#onComplete();
    }, 500);
  }

  /**
   * スリープ処理
   * @param { number } ms
   * @returns
   */
  #sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * ロケット画像のアニメート処理
   */
  #startRocketAnimation() {
    const timer = new THREE.Timer();
    let elapsed = 0;

    const animate = () => {
      requestAnimationFrame(() => animate());
      timer.update();
      elapsed += timer.getDelta();
      // リフレッシュレート未満であればスキップ
      if (elapsed < this.#frameInterval) {
        return;
      }
      elapsed = 0;
      this.#updateRocketFrames(this.#animationState);
    };
    animate();
  }

  /**
   * ロケット画像更新
   * @param { string } animationState
   */
  #updateRocketFrames(animationState) {
    const targetFrames = this.#rocketFrames.get(animationState);

    const currentState = this.#currentFrame?.group ?? 0;

    if (
      (currentState === animationState && targetFrames.length <= 1) ||
      !targetFrames?.length
    ) {
      // 更新不要のためスキップ
      return;
    }

    const currentFrameIndex =
      currentState === animationState ? this.#currentFrame.index : -1;

    const nextIndex = (currentFrameIndex + 1) % targetFrames.length;

    this.#$rocket.empty().append(targetFrames[nextIndex]);
    this.#currentFrame = {
      group: animationState,
      index: nextIndex,
    };
  }

  /**
   * タイトルアニメーション準備
   */
  #prepareTitleAnimation() {
    // サイトタイトルアニメーション
    const $title = $("#site-title");
    const titleText = $title.text();

    // loading側へタイトルアニメーション生成
    const $loadingTitle = $("#loading-title");

    [...titleText].forEach((char, i) => {
      const duration = Math.max(0.3, 1.2 * Math.pow(0.9, i));

      $("<span>", {
        text: char === " " ? "\u00a0" : char,
      })
        .css({
          "--pop-delay": `${i * 0.1}s`,
          "--pop-duration": `${duration}s`,
        })
        .appendTo($loadingTitle);
    });
  }

  /**
   * タイトルテキストのアニメート処理
   */
  async #animateTitleText() {
    const $spans = $("#loading-title span");
    if ($spans.length === 0) {
      return;
    }

    return new Promise((resolve) => {
      let completed = 0;

      $spans.each((_, span) => {
        span.addEventListener(
          "animationend",
          () => {
            completed++;

            if (completed === $spans.length) {
              resolve();
            }
          },
          { once: true },
        );

        span.classList.add("pop");
      });
    });
  }
}
