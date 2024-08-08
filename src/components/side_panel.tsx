import { colorToHex, GridMap, instructionNamesAndId, PixelColor } from "@/scripts/daedalus";
import { Dispatch, MutableRefObject, SetStateAction } from "react";

export default function SidePanel({ gridItems, selectedInstruction, setSelectedInstruction }: {
	gridItems: MutableRefObject<GridMap>,
	selectedInstruction: PixelColor,
	setSelectedInstruction: Dispatch<SetStateAction<PixelColor>>,
}) {
	return (
		<div className="w-full h-auto bg-daedalus15 border-r-2 border-r-white px-6 py-4 flex flex-col gap-3">
			<h1 className="text-2xl font-bold">Daedalus Web IDE</h1>
			<h2 className="text-xl font-bold">Instruction Set</h2>
			<p className="opacity-75 text-sm">
				These are the instructions available for use in Daedalus. Note that Instructions 0-7, marked with a star, must be prefixed with a instruction marker (or comparison marker). Instructions that take a parameter are either unsigned or signed (two&apos;s complement), and are entered with colors 0-7 in base 8.
			</p>
			<div className="w-full h-full py-2">
				<InstructionPicker
					selectedInstruction={selectedInstruction}
					setSelectedInstruction={setSelectedInstruction}
				/>
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
			className={`w-full h-full bg-red-500 px-2 pt-4 pb-4 flex flex-col align-top ${instructionId == selectedInstruction && "outline"}`}
			style={{ backgroundColor: colorToHex(instructionId) + '77' }}
		>
			<p className="font-semibold">{instructionName}</p>
			{true && <p className="text-xs opacity-75">{instructionDesc}</p>}
		</button>
	)
}
