import { Curtains } from "curtainsjs";
import { vertex, fragment } from "/src/shader.js";
import anime from "animejs/lib/anime.es.js";
// import vertex from "/src/vertex.glsl";
// import fragment from "/src/fragment.glsl";

const curtains = new Curtains({
  container: "canvas",
  pixelRatio: 2
});
var mousePosition = {
  x: 0,
  y: 0
};
let animating = true;
const segments = 124;
const duration = 1000;
const params = {
  widthSegments: segments,
  heightSegments: segments,
  vertexShader: vertex,
  fragmentShader: fragment,
  fov: 75,
  autoloadSources: true,
  uniforms: {
    uSeed: {
      name: "uSeed",
      type: "1f",
      value: Math.floor(Math.random() * 10000)
    },
    uTime: { name: "uTime", type: "1f", value: 0 },
    uViewSize: { name: "uViewSize", type: "2f", value: [] },
    uMouse: { name: "uMouse", type: "2f", value: [] },
    uPlanePosition: { name: "uPlanePosition", type: "2f", value: [] },
    uResolution: { name: "uResolution", type: "2f", value: [] },
    uProgress: { name: "uProgress", type: "1f", value: 0 }
  }
};
// console.log(curtains);
let images = document.getElementById("page-content");
// console.log({ images });
for (let i = 0; i < images.children.length; i++) {
  const image = images.children[i].children[0];
  image.addEventListener("mousedown", e => newPlane(e));
}

// images.addEventListener("mousedown", e => newPlane(e));
// images.addEventListener("mousemove", e => console.log(e.clientX, e.clientY));

function newPlane(e) {
  console.time("click");
  console.time("plane");
  console.log(e);

  if (e.target.localName === "img") {
    // e.target.parentElement.classList.add("plane");
    // let planeElements = document.getElementsByClassName("plane");
    let plane = curtains.addPlane(e.target.parentElement, params);
    var rect = plane.getBoundingRect();
    const mouseNormalized = {
      x: e.offsetX / rect.width,
      // Allways invert Y coord
      y: 1 - e.offsetY / rect.height
    };

    console.log(mouseNormalized);
    // update our mouse position uniform
    plane.uniforms.uMouse.value = [mouseNormalized.x, mouseNormalized.y];
    plane.onReady(() => {
      console.timeEnd("plane");
      getUnifors();
      toFullscreen();
    });
  }
}

function toFullscreen() {
  // let plane = curtains.planes;
  // console.log(plane);
  if (animating === false) return;
  animating = false;
  let tl = anime.timeline({
    autoplay: false,
    easing: "linear"
  });
  tl.add({ targets: "#canvas", zIndex: 10, duration: 0 })
    .add({
      targets: curtains.planes[0].uniforms.uProgress,
      value: 1,
      delay: 500,
      duration: duration,
      easing: "linear",
      begin: function() {
        console.timeEnd("click");
      }
    })
    .add({
      targets: curtains.planes[0].uniforms.uProgress,
      value: 0,
      delay: 1500,
      duration: duration,
      complete() {
        curtains.removePlane(curtains.planes[0]);
        animating = true;
        // console.log(curtains);
      }
    })
    .add({
      targets: "#canvas",
      delay: 1,
      zIndex: -10,
      duration: 0
    });
  tl.play();
}
// let plane = curtains.planes[0];
// function handleMovement(e, plane) {
//   console.log(e);
//   if (e.targetTouches) {
//     mousePosition.x = e.targetTouches[0].clientX;
//     mousePosition.y = e.targetTouches[0].clientY;
//   } else {
//     mousePosition.x = e.clientX;
//     mousePosition.y = e.clientY;
//   }
// }
function getUnifors() {
  let plane = curtains.planes[0];

  // const mouseCoords = plane.mouseToPlaneCoords(
  //   mousePosition.x,
  //   mousePosition.y
  // );

  const rectPlane = plane.getBoundingRect();

  const wUnit = (window.innerWidth / rectPlane.width) * curtains.pixelRatio; //ширина плана в условных еденицах
  const hUnit = (window.innerHeight / rectPlane.height) * curtains.pixelRatio;

  const xUnit = (rectPlane.left / rectPlane.width - wUnit / 2 + 0.5) * 2;
  const yUnit = (-(rectPlane.top / rectPlane.height - hUnit / 2) - 0.5) * 2;

  const widthImg = plane.images[1].naturalWidth; //ширина изображения в условных еденицах
  const heightImg = plane.images[1].naturalHeight;

  let imageAspect = heightImg / widthImg;
  let a1;
  let a2;
  if (window.innerHeight / window.innerWidth > imageAspect) {
    a1 = (window.innerWidth / window.innerHeight) * imageAspect;
    a2 = 1;
  } else {
    a1 = 1;
    a2 = window.innerHeight / window.innerWidth / imageAspect;
  }

  plane.uniforms.uViewSize.value = [wUnit, hUnit];
  plane.uniforms.uPlanePosition.value = [xUnit, yUnit];
  // plane.uniforms.uMouse.value = [mousePosition.x, mousePosition.y];
  plane.uniforms.uResolution.value = [a1, a2];
  // console.log(plane.uniforms.uMouse.value);
}
