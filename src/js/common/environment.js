import * as THREE from "three";
// Environment.js
class Environment {
  #width;
  #height;
  #devicePixelRatio;
  #aspect;
  #displayType;
  #resolution;
  constructor() {
    this.resize();
  }

  resize() {
    this.#width = window.innerWidth;
    this.#height = window.innerHeight;
    this.#devicePixelRatio = window.devicePixelRatio;
    this.#displayType =
      this.#width > this.#height ? DEVICE_TYPE.LANDSCAPE : DEVICE_TYPE.PORTRAIT;
    this.#resolution = new THREE.Vector2(this.#width, this.#height);
  }

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }

  get devicePixelRatio() {
    return this.#devicePixelRatio;
  }

  get aspect() {
    return this.#width / this.#height;
  }

  get displayType() {
    return this.#displayType;
  }

  get resolution() {
    return this.#resolution;
  }
}

export const DEVICE_TYPE = {
  PORTRAIT: "PORTRAIT",
  LANDSCAPE: "LANDSCAPE",
};

export default new Environment();
