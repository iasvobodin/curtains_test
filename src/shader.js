export const vertex = `
#ifdef GL_ES
precision mediump float;
#endif

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform float uProgress;
uniform vec2 uPlanePosition;
uniform vec2 uViewSize;
uniform vec2 uResolution;
uniform vec2 uImgUnit;

uniform mat4 uTextureMatrix0;
uniform mat4 uTextureMatrix1;

varying vec3 vVertexPosition;
varying vec2 vTextureCoord0;
varying vec2 vTextureCoord1;
varying float vProgress;
varying vec2 scale;

void main() {
  
  float aspectW = uViewSize.x/uViewSize.y;
  float aspectI = uImgUnit.y/uImgUnit.x;


  float activation = aTextureCoord.x;
  
  float latestStart = 0.5;
  float startAt = activation * latestStart;
  float vertexProgress = smoothstep(startAt,1.,uProgress);
  

  vec3 pos = aVertexPosition.xyz;
  vec2 scale = vec2(1. + (uViewSize -1.) * vertexProgress);
  // pos.xy *= scale.xy;
  


  float flippedX = pos.y;
  pos.y = mix(pos.y,flippedX, vertexProgress);
  pos.z += vertexProgress;
  
  // Move towards center 
  // pos.x += -uPlanePosition.x * vertexProgress;
  // pos.y += -uPlanePosition.y * vertexProgress;
  
  //свои придумки)))
  
  
mat3 matrix = mat3(
  (1. + (uViewSize -1.) * vertexProgress).x, 0.0, -uPlanePosition.x * vertexProgress,
  0.0, (1. + (uViewSize -1.) * vertexProgress).y, -uPlanePosition.y * vertexProgress,
  0.0, 0.0, 1.0
);


mat3 matrixT = mat3(
  (1. + (aspectW -1.) * vertexProgress), 0.0,0.,
  0.0, 1., -aspectW/2. * vertexProgress,
  0.0, 0.0, 1.0
);

  gl_Position =  uPMatrix * uMVMatrix * vec4(pos*matrix, 1.);
  vProgress = vertexProgress;
  vTextureCoord0 = (uTextureMatrix0 * vec4(aTextureCoord, 0.0, 1.0)).xy;
  vTextureCoord1 = vec2(aTextureCoord.x , aTextureCoord.y);
  vVertexPosition = pos;
}
`;

export const fragment = `
#ifdef GL_ES
precision mediump float;
#endif

varying vec3 vVertexPosition;
varying vec2 vTextureCoord0;
varying vec2 vTextureCoord1;
varying float vProgress;
uniform vec2 uViewSize; // вьюпорт в условных еденицах
varying vec2 scale;
varying vec2 st;

uniform float uTime;
uniform float uProgress;
uniform vec2 uPlaneSize;

uniform sampler2D uSampler0;
uniform vec2 uResolution;
uniform sampler2D uSampler1;
uniform vec2 uImgUnit;

void main() {

  float aspectW = uViewSize.x/uViewSize.y;

vec4 tex1 = texture2D(uSampler0, vTextureCoord0);
vec4 tex2 = texture2D(uSampler1, vec2(vTextureCoord1.x , vTextureCoord1.y));
gl_FragColor = mix(tex1,tex2, uProgress);
// gl_FragColor = texture2D(uSampler0, vTextureCoord1);
// gl_FragColor = vec4(vTextureCoord1.x,vTextureCoord1.y,0.0,1.);
}
`;
