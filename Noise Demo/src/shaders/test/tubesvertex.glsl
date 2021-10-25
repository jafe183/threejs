varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main()
{
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vWorldPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;

    vUv = uv;
    vPosition = position;
    vNormal = normal;
}