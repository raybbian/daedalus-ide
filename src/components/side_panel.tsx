import { colorToKeyWithConfig, IdeConfig } from "@/scripts/config";
import { colorToHex, instructionNamesAndId, PixelColor } from "@/scripts/daedalus";
import { Dispatch, SetStateAction } from "react";
import { GoDiff, GoDownload, GoGear, GoPlay, GoSync, GoUpload } from "react-icons/go";
import { FaGithub } from "react-icons/fa6";
import Link from "next/link";

export default function SidePanel({ selectedInstruction, setSelectedInstruction, ideConfig }: {
	selectedInstruction: PixelColor,
	setSelectedInstruction: Dispatch<SetStateAction<PixelColor>>,
	ideConfig: IdeConfig,
}) {
	return (
		<div className="w-full h-auto bg-daedalus15 px-6 py-4 flex flex-col gap-4">
			<div className="w-full flex flex-col gap-2">
				<h1 className="text-2xl font-bold">Daedalus Web IDE</h1>
				<p className="opacity-75">
					Welcome to the Daedalus Web IDE! To pan the pixel grid, click and drag with your middle mouse button. Color a pixel by left clicking, and remove one by right clicking.
				</p>
				<div className="w-full flex flex-row gap-4 items-center">
					<Link href={"https://github.com/ambareesh1510/daedalus"} target="_blank" className="flex flex-row gap-2">
						<p>Daedalus</p>
						<FaGithub size={24} />
					</Link>
					<Link href={"https://github.com/raybbian/daedalus-ide"} target="_blank" className="flex flex-row gap-2">
						<p>Daedalus Web IDE</p>
						<FaGithub size={24} />
					</Link>
				</div>
			</div>
			<div className="w-full flex flex-col gap-2">
				<h2 className="text-xl font-bold">Toolbar</h2>
				<p className="opacity-75">
					The left section of the toolbar indicates the selected instruction. The right section consists of a literal value generator that constructs literal values for instructions that take parameters.
				</p>
				<div className="text-sm opacity-65 flex flex-col gap-1">
					<div className="list-none flex flex-row gap-2 items-center">
						<GoPlay size={16} className="flex-none" />
						<p>Execute your code in the Web IDE.</p>
					</div>
					<div className="list-none flex flex-row gap-2 items-center">
						<GoDownload size={16} className="flex-none" />
						<p>Download your Daedalus program as PNG.</p>
					</div>
					<div className="list-none flex flex-row gap-2 items-center">
						<GoUpload size={16} className="flex-none" />
						<p>Upload and edit a Daedalus PNG file.</p>
					</div>
					<div className="list-none flex flex-row gap-2 items-center">
						<GoGear size={16} className="flex-none" />
						<p>Change settings such as the keybind preset.</p>
					</div>
					<div className="list-none flex flex-row gap-2 items-center">
						<GoSync size={16} className="flex-none" />
						<p>Reset the transform of the pixel grid.</p>
					</div>
					<div className="list-none flex flex-row gap-2 items-center">
						<GoDiff size={16} className="flex-none" />
						<p>Toggle the literal value generator between signed and unsigned values.</p>
					</div>
				</div>
			</div>
			<div className="w-full flex flex-col gap-2">
				<h2 className="text-xl font-bold">Instruction Set</h2>
				<p className="opacity-75">
					These are the instructions available for use in Daedalus. Note the following:
				</p>
				<ul className="text-sm opacity-65">
					<li className="list-disc ml-4">All instructions must be prefixed with a instruction marker (or comparison marker).</li>
					<li className="list-disc ml-4">Instructions that take a parameter are either unsigned or signed (two&apos;s complement), and are entered with their binary representation using colors 0-7 in Little Endian order.</li>
					<li className="list-disc ml-4">Note that If an overflow occurs, values will wrap around in their range.</li>
				</ul>
				<div className="w-full h-full py-2">
					<InstructionPicker
						selectedInstruction={selectedInstruction}
						setSelectedInstruction={setSelectedInstruction}
						ideConfig={ideConfig}
					/>
				</div>
			</div>
			<div className="w-full flex flex-col gap-2">
				<h2 className="text-xl font-bold">Troubleshooting</h2>
				<p className="opacity-75">
					Something not working as expected? Check the console for errors. Proper notifications coming soon!
				</p>
			</div>
		</div >
	);
}

function InstructionPicker({ selectedInstruction, setSelectedInstruction, ideConfig }: {
	selectedInstruction: PixelColor,
	setSelectedInstruction: Dispatch<SetStateAction<PixelColor>>,
	ideConfig: IdeConfig,
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
					ideConfig={ideConfig}
				/>
			))}
		</div>
	)
}

function InstructionButton({ instructionName, instructionDesc, instructionId, selectedInstruction, setSelectedInstruction, ideConfig }: {
	instructionName: string,
	instructionDesc: string,
	instructionId: PixelColor,
	selectedInstruction: PixelColor,
	setSelectedInstruction: Dispatch<SetStateAction<PixelColor>>,
	ideConfig: IdeConfig,
}) {
	return (
		<button
			onClick={() => setSelectedInstruction(instructionId)}
			className={`w-full h-full bg-red-500 p-2 pb-3 flex flex-col align-top ${instructionId == selectedInstruction && "outline"} -outline-offset-[3px] relative`}
			style={{ backgroundColor: colorToHex(instructionId) + '77' }}
		>
			<p className="font-semibold text-sm">{instructionName}</p>
			<p className="text-xs opacity-75">{instructionDesc}</p>
			<code className="absolute top-1 left-2 opacity-40">{instructionId}</code>
			<code className="absolute top-1 right-2 opacity-40">[{colorToKeyWithConfig(instructionId, ideConfig)}]</code>
		</button>
	)
}
