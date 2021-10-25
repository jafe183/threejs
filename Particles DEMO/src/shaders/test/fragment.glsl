uniform sampler2D mask;
uniform sampler2D uTexture;

varying vec2 vUv;
varying vec3 vPos;
varying float vOpacity;

void main(){

    vec2 uv = vec2(gl_PointCoord.x, 1. - gl_PointCoord.y);
    vec4 maskTexture = texture2D(mask, gl_PointCoord);
    vec4 texture = texture2D(uTexture, uv);

    float alpha = 1. - clamp(abs(vPos.z/55.), 0., 1.); // So that the particles will gradually become transparent when come near the camera (alpha = 1 when z = 0, and 0 when z = camera.z)
    // gl_FragColor = vec4(1. , 1., 1., 0.4 );

    gl_FragColor = maskTexture * texture;
    gl_FragColor.a *= maskTexture.r * alpha * vOpacity * 1.5;
    // gl_FragColor = vec4(1., 1., 1., 1);
}