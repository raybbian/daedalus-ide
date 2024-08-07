precision mediump float;
varying vec2 vPosition;
uniform vec2 uResolution;
uniform vec2 uPos;
uniform float uUnitLen;
void main(void) {
    vec2 worldPos = (vPosition + 1.0) * 0.5 * uResolution - vec2(uPos.x, uResolution.y - uPos.y);
    if (mod(worldPos.x, uUnitLen) <= 1.0 || mod(worldPos.y, uUnitLen) <= 1.0) {
        gl_FragColor = vec4(0.2, 0.2, 0.2, 1.0); // Color based on position
    }
}
