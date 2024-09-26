import { PixelColor } from "@/scripts/daedalus";
import Grid, { renderGrid } from "@/components/grid";
import {
    useRef,
    useState,
    useEffect,
    MouseEvent as ReactMouseEvent,
    KeyboardEvent,
} from "react";
import SidePanel from "@/components/side_panel";
import Settings from "@/components/settings";
import {
    IdeConfig,
    defaultConfig,
    keyToColorWithConfig,
} from "@/scripts/config";
import { DrawContext } from "@/scripts/draw_context";
import Console from "./console";

export default function Ide() {
    const [selectedInstruction, setSelectedInstruction] =
        useState<PixelColor>(0);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [ideConfig, setIdeConfig] = useState(defaultConfig);
    const [consoleLines, setConsoleLines] = useState<string[]>([
        "Welcome to the Daedalus IDE! This is the console - you will interact with and see compile errors for your program here.",
    ]);

    const drawCtxRef = useRef<DrawContext>(
        new DrawContext().initWithDefaultProgram(),
    );
    const ideRef = useRef<HTMLDivElement | null>(null);
    const ioRef = useRef<HTMLCanvasElement | null>(null);

    // WebGL stuff
    const lineProgramRef = useRef<WebGLProgram | null>(null);
    const pixelProgramRef = useRef<WebGLProgram | null>(null);
    const glRef = useRef<WebGL2RenderingContext | null>(null);

    // Initialize or load IDE Config
    useEffect(() => {
        function loadConfig() {
            const item = localStorage.getItem("ideConfig");
            if (!item) {
                localStorage.setItem(
                    "ideConfig",
                    JSON.stringify(defaultConfig),
                );
                return;
            }
            const config = JSON.parse(item);
            if (!config) {
                localStorage.setItem(
                    "ideConfig",
                    JSON.stringify(defaultConfig),
                );
                return;
            }
            const typedConfig: IdeConfig = {
                keybindConfig: config.keybindConfig,
            };
            setIdeConfig(typedConfig);
        }
        loadConfig();
        ideRef.current?.focus();
    }, [ideRef]);

    // Store the IDE Config when it changes
    useEffect(() => {
        localStorage.setItem("ideConfig", JSON.stringify(ideConfig));
    }, [ideConfig]);

    function handleClick(
        pos: [number, number],
        e: ReactMouseEvent<HTMLDivElement, MouseEvent>,
    ) {
        if (e.button == 0) {
            drawCtxRef.current.setPixel(pos[0], pos[1], selectedInstruction);
            requestAnimationFrame(() =>
                renderGrid(
                    glRef.current,
                    lineProgramRef.current,
                    pixelProgramRef.current,
                    drawCtxRef.current.gridMap,
                    true,
                ),
            );
        } else if (e.button == 2) {
            drawCtxRef.current.setPixel(pos[0], pos[1], 15);
            requestAnimationFrame(() =>
                renderGrid(
                    glRef.current,
                    lineProgramRef.current,
                    pixelProgramRef.current,
                    drawCtxRef.current.gridMap,
                    true,
                ),
            );
        }
    }

    // TODO: cleanup preview code (new shader?)
    function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
        let instruction = keyToColorWithConfig(e.key, ideConfig);
        if (instruction == null) return;
        setSelectedInstruction(instruction);
    }

    return (
        <div
            className="w-full h-full flex flex-row"
            onKeyDown={handleKeyDown}
            ref={ideRef}
            tabIndex={0}
        >
            <div className="w-96 min-w-96 h-full overflow-hidden border-daedalus11 border-r-2 flex flex-col">
                <div className="w-full overflow-scroll">
                    <SidePanel
                        selectedInstruction={selectedInstruction}
                        setSelectedInstruction={setSelectedInstruction}
                        ideConfig={ideConfig}
                    />
                </div>
                <div className="h-52 min-h-52 w-full flex-none border-t-2 border-daedalus11">
                    <Console consoleLines={consoleLines} />
                </div>
            </div>
            <div className="h-full w-full">
                <Grid
                    drawCtxRef={drawCtxRef}
                    glRef={glRef}
                    lineProgramRef={lineProgramRef}
                    pixelProgramRef={pixelProgramRef}
                    onMouseDown={handleClick}
                    onMouseGrid={() => {}}
                    setSettingsOpen={setSettingsOpen}
                    selectedInstruction={selectedInstruction}
                    ideConfig={ideConfig}
                    ioRef={ioRef}
                />
            </div>
            {settingsOpen && (
                <div className="absolute w-full h-full">
                    <Settings
                        setSettingsOpen={setSettingsOpen}
                        ideConfig={ideConfig}
                        setIdeConfig={setIdeConfig}
                        ideRef={ideRef}
                    />
                </div>
            )}
            <canvas className="hidden" ref={ioRef} />
        </div>
    );
}
