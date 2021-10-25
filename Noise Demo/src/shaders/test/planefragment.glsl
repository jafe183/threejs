uniform float uTime;
uniform vec3 uLight;


varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

float getScartter(vec3 cameraPos, vec3 dir, vec3 lightPos, float d) {
    // light to ray origin
    vec3 q = cameraPos - lightPos;

    // coefficients
    float b = dot(dir, q);
    float c = dot(q, q);

    // evaluate integral
    float t = c - b*b;
    float s = 1.0 / sqrt(max(0.0001, t));
    float l = s * (atan( (d + b) * s) - atan( b * s));

    return pow(max(0.0, l/150.), 0.4);
}

void main()
{
    vec3 cameraToWorld = vPosition - cameraPosition;
    vec3 cameraToWorldDir = normalize(cameraToWorld);
    float cameraToWorldDistance = length(cameraToWorld);

    vec3 lightToWorldDir = normalize(uLight - vPosition);
    float diffusion = max(0., dot(vNormal, lightToWorldDir));
    float dist = length(uLight - vPosition);

    float scatter = getScartter(cameraPosition, cameraToWorldDir, uLight, cameraToWorldDistance);

    float final = scatter * diffusion;

    // gl_FragColor = vec4(1. - dist, 0, 0, 1);
    // gl_FragColor = vec4(diffusion , 0, 0, 1);
    gl_FragColor = vec4(scatter , 0, 0, 1);
    // gl_FragColor = vec4(final , 0, 0, 1);

    

}