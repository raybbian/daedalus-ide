import { GridMap } from "@/types/daedalus";
import { MouseEventHandler, Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import vertexShaderSource from "@/shaders/grid_lines_v.glsl";
import fragmentShaderSource from "@/shaders/grid_lines_f.glsl";

export default function Grid({ gridItems, setGridItems, onMouseDown, onMouseUp, onMouseMove }: {
	gridItems: GridMap,
	setGridItems: Dispatch<SetStateAction<GridMap>>,
	onMouseDown?: MouseEventHandler<HTMLDivElement>,
	onMouseUp?: MouseEventHandler<HTMLDivElement>,
	onMouseMove?: MouseEventHandler<HTMLDivElement>,
}) {
	const [pos, setPos] = useState<[number, number]>([0, 0]);
	const [dragging, setDragging] = useState(false);
	const [prevMousePos, setPrevMousePos] = useState<[number, number] | null>(null);
	const [curMousePos, setCurMousePos] = useState<[number, number]>([0, 0]);
	const [unitLen, setUnitLen] = useState(50);
	const minUnitLen = 15;
	const maxUnitLen = 200;

	// const canvasRef = useRef<HTMLDivElement | null>(null);
	// const [gridLines, setGridLines] = useState<React.JSX.Element[]>([]);

	function getGridAt(at_pos: [number, number]): [number, number] {
		const x = Math.floor((at_pos[0] - pos[0]) / unitLen);
		const y = Math.floor((at_pos[1] - pos[1]) / unitLen);
		return [x, y];
	}

	function getTLOf(grid_pos: [number, number]): [number, number] {
		const x = grid_pos[0] * unitLen + pos[0];
		const y = grid_pos[1] * unitLen + pos[1];
		return [x, y];
	}

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const programRef = useRef<WebGLProgram | null>(null);
	const glRef = useRef<WebGLRenderingContext | null>(null);

	function render() {
		const gl = glRef.current;
		if (gl == null) return;

		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}

	function initWebGL() {
		const canvas = canvasRef.current;
		if (canvas == null) return;

		glRef.current = canvas.getContext('webgl');
		const gl = glRef.current;
		if (gl == null) {
			console.error('WebGL not supported');
			return;
		}

		// Initialize shaders
		function loadShader(type: GLenum, source: string): WebGLShader | null {
			if (gl == null) return null;
			const shader = gl.createShader(type);
			if (shader == null) {
				console.log("Failed to create shader " + shader);
				return null;
			}
			gl.shaderSource(shader, source);
			gl.compileShader(shader);
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
				gl.deleteShader(shader);
				return null;
			}
			return shader;
		};

		const gridLinesVert = loadShader(gl.VERTEX_SHADER, vertexShaderSource);
		const gridLinesFrag = loadShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
		if (gridLinesVert == null || gridLinesFrag == null) return;

		programRef.current = gl.createProgram();
		const shaderProgram = programRef.current;
		if (shaderProgram == null) {
			console.error("Failed to create shader program");
			return;
		}

		gl.attachShader(shaderProgram, gridLinesVert);
		gl.attachShader(shaderProgram, gridLinesFrag);
		gl.linkProgram(shaderProgram);

		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
			return;
		}

		gl.useProgram(shaderProgram);

		// Set up the vertices
		const vertices = new Float32Array([
			-1.0, 1.0,
			-1.0, -1.0,
			1.0, 1.0,
			1.0, -1.0,
		]);

		const vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

		const aVertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
		gl.enableVertexAttribArray(aVertexPosition);
		gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);
	}

	useEffect(() => {
		function handleResize() {
			const canvas = canvasRef.current;
			const gl = glRef.current;
			const program = programRef.current;
			if (canvas == null || gl == null || program == null) return;
			if (canvas.width != canvas.clientWidth || canvas.width != canvas.clientHeight) {
				canvas.width = canvas.clientWidth;
				canvas.height = canvas.clientHeight;
				gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
				const uResolution = gl.getUniformLocation(program, 'uResolution');
				gl.uniform2f(uResolution, canvas.width, canvas.height);
				requestAnimationFrame(render);
			}
		}

		window.addEventListener('resize', handleResize);
		initWebGL();
		handleResize();
		updateUnitLen(unitLen);
		updatePos(pos);

		return () => window.removeEventListener('resize', handleResize);
	}, []);

	function updateUnitLen(newUnitLen: number) {
		setUnitLen(newUnitLen);
		const gl = glRef.current;
		const program = programRef.current;
		if (gl == null || program == null) return;
		const uUnitLen = gl.getUniformLocation(program, 'uUnitLen');
		gl.uniform1f(uUnitLen, newUnitLen);
		requestAnimationFrame(render);
	}

	function updatePos(newPos: [number, number]) {
		setPos(newPos);
		const gl = glRef.current;
		const program = programRef.current;
		if (gl == null || program == null) return;
		const uPos = gl.getUniformLocation(program, 'uPos');
		gl.uniform2f(uPos, newPos[0], newPos[1]);
		requestAnimationFrame(render);
	}

	return (
		<div
			// ref={canvasRef}
			className={`w-full h-full bg-daedalus15 relative ${dragging && "cursor-grabbing"} overflow-hidden`}
			onMouseDown={(e) => {
				if (e.button == 1 || e.button == 2) {
					e.preventDefault();
					setDragging(true);
				} else if (e.button == 0) {
					let gridPos = getGridAt([e.pageX, e.pageY]);
					console.log(gridPos);
				}
				if (onMouseDown) onMouseDown(e);
			}}
			onMouseUp={(e) => {
				if (e.button == 1 || e.button == 2) {
					e.preventDefault();
					setDragging(false);
					setPrevMousePos(null);
				}
				if (onMouseUp) onMouseUp(e);
			}}
			onMouseLeave={(_) => {
				setDragging(false);
				setPrevMousePos(null);
			}}
			onMouseMove={(e) => {
				if (dragging) {
					let deltaX = 0;
					let deltaY = 0;
					if (prevMousePos != null) {
						deltaX = e.pageX - prevMousePos[0];
						deltaY = e.pageY - prevMousePos[1];
					}
					setPrevMousePos([e.pageX, e.pageY]);
					updatePos([pos[0] + deltaX, pos[1] + deltaY]);
				}
				setCurMousePos([e.pageX, e.pageY]);
				if (onMouseMove) onMouseMove(e);
			}}
			onWheel={(e) => {
				const newUnitLen = unitLen - e.deltaY * 0.1;
				if (newUnitLen < minUnitLen || newUnitLen > maxUnitLen) return;
				updateUnitLen(newUnitLen);
			}}
		>
			<div
				className={`absolute bg-daedalus11 pointer-events-none`}
				style={{
					top: getTLOf(getGridAt(curMousePos))[1],
					left: getTLOf(getGridAt(curMousePos))[0],
					width: unitLen,
					height: unitLen
				}}
			/>
			<canvas width={500} height={300} className={"w-full h-full"} ref={canvasRef} />
		</div>
	)
}
