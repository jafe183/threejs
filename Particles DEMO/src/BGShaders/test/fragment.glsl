precision mediump float;

uniform vec3 uColor;
uniform sampler2D uTexture;

varying float vRandom;
varying vec2 vUV;
varying float vElevation;
varying float vOpacity;

void main()
{
    vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
    vec2 cUV = uv - 0.5; // The centre

    vec3 orginalColor = vec3(4./255., 10./255., 10./255.); // The magic Blue Color
    vec4 color = vec4(0.02/length(cUV)); // So that each pixels becomes a round particles 

    color.rgb *= orginalColor * 120.;

    // color *= vOpacity; // Randomness of brightness 

    float disc = length(cUV);
    gl_FragColor = vec4(1. - disc, 0, 0, 1);

    gl_FragColor = color;
    gl_FragColor.a *= vOpacity * 2.; // Randomness of brightness 
}