import { Curtains } from "curtainsjs";
import { vertex, fragment } from "/src/shader.js";
import anime from "animejs/lib/anime.es.js";

// var tl2 = anime.timeline({
//   easing: "easeOutExpo",
//   duration: 8750
// });

// tl2.add({
//   autoplay: true,
//   targets: "#canvas",
//   scale: 0.5
// });

// console.log(tl2);

const curtains = new Curtains({
  container: "canvas",
  pixelRatio: 2
});
let mousePosition = {
  x: 0,
  y: 0
};
let animating = true;
const segments = 64;
const params = {
  widthSegments: segments,
  heightSegments: segments,
  vertexShader: vertex,
  fragmentShader: fragment,
  fov: 75,
  autoloadSources: true,
  uniforms: {
    uTime: { name: "uTime", type: "1f", value: 0 },
    uViewSize: { name: "uViewSize", type: "2f", value: [] },
    uMouse: { name: "uMouse", type: "2f", value: [] },
    uPlanePosition: { name: "uPlanePosition", type: "2f", value: [] },
    uWindowSize: { name: "uWindowSize", type: "2f", value: [] },
    uImgUnit: { name: "uImgUnit", type: "2f", value: [] },
    uPlaneSize: { name: "uPlaneSize", type: "2f", value: [] },
    uProgress: { name: "uProgress", type: "1f", value: 0 }
  }
};
// console.log(curtains);
let images = document.getElementById("page-content");
images.addEventListener("mousemove", function(e) {
  handleMovement(e, curtains.planes[0]);
});
images.addEventListener("touchmove", function(e) {
  handleMovement(e, curtains.planes[0]);
});
images.addEventListener("mousedown", e => newPlane(e));

function newPlane(e) {
  // console.time("anim");
  mousePosition.x = e.clientX;
  mousePosition.y = e.clientY;
  if (e.target.localName === "img") {
    // e.target.parentElement.classList.add("plane");
    // let planeElements = document.getElementsByClassName("plane");
    let plane = curtains.addPlane(e.target.parentElement, params);
    plane.onReady(() => {
      getUnifors();

      toFullscreen();
    });
  }
}

function toFullscreen() {
  let plane = curtains.planes;
  console.log(plane);
  if (animating === false) return;
  animating = false;
  let tl = anime.timeline({
    autoplay: false,
    easing: "linear"
  });
  tl.add(
    {
      targets: "#canvas",
      zIndex: 10,
      duration: 0
    },
    0
  )
    .add({
      targets: plane[0].uniforms.uProgress,
      value: 1,
      duration: 1500
    })
    .add({
      targets: plane[0].uniforms.uProgress,
      value: 0,
      delay: 800,
      duration: 1500,
      complete() {
        curtains.removePlane(plane[0]);
        animating = true;
        console.log(curtains);
      }
    })
    .add({
      targets: "#canvas",
      delay: 100,
      zIndex: -10,
      duration: 0
    });
  tl.play();
}
let plane = curtains.planes[0];
function handleMovement(e, plane) {
  // console.log(e);
  // if (e.targetTouches) {
  //   mousePosition.x = e.targetTouches[0].clientX;
  //   mousePosition.y = e.targetTouches[0].clientY;
  // } else {
  //   mousePosition.x = e.clientX;
  //   mousePosition.y = e.clientY;
  // }
}
function getUnifors() {
  let plane = curtains.planes[0];

  const mouseCoords = plane.mouseToPlaneCoords(
    mousePosition.x,
    mousePosition.y
  );

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
  plane.uniforms.uMouse.value = [mouseCoords.x, mouseCoords.y];
}
