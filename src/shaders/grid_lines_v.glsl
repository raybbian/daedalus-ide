attribute vec4 aVertexPosition;
varying vec2 vPosition;
void main(void) {
    vPosition = aVertexPosition.xy;
    gl_Position = aVertexPosition;
}
