import { SliderController } from "./controller";

export function createSliderControllers() {
  const slider = $(".slider");

  slider.each((_, targetSlider) => {
    new SliderController($(targetSlider));
  });
}
