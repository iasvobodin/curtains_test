import gsap from "gsap";
import { Curtains } from "curtainsjs";
import { vertex, fragment } from "/src/shader.js";

const curtains = new Curtains({
  container: "canvas",
  pixelRatio: 2
});
const duration = 2;
const segments = 64;
const planes = [];
let planeElements = document.getElementsByClassName("plane");
const params = {
  widthSegments: segments,
  heightSegments: segments,
  vertexShader: vertex,
  fragmentShader: fragment,
  fov: 75,
  uniforms: {
    uTime: {
      name: "uTime", // uniform name that will be passed to our shaders
      type: "1f", // this means our uniform is a float
      value: 0
    },
    uViewSize: {
      name: "uViewSize", // uniform name that will be passed to our shaders
      type: "2f",
      value: []
    },
    uPlanePosition: {
      name: "uPlanePosition", // uniform name that will be passed to our shaders
      type: "2f",
      value: []
    },
    uWindowSize: {
      name: "uWindowSize", // uniform name that will be passed to our shaders
      type: "2f",
      value: []
    },
    uImgUnit: {
      name: "uImgUnit", // uniform name that will be passed to our shaders
      type: "2f",
      value: []
    },
    uPlaneSize: {
      name: "uPlaneSize", // uniform name that will be passed to our shaders
      type: "2f",
      value: []
    },
    uProgress: {
      name: "uProgress",
      type: "1f",
      value: 0
    }
  }
};

for (let i = 0; i < planeElements.length; i++) {
  let plane = curtains.addPlane(planeElements[i], params);
  planes.push(plane);
  // handlePlanes(i);
  getUnifors(i);

  plane.htmlElement.addEventListener("mousedown", () => toFullscreen(i));
}

let animating = false;
let state = "grid";

function toGrid(i) {
  if (state === "grid") return;
  let plane = planes[i];
  animating = true;
  gsap.to(plane.uniforms.uProgress, {
    duration,
    value: 0,
    onComplete: () => {
      state = "grid";
    }
  });
}
function toFullscreen(i) {
  if (state === "fullscreen") return;
  let plane = planes[i];
  animating = true;
  gsap.to(plane.uniforms.uProgress, {
    duration,
    value: 1,
    onComplete: () => {
      state = "fullscreen";
      toGrid(i);
    }
  });
}

function getUnifors(i) {
  let plane = planes[i];
  const rectPlane = plane.getBoundingRect();

  const wUnit = (window.innerWidth / rectPlane.width) * curtains.pixelRatio; //ширина плана в условных еденицах
  const hUnit = (window.innerHeight / rectPlane.height) * curtains.pixelRatio;

  const xUnit = (rectPlane.left / rectPlane.width - wUnit / 2 + 0.5) * 2;
  const yUnit = (-(rectPlane.top / rectPlane.height - hUnit / 2) - 0.5) * 2;

  const widthImgUnit = plane.images[1].naturalWidth / window.innerWidth; //ширина изображения в условных еденицах
  const heightImgUnit = plane.images[1].naturalHeight / window.innerHeight;

  plane.uniforms.uViewSize.value = [wUnit, hUnit];
  plane.uniforms.uPlanePosition.value = [xUnit, yUnit];
  plane.uniforms.uWindowSize.value = [window.innerWidth, window.innerHeight];
  plane.uniforms.uImgUnit.value = [widthImgUnit, heightImgUnit];
}
