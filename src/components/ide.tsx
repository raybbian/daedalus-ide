import { DaedalusColor, GridMap } from "@/types/daedalus";
import Grid from "./grid";
import { useState } from "react";

export default function Ide() {
	const [gridItems, setGridItems] = useState<GridMap>(new Map<[number, number], DaedalusColor>());

	return (
		<div className="w-full h-full grid grid-cols-5">
			<div className="w-full h-full col-span-4 overflow-hidden">
				<Grid gridItems={gridItems} setGridItems={setGridItems} />
			</div>
		</div>
	)
}
