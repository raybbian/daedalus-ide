import { PixelColor, GridMap, programTemplate } from "@/scripts/daedalus";
import Grid, { renderGrid } from "@/components/grid";
import { useRef, useState, useEffect, MouseEvent as ReactMouseEvent, useCallback, KeyboardEvent } from "react";
import SidePanel from "@/components/side_panel";
import Toolbar from "./toolbar";
import Settings from "./settings";
import { IdeConfig, defaultConfig, keyToColorWithConfig } from "@/scripts/config"

export default function Ide() {
	const [selectedInstruction, setSelectedInstruction] = useState<PixelColor>(0);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [ideConfig, setIdeConfig] = useState(defaultConfig);
	const gridItemRef = useRef<GridMap>(programTemplate);
	const gridPreviewKeys = useRef<string[]>([]);
	const ideRef = useRef<HTMLDivElement | null>(null);

	// WebGL stuff
	const lineProgramRef = useRef<WebGLProgram | null>(null);
	const pixelProgramRef = useRef<WebGLProgram | null>(null);
	const glRef = useRef<WebGL2RenderingContext | null>(null);

	// Initialize or load IDE Config
	useEffect(() => {
		function loadConfig() {
			const item = localStorage.getItem('ideConfig');
			if (!item) {
				localStorage.setItem('ideConfig', JSON.stringify(defaultConfig));
				return;
			}
			const config = JSON.parse(item);
			if (!config) {
				localStorage.setItem('ideConfig', JSON.stringify(defaultConfig));
				return;
			}
			const typedConfig: IdeConfig = {
				keybindConfig: config.keybindConfig,
				drawMode: config.drawMode,
			}
			setIdeConfig(typedConfig);
		}
		loadConfig();
	}, [])

	// Store the IDE Config when it changes
	useEffect(() => {
		localStorage.setItem('ideConfig', JSON.stringify(ideConfig))
	}, [ideConfig])

	function handleClick(pos: [number, number], e: ReactMouseEvent<HTMLDivElement, MouseEvent>) {
		if (e.button == 0) {
			gridItemRef.current.set(`${pos[0]}_${pos[1]}`, [selectedInstruction, false]);
			requestAnimationFrame(() => renderGrid(
				glRef.current,
				lineProgramRef.current,
				pixelProgramRef.current,
				gridItemRef.current,
				true
			));
		} else if (e.button == 2) {
			gridItemRef.current.delete(`${pos[0]}_${pos[1]}`);
			requestAnimationFrame(() => renderGrid(
				glRef.current,
				lineProgramRef.current,
				pixelProgramRef.current,
				gridItemRef.current,
				true
			));
		}
	}

	// TODO: cleanup preview code (new shader?)
	function handleGridPos(pos: [number, number], e: ReactMouseEvent<HTMLDivElement, MouseEvent>) {
		const mapKey = `${pos[0]}_${pos[1]}`;

		let needsReRender = false;
		while (gridPreviewKeys.current.length != 0) {
			const key = gridPreviewKeys.current.pop();
			if (!key) break;
			const item = gridItemRef.current.get(key);
			if (!item || !item[1]) continue;
			//delete existing previews
			gridItemRef.current.delete(key);
			needsReRender = true;
		}

		// set preview if spot doesn't have
		if (!gridItemRef.current.get(mapKey)) {
			gridItemRef.current.set(mapKey, [selectedInstruction, true])
			gridPreviewKeys.current.push(mapKey);
			needsReRender = true;
		}

		if (needsReRender) {
			requestAnimationFrame(() => renderGrid(
				glRef.current,
				lineProgramRef.current,
				pixelProgramRef.current,
				gridItemRef.current,
				true
			));
		}
	}

	// TODO: cleanup preview code (new shader?)
	function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
		let instruction = keyToColorWithConfig(e.key, ideConfig);
		if (instruction == null) return;
		setSelectedInstruction(instruction);
	}

	return (
		<div
			className="w-full h-full flex flex-row"
			onKeyDown={handleKeyDown}
			ref={ideRef}
			tabIndex={0}
		>
			<div className="w-80 min-w-80 h-full overflow-scroll">
				<SidePanel
					selectedInstruction={selectedInstruction}
					setSelectedInstruction={setSelectedInstruction}
				/>
			</div>
			<div className="h-full w-full relative grid place-items-center">
				<Grid
					gridItemRef={gridItemRef}
					glRef={glRef}
					lineProgramRef={lineProgramRef}
					pixelProgramRef={pixelProgramRef}
					onMouseDown={handleClick}
					onMouseGrid={handleGridPos}
				/>
				<div className="absolute bottom-8">
					<Toolbar
						setSettingsOpen={setSettingsOpen}
					/>
				</div>
			</div>
			{
				settingsOpen &&
				<div className="absolute w-full h-full">
					<Settings
						setSettingsOpen={setSettingsOpen}
						ideConfig={ideConfig}
						setIdeConfig={setIdeConfig}
						ideRef={ideRef}
					/>
				</div>
			}
		</div >
	);
}
