import { colorToKeyWithConfig, IdeConfig } from "@/scripts/config";
import { colorToHex, instructionNamesAndId, numberToPixelArray, PixelColor } from "@/scripts/daedalus";
import { Dispatch, MouseEventHandler, ReactNode, SetStateAction, useState } from "react";
import { GoGear, GoPlay, GoDownload, GoUpload, GoPlus, GoDiff, GoSync } from "react-icons/go"
import { defaultUnitLen } from "./grid";

export default function Toolbar({ setSettingsOpen, selectedInstruction, ideConfig, updateUnitLen, updatePos }: {
	setSettingsOpen: Dispatch<SetStateAction<boolean>>,
	selectedInstruction: PixelColor,
	ideConfig: IdeConfig,
	updateUnitLen: (unitLen: number) => void,
	updatePos: (pos: [number, number]) => void,
}) {
	const [literalNumber, setLiteralNumber] = useState<'' | '-' | bigint>(BigInt(16434824));
	const [isSigned, setIsSigned] = useState(true);

	return (
		<div
			className="h-12 w-auto border-2 border-daedalus11 bg-daedalus15 flex flex-row"
			onMouseDown={(e) => e.stopPropagation()}
		>
			<div
				className="w-28 grid place-items-center"
				style={{ backgroundColor: colorToHex(selectedInstruction) + '77' }}
			>
				<p className="font-semibold text-sm">{instructionNamesAndId[selectedInstruction][0]}</p>
			</div>
			<div className="w-[2px] bg-daedalus11" />
			<ToolbarButton title="Run Code">
				<GoPlay size={24} />
			</ToolbarButton>
			<ToolbarButton title="Dowload Program as PNG">
				<GoDownload size={24} />
			</ToolbarButton>
			<ToolbarButton title="Upload Program PNG">
				<GoUpload size={24} />
			</ToolbarButton>
			<ToolbarButton title="Change Settings" onClick={() => setSettingsOpen(true)}>
				<GoGear size={24} />
			</ToolbarButton>
			<div className="w-[2px] bg-daedalus11" />
			<ToolbarButton
				title="Reset Grid Transform"
				onClick={() => {
					updateUnitLen(defaultUnitLen);
					updatePos([defaultUnitLen, defaultUnitLen]);
				}}
			>
				<GoSync size={24} />
			</ToolbarButton>
			<div className="w-[2px] bg-daedalus11" />
			<div className="w-24 py-2 pl-2">
				<input
					type="text"
					pattern="[0-9]*"
					title="Generate Literal Pixel Colors for a Number"
					value={literalNumber.toString()}
					className="w-full h-full bg-daedalus14 outline-none px-2 text-sm"
					placeholder="Number"
					onKeyDown={(e) => e.stopPropagation()}
					onChange={(e) => {
						if (e.target.value == '') {
							setLiteralNumber('');
							return;
						} else if (e.target.value == '-') {
							setLiteralNumber('-');
							return;
						}
						try {
							const bigNum = BigInt(e.target.value);
							setLiteralNumber(bigNum);
						} catch {
							return;
						}
					}}
				/>
			</div>
			<ToolbarButton title="Toggle Signed/Unsigned" onClick={() => setIsSigned(!isSigned)} customWidth="w-8">
				{isSigned ? <GoDiff size={24} /> : <GoPlus size={24} />}
			</ToolbarButton>
			<div className="max-w-96 flex flex-row overflow-scroll">
				{numberToPixelArray(literalNumber, isSigned).map((pixelVal, i) => (
					<div
						key={i}
						className="w-10 relative flex-none"
						style={{ backgroundColor: colorToHex(pixelVal) + '99' }}
					>
						<code className="absolute top-1 left-2 font-bold text-xs">{pixelVal}</code>
						<code className="absolute bottom-1 right-1 font-bold text-xs opacity-40">{i}[{colorToKeyWithConfig(pixelVal, ideConfig)}]</code>
					</div>
				))}
			</div>
		</div >
	)
}

function ToolbarButton({ children, title, onClick, customWidth }: {
	children: ReactNode,
	title?: string,
	onClick?: MouseEventHandler<HTMLButtonElement>
	customWidth?: string,
}) {
	const [hovered, setHovered] = useState(false);

	return (
		<button
			title={title || ""}
			className={`${customWidth ? customWidth : "w-12"} flex-none place-items-center grid ${hovered && "bg-daedalus14"}`}
			onClick={onClick}
			onMouseOver={() => setHovered(true)}
			onMouseOut={() => setHovered(false)}
		>
			{children}
		</button>
	)
}
