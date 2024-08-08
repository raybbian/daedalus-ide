import { PixelColor } from "./daedalus";

export type KeybindConfig = "qwerty" | "colemak" | "colemakdh" | "dvorak";
export type DrawMode = "free" | "assisted";

export type IdeConfig = {
	keybindConfig: KeybindConfig,
	drawMode: DrawMode,
}

export const defaultConfig: IdeConfig = {
	keybindConfig: "qwerty",
	drawMode: "assisted",
}

export const keybindConfigs: KeybindConfig[] = ["qwerty", "colemak", "colemakdh", "dvorak"]

export const drawModes: DrawMode[] = ["assisted", "free"]

export function keyToColorWithConfig(key: string, config: IdeConfig): PixelColor | null {
	switch (config.keybindConfig) {
		case "qwerty": return qwertyKeyToColor(key);
		case "colemak": return colemakKeyToColor(key);
		case "colemakdh": return colemakDHKeyToColor(key);
		case "dvorak": return dvorakKeyToColor(key);
	}
}

function qwertyKeyToColor(key: string): PixelColor | null {
	switch (key) {
		case "1": return 0;
		case "2": return 1;
		case "3": return 2;
		case "4": return 3;
		case "q": return 4;
		case "w": return 5;
		case "e": return 6;
		case "r": return 7;
		case "a": return 8;
		case "s": return 9;
		case "d": return 10;
		case "f": return 11;
		case "z": return 12;
		case "x": return 13;
		case "c": return 14;
		case "v": return 15;
	}
	return null;
}

function colemakKeyToColor(key: string): PixelColor | null {
	switch (key) {
		case "1": return 0;
		case "2": return 1;
		case "3": return 2;
		case "4": return 3;
		case "q": return 4;
		case "w": return 5;
		case "f": return 6;
		case "p": return 7;
		case "a": return 8;
		case "r": return 9;
		case "s": return 10;
		case "t": return 11;
		case "z": return 12;
		case "x": return 13;
		case "c": return 14;
		case "v": return 15;
	}
	return null;
}

function colemakDHKeyToColor(key: string): PixelColor | null {
	switch (key) {
		case "1": return 0;
		case "2": return 1;
		case "3": return 2;
		case "4": return 3;
		case "q": return 4;
		case "w": return 5;
		case "f": return 6;
		case "p": return 7;
		case "a": return 8;
		case "r": return 9;
		case "s": return 10;
		case "t": return 11;
		case "z": return 12;
		case "x": return 13;
		case "c": return 14;
		case "d": return 15;
	}
	return null;
}

function dvorakKeyToColor(key: string): PixelColor | null {
	switch (key) {
		case "1": return 0;
		case "2": return 1;
		case "3": return 2;
		case "4": return 3;
		case "'": return 4;
		case ",": return 5;
		case ".": return 6;
		case "p": return 7;
		case "a": return 8;
		case "o": return 9;
		case "e": return 10;
		case "u": return 11;
		case ";": return 12;
		case "q": return 13;
		case "j": return 14;
		case "k": return 15;
	}
	return null;
}
