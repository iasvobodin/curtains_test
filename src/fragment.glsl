#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTextureCoord0;
varying vec2 vTextureCoord1;
varying float vProgress;

uniform sampler2D uSampler0;
uniform vec2 uResolution;
uniform sampler2D uSampler1;

void main() {
  vec2 scale = vec2(1. + (uResolution - 1.) * vProgress);
  vec2 newUV = (vTextureCoord0 - vec2(0.5) * vProgress) * scale + vec2(0.5) * vProgress;
  vec2 newUV1 = (vTextureCoord1 - vec2(0.5) * vProgress) * scale + vec2(0.5) * vProgress;
  vec4 tex1 = texture2D(uSampler0, newUV);
  vec4 tex2 = texture2D(uSampler1, newUV1);
  gl_FragColor = mix(tex1, tex2, vProgress);
}