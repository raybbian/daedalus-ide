import { colorToHex, instructionNamesAndId, PixelColor } from "@/scripts/daedalus";
import { Dispatch, SetStateAction } from "react";

export default function SidePanel({ selectedInstruction, setSelectedInstruction }: {
	selectedInstruction: PixelColor,
	setSelectedInstruction: Dispatch<SetStateAction<PixelColor>>,
}) {
	return (
		<div className="w-full h-auto bg-daedalus15 border-r-2 border-r-white px-6 py-4 flex flex-col gap-4">
			<div className="w-full flex flex-col gap-2">
				<h1 className="text-2xl font-bold">Daedalus Web IDE</h1>
				<p className="opacity-75 text-sm">
					Welcome to the Daedalus Web IDE! To pan the pixel grid, click and drag with your middle mouse button. Color a pixel by left clicking, and remove one by right clicking.
				</p>
			</div>
			<div className="w-full flex flex-col gap-2">
				<h2 className="text-xl font-bold">Instruction Set</h2>
				<p className="opacity-75 text-sm">
					These are the instructions available for use in Daedalus. Note that Instructions 0-7, marked with a star, must be prefixed with a instruction marker (or comparison marker). Instructions that take a parameter are either unsigned or signed (two&apos;s complement), and are entered with the binary representation of colors 0-7.
				</p>
				<div className="w-full h-full py-2">
					<InstructionPicker
						selectedInstruction={selectedInstruction}
						setSelectedInstruction={setSelectedInstruction}
					/>
				</div>
			</div>
		</div>
	);
}

function InstructionPicker({ selectedInstruction, setSelectedInstruction }: {
	selectedInstruction: PixelColor,
	setSelectedInstruction: Dispatch<SetStateAction<PixelColor>>,
}) {
	return (
		<div className="w-full h-full grid grid-cols-2 grid-rows-8">
			{instructionNamesAndId.map(([instructionName, instructionDesc, id]) => (
				<InstructionButton
					key={id}
					instructionName={instructionName}
					instructionDesc={instructionDesc}
					instructionId={id}
					selectedInstruction={selectedInstruction}
					setSelectedInstruction={setSelectedInstruction}
				/>
			))}
		</div>
	)
}

function InstructionButton({ instructionName, instructionDesc, instructionId, selectedInstruction, setSelectedInstruction }: {
	instructionName: string,
	instructionDesc: string,
	instructionId: PixelColor,
	selectedInstruction: PixelColor,
	setSelectedInstruction: Dispatch<SetStateAction<PixelColor>>,
}) {
	return (
		<button
			onClick={() => setSelectedInstruction(instructionId)}
			className={`w-full h-full bg-red-500 p-2 flex flex-col align-top ${instructionId == selectedInstruction && "outline"} relative`}
			style={{ backgroundColor: colorToHex(instructionId) + '77' }}
		>
			<p className="font-semibold">{instructionName}</p>
			<p className="text-xs opacity-75">{instructionDesc}</p>
			<p className="absolute top-1 left-2 opacity-40">{instructionId}</p>
		</button>
	)
}
