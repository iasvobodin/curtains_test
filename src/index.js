import { Curtains } from "curtainsjs";
import { vertex, fragment } from "/src/shader.js";
import anime from "animejs/lib/anime.es.js";

const curtains = new Curtains({
  container: "canvas",
  pixelRatio: 2
});
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
    uTime: { name: "uTime", type: "1f", value: 0 },
    uViewSize: { name: "uViewSize", type: "2f", value: [] },
    uPlanePosition: { name: "uPlanePosition", type: "2f", value: [] },
    uWindowSize: { name: "uWindowSize", type: "2f", value: [] },
    uImgUnit: { name: "uImgUnit", type: "2f", value: [] },
    uPlaneSize: { name: "uPlaneSize", type: "2f", value: [] },
    uProgress: { name: "uProgress", type: "1f", value: 0 }
  }
};

for (let i = 0; i < planeElements.length; i++) {
  let plane = curtains.addPlane(planeElements[i], params);
  planes.push(plane);
  getUnifors(i);

  plane.htmlElement.addEventListener("mousedown", e => toFullscreen(i, e));
}

let images = document.getElementById("page-content");
images.addEventListener("mousedown", e => console.log(e));

const textures = [];
for (let i = 0; i < images.length; i++) {
  const imageSet = images[i];
  imageSet.addEventListener("mousedown", e => toFullscreen(i, e));
}

let animating = true;

function toFullscreen(i, e) {
  // console.log(e);

  if (animating === false) return;
  e.target.parentElement.classList.add("plane");
  let plane = planes[i];
  animating = false;

  anime({
    targets: plane.uniforms.uProgress,
    easing: "linear",
    value: 1,
    duration: 1000,
    endDelay: 1000,
    direction: "alternate",
    complete() {
      animating = true;
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
