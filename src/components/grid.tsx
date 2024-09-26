import { colorToVec3, GridMap, PixelColor } from "@/scripts/daedalus";
import {
    useEffect,
    useRef,
    useState,
    MutableRefObject,
    MouseEvent as ReactMouseEvent,
    Dispatch,
    SetStateAction,
} from "react";
import gridLineVertShader from "@/shaders/grid_lines_v.glsl";
import gridLineFragShader from "@/shaders/grid_lines_f.glsl";
import pixelVertShader from "@/shaders/grid_pixel_v.glsl";
import pixelFragShader from "@/shaders/grid_pixel_f.glsl";
import { DrawContext } from "@/scripts/draw_context";
import Toolbar from "@/components/toolbar";
import { IdeConfig } from "@/scripts/config";

export function getGridAt(
    atPos: [number, number],
    pos: [number, number],
    unitLen: number,
): [number, number] {
    const x = Math.floor((atPos[0] - pos[0]) / unitLen);
    const y = Math.floor((atPos[1] - pos[1]) / unitLen);
    return [x, y];
}

// function getTLOf(grid_pos: [number, number], pos: [number, number], unitLen: number): [number, number] {
// 	const x = grid_pos[0] * unitLen + pos[0];
// 	const y = grid_pos[1] * unitLen + pos[1];
// 	return [x, y];
// }

export function updateGLUnitLen(
    gl: WebGL2RenderingContext | null,
    unitLen: number,
    programs: (WebGLProgram | null)[],
) {
    if (gl == null) return;
    programs.forEach((program) => {
        if (program == null) return;

        gl.useProgram(program);
        const uUnitLen = gl.getUniformLocation(program, "uUnitLen");
        gl.uniform1f(uUnitLen, unitLen);
    });
}

function updateGLPos(
    gl: WebGL2RenderingContext | null,
    pos: [number, number],
    programs: (WebGLProgram | null)[],
) {
    if (gl == null) return;
    programs.forEach((program) => {
        if (program == null) return;

        gl.useProgram(program);
        let uPos = gl.getUniformLocation(program, "uPos");
        gl.uniform2f(uPos, pos[0], pos[1]);
    });
}

export function renderGrid(
    gl: WebGL2RenderingContext | null,
    lineProgram: WebGLProgram | null,
    pixelProgram: WebGLProgram | null,
    gridItems: GridMap,
    pixelsChanged: boolean,
) {
    if (gl == null || lineProgram == null || pixelProgram == null) return;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(lineProgram);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.useProgram(pixelProgram);

    if (pixelsChanged) {
        let pixelData = new Float32Array(gridItems.size * 6);
        let i = 0;
        gridItems.forEach((col, loc) => {
            let pos = loc.split("_").map((num) => parseInt(num));
            pixelData[i++] = pos[0];
            pixelData[i++] = pos[1];
            const vec3col = colorToVec3(col);
            pixelData[i++] = vec3col[0];
            pixelData[i++] = vec3col[1];
            pixelData[i++] = vec3col[2];
            pixelData[i++] = 1.0;
        });
        gl.bufferData(gl.ARRAY_BUFFER, pixelData, gl.DYNAMIC_DRAW);
    }
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, gridItems.size);
}

const minUnitLen = 15;
const maxUnitLen = 200;
export const defaultUnitLen = 40;

export type GridMouseHandler = (
    pos: [number, number],
    e: ReactMouseEvent<HTMLDivElement, MouseEvent>,
) => void;

