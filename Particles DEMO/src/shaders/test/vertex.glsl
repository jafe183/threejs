uniform float uMove;
uniform float uTime;
uniform vec2 uCursor;
uniform float uPress;
uniform float uRelease;

attribute float aSpeed;
attribute float aOffset;
attribute float aDirection;
attribute float aOpacity;

varying vec2 vUv;
varying vec3 vPos;
varying float vOpacity;

void main() {
    vec3 pos = position;

    // Exploding
    pos.x += sin(uMove*aSpeed*0.5)*1.;
    pos.y += sin(uMove*aSpeed*0.5)*1.;
    pos.z = mod(position.z + uMove*aSpeed + aOffset, 200.)-100.;

    vec3 stable = position;
    float dist = distance(stable.xy, uCursor); 
    float area = 1. - smoothstep(0., 10., dist);

    stable.x += 3. *sin(uTime* 10. *aSpeed)*aDirection * area * uRelease;
    stable.y += 3. *sin(uTime*10. *aSpeed)*aDirection * area * uRelease;
    stable.z += 3. *cos(uTime*10. *aSpeed)*aDirection * area * uRelease;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 400. * (1. / - mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    vPos = pos;
    vOpacity = aOpacity;
}