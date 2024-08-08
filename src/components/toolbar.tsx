import { Dispatch, MouseEventHandler, ReactNode, SetStateAction, useState } from "react";
import { GoGear, GoPlay, GoDownload, GoUpload } from "react-icons/go"

export default function Toolbar({ setSettingsOpen }: {
	setSettingsOpen: Dispatch<SetStateAction<boolean>>,
}) {

	return (
		<div className="h-12 w-auto border-2 border-daedalus11 bg-daedalus15 flex flex-row">
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
		</div>
	)
}

function ToolbarButton({ children, title, onClick }: {
	children: ReactNode,
	title?: string,
	onClick?: MouseEventHandler<HTMLButtonElement>
}) {
	const [hovered, setHovered] = useState(false);

	return (
		<button
			title={title || ""}
			className={`w-12 place-items-center grid ${hovered && "bg-daedalus14"}`}
			onClick={onClick}
			onMouseOver={() => setHovered(true)}
			onMouseOut={() => setHovered(false)}
		>
			{children}
		</button>
	)
}
