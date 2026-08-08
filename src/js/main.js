import "../scss/style.scss";
import environment from "./common/environment";
import { CanvasController } from "./content/canvas/main";
import { ModalController } from "./content/modal/controller";
import { StarryEffect } from "../js/common/starry";
import { addTableEventHandlers } from "./content/table/handler";
import { createSliderControllers } from "./content/slider/factory";
import { LoadingController } from "./loader/controller";

const loadingController = new LoadingController();
const contentModalController = new ModalController({
  selector: "#content-modal",
});
const detailModalController = new ModalController({
  selector: "#detail-modal",
});
const canvasController = new CanvasController({
  selector: "#canvas-controller",
  setContent: ($content) => {
    contentModalController.setContent($content);
    contentModalController.open();
  },
});
const starryEffect = new StarryEffect();

$(window).on("load", async () => {
  await loadingController.executeLoading(async () => {
    starryEffect.start();
    addTableEventHandlers(detailModalController);
    createSliderControllers();
    await canvasController.load();
  });
});

$(window).on("resize", () => {
  environment.resize();
  canvasController.resize();
});
