import { Dispatch, MutableRefObject, SetStateAction } from "react"
import { GoX } from "react-icons/go";
import { DrawMode, drawModes, IdeConfig, KeybindConfig, keybindConfigs } from "@/scripts/config"

export default function Settings({ setSettingsOpen, ideConfig, setIdeConfig, ideRef }: {
	setSettingsOpen: Dispatch<SetStateAction<boolean>>,
	ideConfig: IdeConfig,
	setIdeConfig: Dispatch<SetStateAction<IdeConfig>>,
	ideRef: MutableRefObject<HTMLDivElement | null>
}) {
	return (
		<div
			className="w-full h-full bg-black bg-opacity-30 grid place-items-center"
			onClick={() => {
				setSettingsOpen(false);
				ideRef.current?.focus();
			}}
		>
			<form
				className="border-2 border-white p-4 max-w-[32rem] max-h-[66%] bg-daedalus15 relative flex flex-col gap-3 z-10 overflow-scroll"
				onSubmit={(e) => e.preventDefault()}
				onClick={(e) => e.stopPropagation()}
			>
				<button
					className="absolute top-2 right-2"
					onClick={() => {
						setSettingsOpen(false);
						ideRef.current?.focus();
					}}
				>
					<GoX size={24} />
				</button>
				<div className="w-full flex flex-col gap-1">
					<h1 className="text-xl font-bold">Settings</h1>
					<p className="opacity-75 text-sm">
						Settings are stored in your browser&apos;s localStorage. They may be wiped if you clear your browser cache!
					</p>
				</div>
				<div className="w-full flex flex-col gap-1">
					<h2 className="text-lg font-bold">Keybind Preset</h2>
					<p className="opacity-75 text-sm">
						Keybinds for instructions are given in a 4x4 grid pattern on your physical keyboard. Change this setting if you use an alternate keyboard layout so that this grid pattern is reflected to update your layout.
					</p>
					<div className="flex flex-row w-full gap-x-4 flex-wrap">
						{keybindConfigs.map((configName: KeybindConfig, i) => (
							<div key={i} className="flex flex-row gap-2">
								<input
									type="radio"
									name="keybindConfig"
									id={configName}
									value={configName}
									checked={ideConfig.keybindConfig == configName}
									onChange={(e) =>
										setIdeConfig({ ...ideConfig, keybindConfig: e.currentTarget.value as KeybindConfig })
									}
								/>
								<label htmlFor={configName}>{configName}</label>
							</div>
						))}
					</div>
				</div>
				<div className="w-full flex flex-col gap-1">
					<h2 className="text-lg font-bold">Draw Mode</h2>
					<p className="opacity-75 text-sm">
						Assisted draw mode is like autocomplete for Daedalus. Instructions requiring the instruction prefix will automatically be prefixed, and literal values will be generated for you. Free draw mode is what the name implies: paint pixels wherever!
					</p>
					<div className="flex flex-row w-full gap-x-4 flex-wrap">
						{drawModes.map((drawMode: DrawMode, i) => (
							<div key={i} className="flex flex-row gap-2">
								<input
									type="radio"
									name="drawMode"
									id={drawMode}
									value={drawMode}
									checked={ideConfig.drawMode == drawMode}
									onChange={(e) =>
										setIdeConfig({ ...ideConfig, drawMode: e.currentTarget.value as DrawMode })
									}
								/>
								<label htmlFor={drawMode}>{drawMode}</label>
							</div>
						))}
					</div>
				</div>
			</form>
		</div >
	)
}
