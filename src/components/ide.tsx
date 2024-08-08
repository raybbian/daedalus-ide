import { PixelColor, GridMap } from "@/scripts/daedalus";
import Grid from "@/components/grid";
import { useRef, useState } from "react";
import SidePanel from "@/components/side_panel";

export const MAX_NUM_PIXELS = 10000;

export default function Ide() {
	const gridItems = useRef<GridMap>(new Map<string, [PixelColor, boolean]>());
	const redrawRef = useRef<(() => void) | null>(null);
	const [selectedInstruction, setSelectedInstruction] = useState<PixelColor>(0);

	return (
		<div className="w-full h-full flex flex-row">
			<div className="w-80 min-w-80 h-full overflow-scroll">
				<SidePanel
					gridItems={gridItems}
					selectedInstruction={selectedInstruction}
					setSelectedInstruction={setSelectedInstruction}
				/>
			</div>
			<div className="h-auto w-full">
				<Grid
					gridItems={gridItems}
					redrawRef={redrawRef}
					selectedInstruction={selectedInstruction}
				/>
			</div>
		</div>
	);
}
