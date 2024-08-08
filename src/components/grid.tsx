import { GridMap, PixelColor, colorToVec3, getRandomColor } from "@/scripts/daedalus";
import { MouseEventHandler, useEffect, useRef, useState, MutableRefObject } from "react"
import gridLineVertShader from "@/shaders/grid_lines_v.glsl";
import gridLineFragShader from "@/shaders/grid_lines_f.glsl";
import pixelVertShader from "@/shaders/grid_pixel_v.glsl";
import pixelFragShader from "@/shaders/grid_pixel_f.glsl";

export default function Grid({ gridItems, redrawRef, selectedInstruction }: {
	gridItems: MutableRefObject<GridMap>,
	redrawRef: MutableRefObject<(() => void) | null>,
	selectedInstruction: PixelColor,
}) {
	const [dragging, setDragging] = useState(false);
	const [prevMousePos, setPrevMousePos] = useState<[number, number] | null>(null);
	const [curMousePos, setCurMousePos] = useState<[number, number]>([0, 0]);
	const [unitLen, setUnitLen] = useState(50);
	const [pos, setPos] = useState<[number, number]>([unitLen, unitLen]);
	const guiOffset = useRef<[number, number]>([0, 0]);
	const minUnitLen = 15;
	const maxUnitLen = 200;

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
	const lineProgramRef = useRef<WebGLProgram | null>(null);
	const pixelProgramRef = useRef<WebGLProgram | null>(null);
	const glRef = useRef<WebGL2RenderingContext | null>(null);
	const pixelsChanged = useRef(false);

	function initWebGL() {
		const canvas = canvasRef.current;
		if (canvas == null) return;

		glRef.current = canvas.getContext('webgl2');
		const gl = glRef.current;
		if (gl == null) {
			console.error('WebGL not supported');
			return;
		}

		function initShaderProgram(gl: WebGL2RenderingContext, vertexShaderSrc: string, fragmentShaderSrc: string): WebGLProgram | null {
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

			const vertShader = loadShader(gl.VERTEX_SHADER, vertexShaderSrc);
			const fragShader = loadShader(gl.FRAGMENT_SHADER, fragmentShaderSrc);
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
				console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
				return null;
			}

			gl.deleteShader(vertShader);
			gl.deleteShader(fragShader);

			return program;
		}

		lineProgramRef.current = initShaderProgram(gl, gridLineVertShader, gridLineFragShader);
		pixelProgramRef.current = initShaderProgram(gl, pixelVertShader, pixelFragShader);
		const lineProgram = lineProgramRef.current;
		const pixelProgram = pixelProgramRef.current;
		if (lineProgram == null || pixelProgram == null) return;

		function initLineProgram() {
			if (gl == null || lineProgram == null) return;
			gl.useProgram(lineProgram);
			const vertices = new Float32Array([
				-1.0, 1.0,
				-1.0, -1.0,
				1.0, 1.0,
				1.0, -1.0,
			]);

			let vertexBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
			const aVertexPosition = gl.getAttribLocation(lineProgram, 'aVertexPosition');
			gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(aVertexPosition);
		}
		initLineProgram();

		function initPixelProgram() {
			if (gl == null || pixelProgram == null) return;
			gl.useProgram(pixelProgram);

			//initialize the pixel to be instanced
			const vertexBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
			const aVertexPosition = gl.getAttribLocation(pixelProgram, 'aVertexPosition');
			gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(aVertexPosition);
			const vertices = [
				-1.0, -1.0,
				1.0, -1.0,
				-1.0, 1.0,
				1.0, 1.0,
			];
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

			// initialize the instance array
			const instanceBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
			const aInstancePosition = gl.getAttribLocation(pixelProgram, 'aInstancePosition');
			gl.vertexAttribPointer(aInstancePosition, 2, gl.FLOAT, false, 24, 0);
			gl.vertexAttribDivisor(aInstancePosition, 1); // This makes it an instanced attribute
			gl.enableVertexAttribArray(aInstancePosition);
			const aInstanceColor = gl.getAttribLocation(pixelProgram, 'aInstanceColor');
			gl.vertexAttribPointer(aInstanceColor, 4, gl.FLOAT, false, 24, 8);
			gl.vertexAttribDivisor(aInstanceColor, 1); // This makes it an instanced attribute
			gl.enableVertexAttribArray(aInstanceColor);
		}
		initPixelProgram();

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	}

	useEffect(() => {
		redrawRef.current = render;

		function handleResize() {
			const canvas = canvasRef.current;
			const gl = glRef.current;
			const lineProgram = lineProgramRef.current;
			const pixelProgram = pixelProgramRef.current;
			if (canvas == null || gl == null || lineProgram == null || pixelProgram == null) return;
			if (canvas.width != canvas.clientWidth || canvas.width != canvas.clientHeight) {
				const box = canvas.getBoundingClientRect();
				guiOffset.current = [box.left, box.top];

				canvas.width = canvas.clientWidth;
				canvas.height = canvas.clientHeight;
				gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

				gl.useProgram(lineProgram);
				let uResolution = gl.getUniformLocation(lineProgram, 'uResolution');
				gl.uniform2f(uResolution, canvas.width, canvas.height);

				gl.useProgram(pixelProgram);
				uResolution = gl.getUniformLocation(pixelProgram, 'uResolution');
				gl.uniform2f(uResolution, canvas.width, canvas.height);

				requestAnimationFrame(render);
			}
		}

		window.addEventListener('resize', handleResize);
		initWebGL();

		// intialize main function
		pixelsChanged.current = true;
		gridItems.current.set("0_0", [12, false]);
		gridItems.current.set("1_0", [0, false]);

		updateUnitLen(unitLen);
		updatePos(pos);
		handleResize();

		requestAnimationFrame(render);

		return () => window.removeEventListener('resize', handleResize);
	}, []);

	function render() {
		const gl = glRef.current;
		const lineProgram = lineProgramRef.current;
		const pixelProgram = pixelProgramRef.current;
		if (gl == null || lineProgram == null || pixelProgram == null) return;

		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.useProgram(lineProgram);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.useProgram(pixelProgram);

		if (pixelsChanged.current) {
			let pixelData = new Float32Array(gridItems.current.size * 6);
			let i = 0;
			gridItems.current.forEach(([col, isPreview], loc) => {
				let pos = loc.split('_').map((num) => parseInt(num));
				pixelData[i++] = pos[0];
				pixelData[i++] = pos[1];
				const vec3col = colorToVec3(col);
				pixelData[i++] = vec3col[0];
				pixelData[i++] = vec3col[1];
				pixelData[i++] = vec3col[2];
				pixelData[i++] = isPreview ? 0.25 : 1.0;
			});
			gl.bufferData(gl.ARRAY_BUFFER, pixelData, gl.DYNAMIC_DRAW);
			pixelsChanged.current = false;
		}
		gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, gridItems.current.size);
	}

	function updateUnitLen(newUnitLen: number) {
		setUnitLen(newUnitLen);
		const gl = glRef.current;
		const lineProgram = lineProgramRef.current;
		const pixelProgram = pixelProgramRef.current;
		if (gl == null || lineProgram == null || pixelProgram == null) return;

		gl.useProgram(lineProgram);
		let uUnitLen = gl.getUniformLocation(lineProgram, 'uUnitLen');
		gl.uniform1f(uUnitLen, newUnitLen);
		gl.useProgram(pixelProgram);
		uUnitLen = gl.getUniformLocation(pixelProgram, 'uUnitLen');
		gl.uniform1f(uUnitLen, newUnitLen);
	}

	function updatePos(newPos: [number, number]) {
		setPos(newPos);
		const gl = glRef.current;
		const lineProgram = lineProgramRef.current;
		const pixelProgram = pixelProgramRef.current;
		if (gl == null || lineProgram == null || pixelProgram == null) return;

		gl.useProgram(lineProgram);
		let uPos = gl.getUniformLocation(lineProgram, 'uPos');
		gl.uniform2f(uPos, newPos[0], newPos[1]);
		gl.useProgram(pixelProgram);
		uPos = gl.getUniformLocation(pixelProgram, 'uPos');
		gl.uniform2f(uPos, newPos[0], newPos[1]);
	}

	return (
		<div
			// ref={canvasRef}
			className={`w-full h-full bg-daedalus15 relative ${dragging && "cursor-grabbing"} overflow-hidden`}
			onMouseDown={(e) => {
				const gridPos = getGridAt(curMousePos);
				if (e.button == 1) {
					e.preventDefault();
					setDragging(true);
				} else if (e.button == 0) {
					gridItems.current.set(`${gridPos[0]}_${gridPos[1]}`, [selectedInstruction, false]);
					pixelsChanged.current = true;
					requestAnimationFrame(render);
				} else if (e.button == 2) {
					gridItems.current.delete(`${gridPos[0]}_${gridPos[1]}`);
					pixelsChanged.current = true;
					requestAnimationFrame(render);
				}
			}}
			onMouseUp={(e) => {
				if (e.button == 1) {
					e.preventDefault();
					setDragging(false);
					setPrevMousePos(null);
				}
			}}
			onMouseLeave={(_) => {
				setDragging(false);
				setPrevMousePos(null);
			}}
			onMouseMove={(e) => {
				if (!canvasRef.current) return;
				const mouseX = e.pageX - guiOffset.current[0];
				const mouseY = e.pageY - guiOffset.current[1];
				if (dragging) {
					let deltaX = 0;
					let deltaY = 0;
					if (prevMousePos != null) {
						deltaX = mouseX - prevMousePos[0];
						deltaY = mouseY - prevMousePos[1];
					}
					setPrevMousePos([mouseX, mouseY]);
					updatePos([pos[0] + deltaX, pos[1] + deltaY]);
					requestAnimationFrame(render);
				}
				setCurMousePos([mouseX, mouseY]);
			}}
			onWheel={(e) => {
				const newUnitLen = unitLen - e.deltaY * 0.1;
				if (newUnitLen < minUnitLen || newUnitLen > maxUnitLen) return;
				const curGrid = getGridAt(curMousePos);
				const ratio = unitLen - newUnitLen;
				updateUnitLen(newUnitLen);
				updatePos([pos[0] + ratio * curGrid[0], pos[1] + ratio * curGrid[1]]);
				requestAnimationFrame(render);
			}}
			onContextMenu={(e) => {
				e.preventDefault();
				return false;
			}}
		>
			<div className="absolute left-4 bottom-2">x: {getGridAt(curMousePos)[0]} y: {getGridAt(curMousePos)[1]}</div>
			<canvas width={500} height={300} className={"w-full h-full"} ref={canvasRef} />
		</div>
	)
}
