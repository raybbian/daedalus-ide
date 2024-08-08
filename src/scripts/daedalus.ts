export type PixelColor = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
export type GridMap = Map<string, [PixelColor, boolean]>;

export const programTemplate: GridMap = new Map<string, [PixelColor, boolean]>().set("0_0", [12, false]).set("1_0", [0, false]);

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

export function colorToHex(color: PixelColor) {
	switch (color) {
		case 0: return '#5d275d';
		case 1: return '#b13e53';
		case 2: return '#ef7d57';
		case 3: return '#ffcd75';
		case 4: return '#a7f070';
		case 5: return '#38b764';
		case 6: return '#257179';
		case 7: return '#29366f';
		case 8: return '#3b5dc9';
		case 9: return '#41a6f6';
		case 10: return '#73eff7';
		case 11: return '#f4f4f4';
		case 12: return '#94b0c2';
		case 13: return '#566c86';
		case 14: return '#333c57';
		case 15: return '#1a1c2c';
	}
}

export function getRandomColor(): PixelColor {
	return Math.floor(Math.random() * 15) as PixelColor;
}

export const instructionNamesAndId: [string, string, PixelColor][] = [
	["Pop *", "Pops the top value off of the stack.", 0],
	["Push(n) *", "Pushes the signed value n onto the stack.", 1],
	["Dup(n) *", "Duplicates the value of the nth element (unsigned) from the top.", 2],
	["Add *", "Adds (+) the top two values on the stack, and pushes the result.", 3],
	["And *", "Ands (&) the top two values on the stack, and pushes the result.", 4],
	["Not *", "Nots (!) the top value on the stack, and pushes the result.", 5],
	["Getc *", "Reads a value from stdin, and pushes it to the stack.", 6],
	["Putc *", "Outputs the top value of the stack to stdout.", 7],
	["Jmp(n)", "Jumps to the subroutine marked by id n (signed).", 8],
	["Ret", "Jumps to the caller of this subroutine", 9],
	["Halt", "Halts the program, terminating it.", 10],
	["NoOp", "Does nothing. A no-operation.", 11],
	["Sbr(n)", "Marks the start of a subroutine with id n (signed).", 12],
	["Cmp", "The first statement read right, fwd, left is executed if the top value is > 0.", 13],
	["Inst", "Marks the start of a stack-based instruction (Instructions 0-7).", 14],
	["Bg", "Background color that is ignored during parsing.", 15],
]
