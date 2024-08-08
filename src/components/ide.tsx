import { PixelColor, GridMap } from "@/scripts/daedalus";
import Grid from "./grid";
import { useRef } from "react";

export const MAX_NUM_PIXELS = 10000;

export default function Ide() {
	const gridItems = useRef<GridMap>(new Map<[number, number], [PixelColor, boolean]>());

	return (
		<div className="w-full h-full grid grid-cols-5">
			<div className="w-full h-full col-span-4 overflow-hidden">
				<Grid gridItems={gridItems} />
			</div>
		</div>
	)
}
