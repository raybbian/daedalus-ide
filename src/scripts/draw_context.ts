import { GridMap, PixelColor } from "./daedalus";

export class DrawContext {
	useAssist: boolean;
	gridMap: GridMap;


	constructor(useAssist: boolean) {
		this.useAssist = useAssist;
		this.gridMap = new Map<string, [PixelColor, boolean]>();
	}

	initWithDefaultProgram(): DrawContext {
		this.gridMap.set("0_0", [12, false]);
		this.gridMap.set("1_0", [0, false]);
		return this;
	}

	setPixel(x: number, y: number, v: PixelColor) {
		if (v == 15) {
			this.gridMap.delete(this.posKey(x, y));
		} else {
			this.gridMap.set(this.posKey(x, y), [v, false]);
		}
	}

	setPreview(x: number, y: number, v: PixelColor) {
		if (v == 15) return;
		if (this.getPixel(x, y) != 15) return;
		this.gridMap.set(this.posKey(x, y), [v, true]);
	}

	getPixel(x: number, y: number): PixelColor {
		const item = this.gridMap.get(this.posKey(x, y));
		if (!item || item[1]) return 15;
		return item[0];
	}

	private posKey(x: number, y: number): string {
		return `${x}_${y}`;
	}
}
