import { Curtains } from "curtainsjs";
// import { vertex, fragment } from "/src/shader.js";
import anime from "animejs/lib/anime.es.js";
import vertex from "/src/vertex.glsl";
import fragment from "/src/fragment.glsl";

const curtains = new Curtains({
  container: "canvas",
  pixelRatio: 2, 
});
let animating = true;
const segments = 124;
const duration = 2000;
const params = {
  widthSegments: segments,
  heightSegments: segments,
  vertexShader: vertex,
  fragmentShader: fragment,
  fov: 75,
  autoloadSources: true,
  watchScroll:false,
  uniforms: {
    uTime: { name: "uTime", type: "1f", value: 0 },
    uViewSize: { name: "uViewSize", type: "2f", value: [] },
    uMouse: { name: "uMouse", type: "2f", value: [] },
    uPlanePosition: { name: "uPlanePosition", type: "2f", value: [] },
    uResolution: { name: "uResolution", type: "2f", value: [] },
    uProgress: { name: "uProgress", type: "1f", value: 0 }
  }
};
let images = document.getElementById("page-content");
for (let i = 0; i < images.children.length; i++) {

  let plane = curtains.addPlane(images.children[i], params);
  
    plane.onReady(() => getUnifors(i))

  const image = images.children[i].children[0];
  image.addEventListener("mousedown", e => newPlane(e,i));
}

function newPlane(e,i) {
  console.time("click");
      toFullscreen(i,e);
    // });
  // }
}
curtains.disableDrawing();
function toFullscreen(i,e) {

  let rectPlane = curtains.planes[i].getBoundingRect();
  const mouseNormalized = {
    x: e.offsetX / rectPlane.width * curtains.pixelRatio,
    // Allways invert Y coord
    y: 1 - e.offsetY / rectPlane.height * curtains.pixelRatio
  };
  curtains.planes[i].uniforms.uMouse.value = [mouseNormalized.x, mouseNormalized.y];

  if (animating === false) return;
  animating = false;
  let tl = anime.timeline({
    autoplay: false,
    easing: "linear"
  });
  tl.add({ targets: "#canvas", zIndex: 10, duration: 0 })
    .add({
      targets: curtains.planes[i].uniforms.uProgress,
      value: 1,
      delay: 0,
      duration: duration,
      easing: "cubicBezier(0.215, 0.61, 0.355, 1)",
      begin: function() {
        
        curtains.enableDrawing();
        curtains.planes[i].updatePosition();
      }
    })
    .add({
      targets: curtains.planes[i].uniforms.uProgress,
      value: 0,
      delay: 1500,
      easing:"cubicBezier(0.445, 0.05, 0.55, 0.95)",
      duration: duration,
      complete() {
        console.timeEnd("click");
        animating = true;
        curtains.disableDrawing();
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
function getUnifors(i) {
  let plane = curtains.planes[i];

  const rectPlane = plane.getBoundingRect();
  
  const wUnit = (window.innerWidth / rectPlane.width) * curtains.pixelRatio; //ширина плана в условных еденицах
  const hUnit = (window.innerHeight / rectPlane.height) * curtains.pixelRatio;
  
  const xUnit = (rectPlane.left / rectPlane.width - wUnit / 2 + 0.5) * 2;
  const yUnit = (-(rectPlane.top / rectPlane.height - hUnit / 2) - 0.5) * 2;
  
  const widthImg = plane.images[1].naturalWidth; //ширина изображения в условных еденицах
  const heightImg = plane.images[1].naturalHeight;
  
  let imageAspect = heightImg / widthImg;
  let a1, a2;
  if (window.innerHeight / window.innerWidth > imageAspect) {
    a1 = (window.innerWidth / window.innerHeight) * imageAspect;
    a2 = 1;
  } else {
    a1 = 1;
    a2 = window.innerHeight / window.innerWidth / imageAspect;
  }
  
  plane.uniforms.uViewSize.value = [wUnit, hUnit];
  plane.uniforms.uPlanePosition.value = [xUnit, yUnit];
  plane.uniforms.uResolution.value = [a1, a2];
}
