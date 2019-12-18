//#version 310 es
#ifdef GL_ES
precision mediump float;
#endif
#extension GL_OES_standard_derivatives : enable

varying vec2 vTextureCoord0;
varying vec2 vTextureCoord1;
varying float vProgress;
varying vec3 vNormal;

uniform vec2 uResolution;
uniform float uProgress;

uniform sampler2D uSampler0;
uniform sampler2D uSampler1;

void main() {
  vec3 normal = normalize(cross(dFdx(vNormal),dFdy(vNormal)));
  vec3 light = vec3(0.,0.,1.);
  vec3 prod = clamp(cross(normal,light), 0., 1.0);
  vec2 scale = vec2(1. + (uResolution - 1.) * vProgress);
  vec2 newUV = (vTextureCoord0 - vec2(0.5) * vProgress) * scale + vec2(0.5) * vProgress;
  vec2 newUV1 = (vTextureCoord1 - vec2(0.5) * vProgress) * scale + vec2(0.5) * vProgress;
  vec4 tex1 = texture2D(uSampler0, newUV);
  vec4 tex2 = texture2D(uSampler1, newUV1);
  vec4 tex2norm = vec4(tex2.rgb*(1. -  prod.r/7. - prod.g/7. - prod.g/7.),1.);
  vec4 tex1norm = vec4(tex1.rgb*(1. -  prod.r/7. - prod.g/7. - prod.g/7.),1.);
  gl_FragColor = mix(tex1, tex2,vProgress);
  gl_FragColor = mix(vec4(prod,1.),tex1, 0.5);
  gl_FragColor = tex1norm;
  gl_FragColor = vec4(prod, 1.);
  gl_FragColor = mix(tex1norm, tex2norm,vProgress);
}