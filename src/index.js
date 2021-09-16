import { Curtains, Plane } from "curtainsjs";
// import { vertex, fragment } from "/src/shader.js";
import anime from "animejs/lib/anime.es.js";
import vertex from "/src/vertex.glsl";
import fragment from "/src/fragment.glsl";
// let der = gl.getExtension("OES_standard_derivatives");
let planeWrap = document.getElementById("page-content"),
  webgl = document.getElementById("canvas"),
  curtains = new Curtains({
    container: webgl,
    pixelRatio: window.devicePixelRatio
  });
// curtains.glContext.getExtension("OES_standard_derivatives");
// curtains.glContext.getExtension("EXT_shader_texture_lod");
// console.log(curtains);
let mouseNormalized = { x: 0, y: 0 },
  animating = true,
  segments = 128,
  duration = 1600,
  params = {
    widthSegments: segments,
    heightSegments: segments,
    vertexShader: vertex,
    fragmentShader: fragment,
    fov: 180,
    autoloadSources: true,
    uniforms: {
      uTime: { name: "uTime", type: "1f", value: 0 },
      uViewSize: { name: "uViewSize", type: "2f", value: [] },
      uMouse: { name: "uMouse", type: "2f", value: [] },
      uPlanePosition: { name: "uPlanePosition", type: "2f", value: [] },
      uResolution: { name: "uResolution", type: "2f", value: [] },
      uProgress: { name: "uProgress", type: "1f", value: 0 }
    }
  };
// document.addEventListener("scroll", e => console.log(e));
// curtains.disableDrawing();
for (let i = 0; i < planeWrap.children.length; i++) {
  let plane = new Plane(curtains, planeWrap.children[i], params) 
  // curtains.addPlane(planeWrap.children[i], params);
  plane.onReady(() => {
    plane.htmlElement.addEventListener("mousedown", () => toFullscreen(plane));
    plane.htmlElement.addEventListener("mousemove", e => mouseEv(e, plane));
    plane.htmlElement.addEventListener("touchmove", e => mouseEv(e, plane));
  });
}

function mouseEv(e, plane) {
  const rectPlane = plane.getBoundingRect();
  if (e.targetTouches) {
    mouseNormalized.x =
      (e.targetTouches[0].offsetX / rectPlane.width) * curtains.pixelRatio;
    mouseNormalized.y =
      1 - (e.targetTouches[0].offsetY / rectPlane.height) * curtains.pixelRatio;
  } else {
    mouseNormalized.x = (e.offsetX / rectPlane.width) * curtains.pixelRatio;
    mouseNormalized.y =
      1 - (e.offsetY / rectPlane.height) * curtains.pixelRatio;
  }
}

function toFullscreen(plane) {
  getUnifors(plane);

  if (animating === false) return;
  animating = false;
  let tl = anime.timeline({ autoplay: false, easing: "linear" });
  tl
  // .add({ targets: webgl, zIndex: 10, duration: 0 })
    // .add(
    //   {
    //     targets: plane.htmlElement,
    //     delay: 100,
    //     opacity: 0,
    //     duration: 100
    //   },
    //   "+=200"
    // )
    .add(
      {
        targets: plane.uniforms.uProgress,
        value: 1,
        delay: 0,
        duration: duration,
        easing: "cubicBezier(0.215, 0.61, 0.355, 1)",
        begin: function() {
          // curtains.enableDrawing();
        }
      },
      "-=200"
    )
    .add({
      targets: plane.uniforms.uProgress,
      value: 0,
      delay: 1500,
      easing: "cubicBezier(0.445, 0.05, 0.55, 0.95)",
      duration: duration,
      complete() {
        // console.timeEnd("click");
        animating = true;
        // curtains.disableDrawing();
      }
    })
    // .add({ targets: webgl, delay: 1, zIndex: -10, duration: 0 });
  tl.play();
}

function getUnifors(plane) {
  const rectPlane = plane.getBoundingRect();
  //ширина плана в условных еденицах
  const wUnit = (window.innerWidth / rectPlane.width) * curtains.pixelRatio;
  const hUnit = (window.innerHeight / rectPlane.height) * curtains.pixelRatio;
  // вектор для перемещения плана при увеличении до размера окна
  const xUnit = (rectPlane.left / rectPlane.width - wUnit / 2 + 0.5) * 2;
  const yUnit = (-(rectPlane.top / rectPlane.height - hUnit / 2) - 0.5) * 2;
  //параметры изображения в пикселях
  const widthImg = plane.images[1].naturalWidth;
  const heightImg = plane.images[1].naturalHeight;

  let imageAspect = heightImg / widthImg;
  // считаем вестор для нормализации изображения в шейдере
  let xNormalized, yNormalized;
  if (window.innerHeight / window.innerWidth > imageAspect) {
    xNormalized = (window.innerWidth / window.innerHeight) * imageAspect;
    yNormalized = 1;
  } else {
    xNormalized = 1;
    yNormalized = window.innerHeight / window.innerWidth / imageAspect;
  }

  plane.uniforms.uViewSize.value = [wUnit, hUnit];
  plane.uniforms.uPlanePosition.value = [xUnit, yUnit];
  plane.uniforms.uResolution.value = [xNormalized, yNormalized];
  plane.uniforms.uMouse.value = [mouseNormalized.x, mouseNormalized.y];
}
