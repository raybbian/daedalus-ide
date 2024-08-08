export type PixelColor = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
export type GridMap = Map<[number, number], [PixelColor, boolean]>;

export function colorToVec3(color: PixelColor) {
	switch (color) {
		case 0: return [0.3647059, 0.15294118, 0.3647059];
		case 1: return [0.69411767, 0.24313726, 0.3254902];
		case 2: return [0.9372549, 0.49019608, 0.34117648];
		case 3: return [1.0, 0.8039216, 0.45882353];
		case 4: return [0.654902, 0.9411765, 0.4392157];
		case 5: return [0.21960784, 0.7176471, 0.39215687];
		case 6: return [0.14509805, 0.44313726, 0.4745098];
		case 7: return [0.16078432, 0.21176471, 0.43529412];
		case 8: return [0.23137255, 0.3647059, 0.7882353];
		case 9: return [0.25490198, 0.6509804, 0.9647059];
		case 10: return [0.4509804, 0.9372549, 0.96862745];
		case 11: return [0.95686275, 0.95686275, 0.95686275];
		case 12: return [0.5803922, 0.6901961, 0.7607843];
		case 13: return [0.3372549, 0.42352942, 0.5254902];
		case 14: return [0.2, 0.23529412, 0.34117648];
		case 15: return [0.101960786, 0.10980392, 0.17254902];
	}
}

export function getRandomColor(): PixelColor {
	return Math.floor(Math.random() * 15) as PixelColor;
}
