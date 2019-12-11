#ifdef GL_ES
precision mediump float;
#endif

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform float uProgress;
uniform float uSeed;
uniform vec2 uPlanePosition;
uniform vec2 uViewSize;
uniform vec2 uResolution;
uniform vec2 uMouse;

uniform mat4 uTextureMatrix0;
uniform mat4 uTextureMatrix1;

varying vec2 vTextureCoord0;
varying vec2 vTextureCoord1;
varying float vProgress;


float getActivation(vec2 uv) {
  vec2 point = vec2(uMouse.x,uMouse.x)-vec2(1.5);
        float maxDistance = distance(point, 1.-floor(point+1.));
        float dist = smoothstep(0.,maxDistance,distance(point,uv));
        return dist;
}

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {

  float activation = getActivation(aTextureCoord);

  float latestStart = 0.9;
  float startAt = activation * latestStart;
  float vertexProgress = smoothstep(startAt, 1., uProgress);

  vec3 pos = aVertexPosition.xyz;
  vec2 scale = vec2(1. + (uViewSize - 1.) * vertexProgress);

  // float flippedX = pos.x;
  // pos.x = mix(pos.x, flippedX, vertexProgress);
 pos.z += vertexProgress;


vec3 transformedPos = pos;
// vertexProgress = uProgress

float simplexProgress = min(clamp((vertexProgress) / 0.5,0.,1.),clamp((1.-vertexProgress) / (1.-0.5),0.,1.));
      simplexProgress = smoothstep(0.,1.,simplexProgress);
      float noiseX = snoise(vec2(transformedPos.x +uSeed, transformedPos.y + uSeed + simplexProgress * 1.) * 0.2 ) ;
      float noiseY = snoise(vec2(transformedPos.y +uSeed, transformedPos.x + uSeed + simplexProgress * 1.) * 0.2) ;
      transformedPos.x += 0.3 * noiseX * simplexProgress;
      transformedPos.y += 0.3 * noiseY * simplexProgress;

// pos = transformedPos;


  mat3 matrix = mat3(
    scale.x, 0.0, -uPlanePosition.x * vertexProgress,
    0.0, scale.y, -uPlanePosition.y * vertexProgress,
    0.0, 0.0, 1.0
  );





  gl_Position = uPMatrix * uMVMatrix * vec4(pos * matrix, 1.);
  vProgress = vertexProgress;
  vTextureCoord0 = (uTextureMatrix0 * vec4(aTextureCoord, 0.0, 1.0)).xy;
  vTextureCoord1 = (uTextureMatrix1 * vec4(aTextureCoord, 0.0, 1.0)).xy;
}