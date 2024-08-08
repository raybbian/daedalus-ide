attribute vec4 aVertexPosition;
attribute vec2 aInstancePosition;
attribute vec4 aInstanceColor;

uniform vec2 uResolution;
uniform vec2 uPos;
uniform float uUnitLen;

varying vec4 vColor;

void main(void) {
    vec2 worldPos = -1.0 * aInstancePosition * uUnitLen - uPos - vec2(uUnitLen / 2.0, uUnitLen / 2.0);
    vec2 uv = (aVertexPosition.xy * uUnitLen * 0.5 - worldPos) / uResolution * 2.0 - 1.0;
    vColor = aInstanceColor;
    gl_Position = vec4(uv * vec2(1.0, -1.0), 0.0, 1.0);
}
