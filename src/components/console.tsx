export default function Console({ consoleLines }: { consoleLines: string[] }) {
    return (
        <div className="bg-daedalus15 w-full h-full flex flex-col">
            <div className="w-full h-full p-2">
                {consoleLines.map((line, i) => (
                    <p className="text-xs opacity-60" key={i}>
                        &gt; {line}{" "}
                    </p>
                ))}
            </div>
            <input
                type="text"
                className="w-full bg-daedalus15 px-2 py-1 border-t-2 border-white border-opacity-50"
                placeholder="Type something in the console..."
                onKeyDown={(e) => e.stopPropagation()}
            />
        </div>
    );
}
