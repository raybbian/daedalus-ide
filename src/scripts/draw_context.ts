import { MutableRefObject } from "react";
import { colorToHex, colorToVec3, GridMap, PixelColor } from "./daedalus";

export class DrawContext {
    gridMap: GridMap;

    constructor() {
        this.gridMap = new Map<string, PixelColor>();
    }

    initWithDefaultProgram(): DrawContext {
        this.gridMap.clear();
        this.setPixel(1, 1, 12);
        this.setPixel(2, 1, 0);
        return this;
    }

    setPixel(x: number, y: number, v: PixelColor) {
        if (v == 15) {
            this.gridMap.delete(this.posKey(x, y));
        } else {
            this.gridMap.set(this.posKey(x, y), v);
        }
    }

    getPixel(x: number, y: number): PixelColor {
        const item = this.gridMap.get(this.posKey(x, y));
        if (!item) return 15;
        return item;
    }

    exportToPng(
        canvasRef: MutableRefObject<HTMLCanvasElement | null>,
    ): string | null {
        const canvas = canvasRef.current;
        if (canvas == null) return null;

        const min = [0, 0];
        const max = [0, 0];
        this.gridMap.forEach((_, posKey) => {
            const pos = posKey.split("_").map((num) => parseInt(num));
            min[0] = Math.min(min[0], pos[0]);
            min[1] = Math.min(min[1], pos[1]);
            max[0] = Math.max(max[0], pos[0]);
            max[1] = Math.max(max[1], pos[1]);
        });
        canvas.width = max[0] - min[0] + 1;
        canvas.height = max[1] - min[1] + 1;

        const ctx = canvas.getContext("2d");
        if (ctx == null) return null;
        ctx.fillStyle = colorToHex(15);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        this.gridMap.forEach((col, posKey) => {
            const pos = posKey.split("_").map((num) => parseInt(num));
            const ind = (pos[1] * canvas.width + pos[0]) * 4;
            const colorVec = colorToVec3(col);
            imageData.data[ind] = colorVec[0] * 255;
            imageData.data[ind + 1] = colorVec[1] * 255;
            imageData.data[ind + 2] = colorVec[2] * 255;
            imageData.data[ind + 3] = 255;
        });
        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL();
    }

    importFromCanvas(canvasRef: MutableRefObject<HTMLCanvasElement | null>) {
        this.gridMap.clear();
        const canvas = canvasRef.current;
        if (canvas == null) return;
        const ctx = canvas.getContext("2d");
        if (ctx == null) return;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let r = 0; r < imageData.height; r++) {
            for (let c = 0; c < imageData.width; c++) {
                const ind = (r * imageData.width + c) * 4;
                const color = [
                    imageData.data[ind],
                    imageData.data[ind + 1],
                    imageData.data[ind + 2],
                ];
                let found: PixelColor | null = null;
                for (let col = 0; col < 16; col++) {
                    const oColor = colorToVec3(col as PixelColor);
                    oColor[0] = Math.round(oColor[0] * 255);
                    oColor[1] = Math.round(oColor[1] * 255);
                    oColor[2] = Math.round(oColor[2] * 255);
                    if (
                        oColor[0] == color[0] &&
                        oColor[1] == color[1] &&
                        oColor[2] == color[2]
                    ) {
                        found = col as PixelColor;
                        break;
                    }
                }
                if (found == null) {
                    console.error(
                        "Image has pixels that are not standard daedalus colors",
                    );
                    return;
                } else if (found == 15) continue;
                this.setPixel(c, r, found);
            }
        }
    }

    private posKey(x: number, y: number): string {
        return `${x}_${y}`;
    }
}