export default function Grid({
    drawCtxRef,
    glRef,
    lineProgramRef,
    pixelProgramRef,
    onMouseDown,
    onMouseGrid,
    setSettingsOpen,
    selectedInstruction,
    ideConfig,
    ioRef,
}: {
    drawCtxRef: MutableRefObject<DrawContext>;
    glRef: MutableRefObject<WebGL2RenderingContext | null>;
    lineProgramRef: MutableRefObject<WebGLProgram | null>;
    pixelProgramRef: MutableRefObject<WebGLProgram | null>;
    onMouseDown: GridMouseHandler;
    onMouseGrid: GridMouseHandler;
    setSettingsOpen: Dispatch<SetStateAction<boolean>>;
    selectedInstruction: PixelColor;
    ideConfig: IdeConfig;
    ioRef: MutableRefObject<HTMLCanvasElement | null>;
}) {
    // position of mouse and mouse interaction
    const [dragging, setDragging] = useState(false);
    const prevMousePos = useRef<[number, number] | null>(null);
    const [curMouseGrid, setCurMouseGrid] = useState<[number, number]>([0, 0]);

    // offsets and scale for grid
    const unitLen = useRef(defaultUnitLen);
    const pos = useRef<[number, number]>([0, 0]);

    const guiOffset = useRef<[number, number]>([0, 0]);
    const gridCanvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        function initWebGL() {
            const canvas = gridCanvasRef.current;
            if (canvas == null) return;

            glRef.current = canvas.getContext("webgl2");
            const gl = glRef.current;
            if (gl == null) {
                console.error("WebGL not supported");
                return;
            }

            function initShaderProgram(
                gl: WebGL2RenderingContext,
                vertexShaderSrc: string,
                fragmentShaderSrc: string,
            ): WebGLProgram | null {
                function loadShader(
                    type: GLenum,
                    source: string,
                ): WebGLShader | null {
                    if (gl == null) return null;
                    const shader = gl.createShader(type);
                    if (shader == null) {
                        console.log("Failed to create shader " + shader);
                        return null;
                    }
                    gl.shaderSource(shader, source);
                    gl.compileShader(shader);
                    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                        console.error(
                            "An error occurred compiling the shaders: " +
                                gl.getShaderInfoLog(shader),
                        );
                        gl.deleteShader(shader);
                        return null;
                    }
                    return shader;
                }

                const vertShader = loadShader(
                    gl.VERTEX_SHADER,
                    vertexShaderSrc,
                );
                const fragShader = loadShader(
                    gl.FRAGMENT_SHADER,
                    fragmentShaderSrc,
                );
                if (vertShader == null || fragShader == null) return null;

                const program = gl.createProgram();
                if (program == null) {
                    console.error("Failed to create shader program");
                    return null;
                }

                gl.attachShader(program, vertShader);
                gl.attachShader(program, fragShader);
                gl.linkProgram(program);

                if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                    console.error(
                        "Unable to initialize the shader program: " +
                            gl.getProgramInfoLog(program),
                    );
                    return null;
                }

                gl.deleteShader(vertShader);
                gl.deleteShader(fragShader);

                return program;
            }

            lineProgramRef.current = initShaderProgram(
                gl,
                gridLineVertShader,
                gridLineFragShader,
            );
            pixelProgramRef.current = initShaderProgram(
                gl,
                pixelVertShader,
                pixelFragShader,
            );
            const lineProgram = lineProgramRef.current;
            const pixelProgram = pixelProgramRef.current;
            if (lineProgram == null || pixelProgram == null) return;

            function initLineProgram() {
                if (gl == null || lineProgram == null) return;
                gl.useProgram(lineProgram);
                const vertices = new Float32Array([
                    -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, -1.0,
                ]);

                let vertexBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
                const aVertexPosition = gl.getAttribLocation(
                    lineProgram,
                    "aVertexPosition",
                );
                gl.vertexAttribPointer(
                    aVertexPosition,
                    2,
                    gl.FLOAT,
                    false,
                    0,
                    0,
                );
                gl.enableVertexAttribArray(aVertexPosition);
            }
            initLineProgram();

            function initPixelProgram() {
                if (gl == null || pixelProgram == null) return;
                gl.useProgram(pixelProgram);

                //initialize the pixel to be instanced
                const vertexBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
                const aVertexPosition = gl.getAttribLocation(
                    pixelProgram,
                    "aVertexPosition",
                );
                gl.vertexAttribPointer(
                    aVertexPosition,
                    2,
                    gl.FLOAT,
                    false,
                    0,
                    0,
                );
                gl.enableVertexAttribArray(aVertexPosition);
                const vertices = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0];
                gl.bufferData(
                    gl.ARRAY_BUFFER,
                    new Float32Array(vertices),
                    gl.STATIC_DRAW,
                );

                // initialize the instance array
                const instanceBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
                const aInstancePosition = gl.getAttribLocation(
                    pixelProgram,
                    "aInstancePosition",
                );
                gl.vertexAttribPointer(
                    aInstancePosition,
                    2,
                    gl.FLOAT,
                    false,
                    24,
                    0,
                );
                gl.vertexAttribDivisor(aInstancePosition, 1); // This makes it an instanced attribute
                gl.enableVertexAttribArray(aInstancePosition);
                const aInstanceColor = gl.getAttribLocation(
                    pixelProgram,
                    "aInstanceColor",
                );
                gl.vertexAttribPointer(
                    aInstanceColor,
                    4,
                    gl.FLOAT,
                    false,
                    24,
                    8,
                );
                gl.vertexAttribDivisor(aInstanceColor, 1); // This makes it an instanced attribute
                gl.enableVertexAttribArray(aInstanceColor);
            }
            initPixelProgram();

            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        }

        function handleResize() {
            const canvas = gridCanvasRef.current;
            const gl = glRef.current;
            const lineProgram = lineProgramRef.current;
            const pixelProgram = pixelProgramRef.current;
            if (
                canvas == null ||
                gl == null ||
                lineProgram == null ||
                pixelProgram == null
            )
                return;
            if (
                canvas.width != canvas.clientWidth ||
                canvas.width != canvas.clientHeight
            ) {
                const box = canvas.getBoundingClientRect();
                guiOffset.current = [box.left, box.top];

                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;
                gl.viewport(
                    0,
                    0,
                    gl.drawingBufferWidth,
                    gl.drawingBufferHeight,
                );

                gl.useProgram(lineProgram);
                let uResolution = gl.getUniformLocation(
                    lineProgram,
                    "uResolution",
                );
                gl.uniform2f(uResolution, canvas.width, canvas.height);

                gl.useProgram(pixelProgram);
                uResolution = gl.getUniformLocation(
                    pixelProgram,
                    "uResolution",
                );
                gl.uniform2f(uResolution, canvas.width, canvas.height);

                requestAnimationFrame(() =>
                    renderGrid(
                        gl,
                        lineProgram,
                        pixelProgram,
                        drawCtxRef.current.gridMap,
                        false,
                    ),
                );
            }
        }

        window.addEventListener("resize", handleResize);
        initWebGL();

        updateGLUnitLen(glRef.current, defaultUnitLen, [
            lineProgramRef.current,
            pixelProgramRef.current,
        ]);
        updateGLPos(
            glRef.current,
            [0, 0],
            [lineProgramRef.current, pixelProgramRef.current],
        );

        requestAnimationFrame(() =>
            renderGrid(
                glRef.current,
                lineProgramRef.current,
                pixelProgramRef.current,
                drawCtxRef.current.gridMap,
                true,
            ),
        );

        handleResize();

        return () => window.removeEventListener("resize", handleResize);
    }, [drawCtxRef, glRef, lineProgramRef, pixelProgramRef]);

    return (
        <div
            // ref={canvasRef}
            className={`w-full h-full bg-daedalus15 relative ${dragging && "cursor-grabbing"} overflow-hidden relative grid place-items-center`}
            onMouseDown={(e) => {
                if (e.button == 1) {
                    e.preventDefault();
                    setDragging(true);
                }
                onMouseDown(curMouseGrid, e);
            }}
            onMouseUp={(e) => {
                if (e.button == 1) {
                    e.preventDefault();
                    setDragging(false);
                    prevMousePos.current = null;
                }
            }}
            onMouseLeave={(_) => {
                setDragging(false);
                prevMousePos.current = null;
            }}
            onMouseMove={(e) => {
                if (!gridCanvasRef.current) return;
                const mouseX = e.pageX - guiOffset.current[0];
                const mouseY = e.pageY - guiOffset.current[1];

                if (dragging) {
                    let deltaX = 0;
                    let deltaY = 0;
                    if (prevMousePos.current != null) {
                        deltaX = mouseX - prevMousePos.current[0];
                        deltaY = mouseY - prevMousePos.current[1];
                    }
                    prevMousePos.current = [mouseX, mouseY];
                    pos.current = [
                        pos.current[0] + deltaX,
                        pos.current[1] + deltaY,
                    ];
                    updateGLPos(glRef.current, pos.current, [
                        lineProgramRef.current,
                        pixelProgramRef.current,
                    ]);

                    requestAnimationFrame(() =>
                        renderGrid(
                            glRef.current,
                            lineProgramRef.current,
                            pixelProgramRef.current,
                            drawCtxRef.current.gridMap,
                            false,
                        ),
                    );
                } else {
                    const newMouseGrid = getGridAt(
                        [mouseX, mouseY],
                        pos.current,
                        unitLen.current,
                    );
                    if (
                        curMouseGrid[0] != newMouseGrid[0] ||
                        curMouseGrid[1] != newMouseGrid[1]
                    ) {
                        setCurMouseGrid(newMouseGrid);
                        onMouseGrid(newMouseGrid, e);
                    }
                }
            }}
            onWheel={(e) => {
                const newUnitLen = unitLen.current - e.deltaY * 0.1;
                if (newUnitLen < minUnitLen || newUnitLen > maxUnitLen) return;
                const ratio = unitLen.current - newUnitLen;
                unitLen.current = newUnitLen;
                pos.current = [
                    pos.current[0] + ratio * curMouseGrid[0],
                    pos.current[1] + ratio * curMouseGrid[1],
                ];

                updateGLUnitLen(glRef.current, unitLen.current, [
                    lineProgramRef.current,
                    pixelProgramRef.current,
                ]);
                updateGLPos(glRef.current, pos.current, [
                    lineProgramRef.current,
                    pixelProgramRef.current,
                ]);

                requestAnimationFrame(() =>
                    renderGrid(
                        glRef.current,
                        lineProgramRef.current,
                        pixelProgramRef.current,
                        drawCtxRef.current.gridMap,
                        false,
                    ),
                );
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                return false;
            }}
        >
            <div className="absolute left-4 bottom-2">
                x: {curMouseGrid[0]} y: {curMouseGrid[1]}
            </div>
            <canvas
                width={500}
                height={300}
                className={"w-full h-full"}
                ref={gridCanvasRef}
            />
            <div className="absolute bottom-8">
                <Toolbar
                    setSettingsOpen={setSettingsOpen}
                    selectedInstruction={selectedInstruction}
                    ideConfig={ideConfig}
                    updateUnitLen={(nUnitLen: number) => {
                        updateGLUnitLen(glRef.current, nUnitLen, [
                            lineProgramRef.current,
                            pixelProgramRef.current,
                        ]);
                        unitLen.current = nUnitLen;
                    }}
                    updatePos={(nPos: [number, number]) => {
                        updateGLPos(glRef.current, nPos, [
                            lineProgramRef.current,
                            pixelProgramRef.current,
                        ]);
                        pos.current = nPos;
                    }}
                    render={(changedPixels: boolean) => {
                        requestAnimationFrame(() =>
                            renderGrid(
                                glRef.current,
                                lineProgramRef.current,
                                pixelProgramRef.current,
                                drawCtxRef.current.gridMap,
                                changedPixels,
                            ),
                        );
                    }}
                    ioRef={ioRef}
                    drawCtxRef={drawCtxRef}
                />
            </div>
        </div>
    );
}
