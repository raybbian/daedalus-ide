import { colorToKeyWithConfig, IdeConfig } from "@/scripts/config";
import {
    colorToHex,
    instructionNamesAndId,
    numberToPixelArray,
    PixelColor,
} from "@/scripts/daedalus";
import {
    ChangeEvent,
    Dispatch,
    MouseEventHandler,
    MutableRefObject,
    ReactNode,
    SetStateAction,
    useId,
    useState,
} from "react";
import {
    GoGear,
    GoPlay,
    GoDownload,
    GoUpload,
    GoPlus,
    GoDiff,
    GoSync,
} from "react-icons/go";
import { defaultUnitLen } from "./grid";
import { DrawContext } from "@/scripts/draw_context";

export default function Toolbar({
    setSettingsOpen,
    selectedInstruction,
    ideConfig,
    updateUnitLen,
    updatePos,
    render,
    ioRef,
    drawCtxRef,
}: {
    setSettingsOpen: Dispatch<SetStateAction<boolean>>;
    selectedInstruction: PixelColor;
    ideConfig: IdeConfig;
    updateUnitLen: (unitLen: number) => void;
    updatePos: (pos: [number, number]) => void;
    render: (changedPixels: boolean) => void;
    ioRef: MutableRefObject<HTMLCanvasElement | null>;
    drawCtxRef: MutableRefObject<DrawContext>;
}) {
    const [literalNumber, setLiteralNumber] = useState<"" | "-" | bigint>(
        BigInt(16434824),
    );
    const [isSigned, setIsSigned] = useState(true);
    const uploadButtonId = useId();

    function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files) return;
        const file = files[0];
        if (!file || file.type != "image/png") return;
        const reader = new FileReader();

        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                const canvas = ioRef.current;
                if (canvas == null) return;
                const ctx = canvas.getContext("2d");
                if (ctx == null) return;

                canvas.width = img.width;
                canvas.height = img.height;

                ctx.drawImage(img, 0, 0);
                drawCtxRef.current.importFromCanvas(ioRef);
                render(true);
            };
            if (e.target == null) return;
            img.src = e.target.result as string;
        };

        reader.readAsDataURL(file);
    }

    function handleImageDownload() {
        const dataString = drawCtxRef.current.exportToPng(ioRef);
        if (dataString == null) return;
        const link = document.createElement("a");
        link.href = dataString;
        link.setAttribute("download", "daedalus-program.png");
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
    }

    return (
        <div
            className="h-12 w-auto border-2 border-daedalus11 bg-daedalus15 flex flex-row overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
        >
            <div
                className="w-28 grid place-items-center"
                style={{
                    backgroundColor: colorToHex(selectedInstruction) + "77",
                }}
            >
                <p className="font-semibold text-sm">
                    {instructionNamesAndId[selectedInstruction][0]}
                </p>
            </div>
            <div className="w-[2px] bg-daedalus11" />
            <ToolbarButton title="Run Code">
                <GoPlay size={24} />
            </ToolbarButton>
            <ToolbarButton
                title="Dowload Program as PNG"
                onClick={() => handleImageDownload()}
            >
                <GoDownload size={24} />
            </ToolbarButton>
            <ToolbarButton title="Upload Program PNG">
                <label
                    htmlFor={uploadButtonId}
                    className="cursor-pointer w-full h-full grid place-items-center"
                >
                    <GoUpload size={24} />
                </label>
            </ToolbarButton>
            <input
                type="file"
                id={uploadButtonId}
                className="hidden"
                accept="image/png"
                onChange={handleImageUpload}
                onClick={(e) => (e.currentTarget.value = "")}
            />
            <ToolbarButton
                title="Change Settings"
                onClick={() => setSettingsOpen(true)}
            >
                <GoGear size={24} />
            </ToolbarButton>
            <div className="w-[2px] bg-daedalus11" />
            <ToolbarButton
                title="Reset Grid Transform"
                onClick={() => {
                    updateUnitLen(defaultUnitLen);
                    updatePos([0, 0]);
                    render(false);
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
                        if (e.target.value == "") {
                            setLiteralNumber("");
                            return;
                        } else if (e.target.value == "-") {
                            setLiteralNumber("-");
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
            <ToolbarButton
                title="Toggle Signed/Unsigned"
                onClick={() => setIsSigned(!isSigned)}
                customWidth="w-8"
            >
                {isSigned ? <GoDiff size={24} /> : <GoPlus size={24} />}
            </ToolbarButton>
            <div
                className="max-w-64 flex flex-row overflow-scroll"
                onWheel={(e) => e.stopPropagation()}
            >
                {numberToPixelArray(literalNumber, isSigned).map(
                    (pixelVal, i) => (
                        <div
                            key={i}
                            className="w-10 relative flex-none"
                            style={{
                                backgroundColor: colorToHex(pixelVal) + "99",
                            }}
                        >
                            <code className="absolute top-1 left-2 font-bold text-xs">
                                {pixelVal}
                            </code>
                            <code className="absolute bottom-1 right-1 font-bold text-xs opacity-40">
                                {i}[{colorToKeyWithConfig(pixelVal, ideConfig)}]
                            </code>
                        </div>
                    ),
                )}
            </div>
        </div>
    );
}

function ToolbarButton({
    children,
    title,
    onClick,
    customWidth,
}: {
    children: ReactNode;
    title?: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    customWidth?: string;
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
    );
}
