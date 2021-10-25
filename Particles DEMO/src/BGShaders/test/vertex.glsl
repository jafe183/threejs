uniform vec2 uFrequency;
uniform float uTime;

attribute float aRandom;
// attribute vec2 uv;
attribute float opacity;

varying float vRandom;
varying vec2 vUV;
varying float vElevation;
varying float vOpacity;


void main()
{   
vec4 modelPosition = modelMatrix * vec4(position, 1.0);

float elevation = sin(modelPosition.y * uFrequency.y - uTime) * 0.1 + sin(modelPosition.x * uFrequency.x - uTime) * 0.1; 

// modelPosition.z += elevation; 
// modelPosition.z += sin(modelPosition.x * uFrequency.x - uTime) * 1.;
// modelPosition.z += aRandom * 0.1;

vec4 viewPosition = viewMatrix * modelPosition;
vec4 projectedPosition = projectionMatrix * viewPosition;

gl_PointSize = 5500. * (1. / - viewPosition.z);
gl_Position = projectedPosition;

vRandom = aRandom;
vUV = uv;
vElevation = elevation;
vOpacity = opacity;
}