import "../../scss/common/starry.scss";

export class StarryEffect {
  /**
   * アニメーションスタート
   */
  start() {
    this.#animateTwincleStars();
    setInterval(() => {
      if (document.hidden) return; // バッググラウンド時は生成不要なのでスキップ
      this.#animateShootingStar();
    }, 3000);
  }

  /**
   * 星空を輝かせる処理
   */
  #animateTwincleStars() {
    const $sky = $(".starry-sky");
    const $starLayer = $("<div>", {
      class: "star-layer",
    });
    $sky.prepend($starLayer);

    const starCount = parseInt(
      getComputedStyle($sky[0]).getPropertyValue("--star-count"),
    );

    for (let i = 0; i < starCount; i++) {
      const size = Math.random() * 3 + 1;
      const delay = Math.random() * 3;
      const duration = Math.random() * 3 + 2;
      $("<div>")
        .addClass("star")
        .css({
          width: size + "px",
          height: size + "px",
          left: Math.random() * 100 + "%",
          top: Math.random() * 100 + "%",
          animationDelay: delay + "s",
          animationDuration: duration + "s",
        })
        .appendTo(".star-layer");
    }
  }

  /**
   * 不定期に流れ星を落とす処理
   */
  #animateShootingStar() {
    $("<div>")
      .addClass("shooting-star")
      .css({
        top: Math.random() * 50 + "%",
        left: Math.random() * 100 + "%",
      })
      .appendTo(".star-layer")
      .on("animationend", () => {
        $(this).remove();
      });
  }
}
