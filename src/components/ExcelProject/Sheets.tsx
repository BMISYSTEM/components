import {
    ChartArea,
    ChartCandlestick,
    ChartColumn,
    ChartLine,
    ChartPie,
    ChartScatter,
    ChevronsLeftRightEllipsis,
    ChevronsRightLeft,
    FileText,
    ImageUp,
    MapPlus,
    PaintBucket,
    Sheet,
    TableConfig,
} from "lucide-react";
import { useEffect, useState } from "react";
import "animate.css";
interface ConfigSheet {
    columns: number;
    rows: number;
    baground: string;
    titleColumn: boolean;
    titleRow: boolean;
}
interface ConfigSheet {
    columns: number;
    rows: number;
    baground: string;
    titleColumn: boolean;
    titleRow: boolean;
}

interface stylesCells {
    cell: string,
    background: string,
}
interface SheetModel {
    sheet: {
        rows: number;
        columns: number;
        defaultRowHeight: number;
        defaultColumnWidth: number;
        background: string;
    };
    values: Record<string, string>;
    styles: stylesCells[];
    merges: string[];
    columnSizes: Record<string, number>;
    rowSizes: Record<string, number>;
}

interface Rangos {
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
}
export const Sheets = () => {
    const [activeCell, setActiveCell] = useState({ row: 0, col: 0 });
    const [rowSelect, setRowSelect] = useState(0);
    const [columnSelect, setColumnSelect] = useState(0);
    const [bagroundColor, setBagroundColor] = useState("")
    const [configSheet, setConfigSheet] = useState<ConfigSheet>({
        baground: "#ffffff",
        columns: 30,
        rows: 40,
        titleColumn: true,
        titleRow: true,
    });
    const [sheetModel, setSheetModel] = useState<SheetModel>({
        sheet: {
            rows: configSheet.rows,
            columns: configSheet.columns,
            defaultRowHeight: 30,
            defaultColumnWidth: 100,
            background: configSheet.baground,
        },
        values: {},
        styles: [],
        merges: [],
        columnSizes: {},
        rowSizes: {},
    });
    const [columnWidths, setColumnWidths] = useState(
        Array(configSheet.columns).fill(100) // ancho inicial de 100px
    );
    const [rowsHeigths, setRowsHeigths] = useState(
        Array(configSheet.rows).fill(30) // ancho inicial de 100px
    );
    const [selection, setSelection] = useState<{
        start: { row: number; col: number } | null;
        end: { row: number; col: number } | null;
    }>({ start: null, end: null });

    const [isSelecting, setIsSelecting] = useState(false);
    // constroles
    const [configuraciones, setConfiguraciones] = useState(false);
    const [graficos, setGraficos] = useState(false);
    const [rangos, setRangos] = useState<Rangos[]>([]);
    function handleKeyDown(e: any, row: number, col: number) {
        let newRow = row;
        let newCol = col;

        switch (e.key) {
            case "ArrowUp":
                newRow = Math.max(row - 1, 0);
                break;
            case "ArrowDown":
                newRow = Math.min(row + 1, configSheet.rows - 1);
                break;
            case "ArrowLeft":
                newCol = Math.max(col - 1, 0);
                break;
            case "ArrowRight":
                newCol = Math.min(col + 1, configSheet.columns - 1);
                break;
            default:
                return;
        }

        e.preventDefault(); // Evita el comportamiento por defecto del input
        setActiveCell({ row: newRow, col: newCol });

        // Mover focus al input de la nueva celda
        const nextInput = document.querySelector(
            `textArea[data-row='${newRow}'][data-col='${newCol}']`
        ) as HTMLInputElement | null;
        nextInput?.focus();
    }
    const handleMouseDownx = (e: any, colIndex: number) => {
        setColumnSelect(colIndex);
        e.preventDefault();

        const startX = e.clientX;
        const startWidth = columnWidths[colIndex];

        const onMouseMove = (eMove: any) => {
            const newWidth = Math.max(startWidth + (eMove.clientX - startX), 30); // ancho mínimo 30px
            setColumnWidths((prev) => {
                const updated = [...prev];
                updated[colIndex] = newWidth;
                return updated;
            });
        };
        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };
    const handleMouseDowny = (e: any, rowIndex: number) => {
        console.log(e)
        setRowSelect(rowIndex + 1);
        e.preventDefault();
        const startY = e.clientY;
        const startHeigth = rowsHeigths[rowIndex];
        console.log(startY, startHeigth);
        const onMouseMove = (eMove: any) => {
            const newHeidth = Math.max(startHeigth + (eMove.clientY - startY), 30);
            setRowsHeigths((prev) => {
                const updated = [...prev];
                updated[rowIndex] = newHeidth;
                return updated;
            });
        };

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    const isActiveCell = (row: number, col: number): boolean => {
        return activeCell.col === col && activeCell.row === row;
    };
    useEffect(() => {
        const stop = () => setIsSelecting(false);
        window.addEventListener("mouseup", stop);
        return () => window.removeEventListener("mouseup", stop);
    }, []);
    const isSelected = (row: number, col: number) => {
        if (!selection.start || !selection.end) return false;
        const r1 = Math.min(selection.start.row, selection.end.row);
        const r2 = Math.max(selection.start.row, selection.end.row);
        const c1 = Math.min(selection.start.col, selection.end.col);
        const c2 = Math.max(selection.start.col, selection.end.col);
        return row >= r1 && row <= r2 && col >= c1 && col <= c2;
    };
    const letrasColumn = (num: number): string => {
        let result = "";

        while (num > 0) {
            num--; // ajuste porque A empieza en 1
            result = String.fromCharCode(65 + (num % 26)) + result;
            num = Math.floor(num / 26);
        }

        return result;
    };
    const mergeSelection = () => {
        if (!selection.start || !selection.end) return;

        const r1 = Math.min(selection.start.row, selection.end.row);
        const r2 = Math.max(selection.start.row, selection.end.row);
        const c1 = Math.min(selection.start.col, selection.end.col) + 1;
        const c2 = Math.max(selection.start.col, selection.end.col) + 1;

        const range =
            `${letrasColumn(c1)}${r1 + 1}:` + `${letrasColumn(c2)}${r2 + 1}`;

        setSheetModel((prev) => ({
            ...prev,
            merges: [...prev.merges, range],
        }));
    };
    const descombinarSeleccion = () => {
        if (!selection.start || !selection.end) return;

        const r1 = Math.min(selection.start.row, selection.end.row);
        const r2 = Math.max(selection.start.row, selection.end.row);
        const c1 = Math.min(selection.start.col, selection.end.col) + 1;
        const c2 = Math.max(selection.start.col, selection.end.col) + 1;

        setRangos(prev =>
            prev.filter(r =>
                !(
                    r.startRow <= r2 &&
                    r.endRow >= r1 &&
                    r.startCol <= c2 &&
                    r.endCol >= c1
                )
            )
        );
    };
    const parseRange = (range: string) => {
        const [a, b] = range.split(":");
        const col = (s: string) => s.replace(/[0-9]/g, "");
        const row = (s: string) => parseInt(s.replace(/[A-Z]/g, "")) - 1;

        return {
            startRow: row(a),
            startCol: col(a).charCodeAt(0) - 65,
            endRow: row(b),
            endCol: col(b).charCodeAt(0) - 65,
        };
    };
    useEffect(() => {
        sheetModel?.merges?.map((m) => {
            const merges = parseRange(m);
            const rang = rangos;
            const newrangos = [...rang, parseRange(m)];
            setRangos(newrangos);
        });
    }, [sheetModel]);
    const getMergeInfo = (row: number, col: number) => {
        const rango = rangos.find(
            (r) =>
                row >= r.startRow &&
                row <= r.endRow &&
                col >= r.startCol &&
                col <= r.endCol
        );

        if (!rango) return null;

        const isMaster = row === rango.startRow && col === rango.startCol;

        return {
            isMaster,
            rowSpan: rango.endRow - rango.startRow + 1,
            colSpan: rango.endCol - rango.startCol + 1,
        };
    };

    const getConfigStyle = (row: number, col: number) => {
        const config = sheetModel;
        const llave = `${col}:${row}`
        const style = config.styles.find(s => s.cell === llave);
        return style
    }
    const changeColorCell = () => {
        const key = `${activeCell.col}:${activeCell.row}`;

        setSheetModel(prev => {
            const exists = prev.styles.find(s => s.cell === key);

            const newStyles = exists
                ? prev.styles.map(s =>
                    s.cell === key
                        ? { ...s, background: bagroundColor }
                        : s
                )
                : [...prev.styles, { cell: key, background: bagroundColor }];

            return {
                ...prev,
                styles: newStyles
            };
        });
    };

    return (
        <section className="flex flex-col">
            <div className="h-auto flex flex-wrap px-5 py-2 gap-1">
                <button className="flex flex-col items-center justify-center gap-1 border h-14 p-1 rounded-sm hover:border-blue-300 ">
                    <FileText size={15} />
                    <span className="text-xs">Imprimir</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-1 border h-14 p-1 rounded-sm hover:border-blue-300 ">
                    <ImageUp size={15} />
                    <span className="text-xs">Cargar</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-1 border h-14 p-1 rounded-sm hover:border-blue-300 ">
                    <Sheet size={15} />
                    <span className="text-xs">Exporta</span>
                </button>
                <button
                    onClick={() => setGraficos(!graficos)}
                    className="flex flex-col items-center justify-center gap-1 border h-14 p-1 rounded-sm hover:border-blue-300 "
                >
                    <ChartPie size={15} />
                    <span className="text-xs">Graficos</span>
                </button>
                <button
                    onClick={() => setConfiguraciones(!configuraciones)}
                    className="flex flex-col items-center justify-center gap-1 border h-14 p-1 rounded-sm hover:border-blue-300 "
                >
                    <TableConfig size={15} />
                    <span className="text-xs">Configuraciones</span>
                </button>
                <button
                    onClick={() => mergeSelection()}
                    className="flex flex-col items-center justify-center gap-1 border h-14 p-1 rounded-sm hover:border-blue-300 "
                >
                    <ChevronsRightLeft size={15} />
                    <span className="text-xs">Combinar Celdas</span>
                </button>
                <button
                    onClick={() => descombinarSeleccion()}
                    className="flex flex-col items-center justify-center gap-1 border h-14 p-1 rounded-sm hover:border-blue-300 "
                >
                    <ChevronsLeftRightEllipsis size={15} />
                    <span className="text-xs">Descombinar Celdas</span>
                </button>
                <div className=" w-96 border border-slate-200 rounded-sm px-5 py-2 flex flex-row  gap-1">
                    <div className="flex flex-row gap-1 items-center justify-center border w-20 py-1 rounded-sm">
                        <PaintBucket size={20} />
                        <div className="w-6 h-6 flex items-center justify-center rounded-full overflow-hidden border" >
                            <input onChange={(e) => setBagroundColor(e.target.value)} onBlur={() => changeColorCell()} type="color" className="w-full h-full" />
                        </div>
                    </div>
                    <div title="Color de letra " className="flex flex-row gap-1 items-center justify-center border w-20 py-1 rounded-sm">
                        <span className="">A</span>
                        <div className="w-6 h-6 flex items-center justify-center rounded-full overflow-hidden border" >
                            <input type="color" className="w-full h-full" />
                        </div>
                    </div>
                    <button title="Negrilla" className="flex flex-row gap-1 items-center justify-center border px-2 py-1 rounded-sm">
                        <span className="font-bold">N</span>
                    </button>
                    <button title="Subrayado" className="flex flex-row gap-1 items-center justify-center border px-2 py-1 rounded-sm">
                        <span className="underline">S</span>
                    </button>
                    <button title="Cursiva " className="flex flex-row gap-1 items-center justify-center border px-2 py-1 rounded-sm">
                        <span className="italic">S</span>
                    </button>
                    <div className="flex flex-row gap-1 items-center justify-center border  py-1 rounded-sm px-3">
                        <span>Tamaño</span>
                        <div className="w-10 flex items-center justify-center overflow-hidden border" >
                            <input type="number" className="w-full h-full" />
                        </div>
                    </div>

                </div>
            </div>
            <input
                type="text"
                value={activeCell.col + "/" + activeCell.row}
                className="w-32 border px-3 border-blue-400 "
            />
            <section
                id="areaImpresion"
                className="flex flex-col w-full h-screen overflow-hidden bg-white"
            >
                <table className="overflow-auto">
                    <thead>
                        <tr className="">
                            {Array.from({ length: configSheet.columns }).map((_, index) => (
                                <th
                                    key={index}
                                    style={{
                                        width: index > 0 ? columnWidths[index] + "px" : "50px",
                                    }}
                                    className="border border-slate-300 text-sm text-black m-0 p-0"
                                >
                                    <div
                                        onClick={() => setColumnSelect(index)}
                                        className="flex flex-row  relative"
                                    >
                                        <span className="font-semibold">{index}</span>
                                        <div
                                            className="absolute right-0 top-0 h-full w-1  cursor-col-resize"
                                            onMouseDown={(e) => handleMouseDownx(e, index)}
                                        ></div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: configSheet.rows }).map((_, index1) => (
                            <tr key={index1} className="p-0 m-0">
                                {Array.from({ length: configSheet.columns }).map(
                                    (_, index2) => {
                                        const merge = getMergeInfo(index1, index2);
                                        if (merge && !merge.isMaster) return null;

                                        return (
                                            <td
                                                key={index2}
                                                rowSpan={merge?.rowSpan}
                                                colSpan={merge?.colSpan}
                                                style={{
                                                    width: index2 > 0 ? "auto" : "50px",
                                                    backgroundColor: isSelected(index1, index2)
                                                        ? "#07BBF280"
                                                        : "transparent",
                                                    height: rowsHeigths[index1],
                                                    margin: "0",
                                                    padding: "0",
                                                    border: index2 === 0 ? "1px solid #cbd5e1" : ""
                                                }}
                                                className="m-0 p-0  text-sm text-black relative"
                                            >
                                                {index2 > 0 ? (
                                                    <>
                                                        {/* overlay de selección */}
                                                        <div
                                                            tabIndex={0}
                                                            className="absolute inset-0 z-10 cursor-cell"
                                                            onKeyDown={(e) => {
                                                                handleKeyDown(e, index1, index2)
                                                            }
                                                            }
                                                            style={{
                                                                backgroundColor: isSelected(index1, index2)
                                                                    ? "#07BBF220"
                                                                    : "transparent",
                                                            }}
                                                            onClick={() => setActiveCell({
                                                                col: index2,
                                                                row: index1
                                                            })}
                                                            onMouseDown={(e) => {
                                                                rowSelect
                                                                e.preventDefault();

                                                                setIsSelecting(true);
                                                                setSelection({
                                                                    start: { row: index1, col: index2 },
                                                                    end: { row: index1, col: index2 },
                                                                });
                                                            }}
                                                            onMouseEnter={() => {
                                                                if (!isSelecting) return;
                                                                setSelection((prev) =>
                                                                    prev.start
                                                                        ? {
                                                                            ...prev,
                                                                            end: { row: index1, col: index2 },
                                                                        }
                                                                        : prev
                                                                );
                                                            }}
                                                            onDoubleClick={(e) => {
                                                                e.stopPropagation();
                                                                const input =
                                                                    e.currentTarget.parentElement?.querySelector(
                                                                        "textArea"
                                                                    ) as HTMLInputElement | null;
                                                                input?.focus();
                                                            }}
                                                        />

                                                        {/* input */}
                                                        <textarea
                                                            data-row={index1}
                                                            data-col={index2}
                                                            onKeyDown={(e) => {
                                                                handleKeyDown(e, index1, index2)
                                                            }
                                                            }
                                                            style={{
                                                                height: "100%",
                                                                margin: 0,
                                                                padding: 0,
                                                                resize: "none",
                                                                backgroundColor: getConfigStyle(index1, index2)?.background ?? ""
                                                            }}

                                                            className="relative m-0 p-0 border  focus:z-50 w-full h-full outline-none focus:ring-1 ring-blue-500"
                                                        />
                                                    </>
                                                ) : (
                                                    <div
                                                        onClick={() => setRowSelect(index1 + 1)}
                                                        className="h-full relative"
                                                    >
                                                        <span>{index1}</span>
                                                        <div
                                                            className="absolute bottom-0 h-1 w-full cursor-row-resize"
                                                            onMouseDown={(e) => handleMouseDowny(e, index1)}
                                                        />
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    }
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            {configuraciones && (
                <section className="animate__animated    animate__fadeInRightBig px-5 py-3 fixed flex flex-col gap-2  h-screen top-0 right-0 w-96 bg-white border-l border-blue-400 z-50">
                    <span className="text-sm font-semibold border-b border-blue-500 py-1">
                        Configuraciones generales{" "}
                    </span>
                    {/* apariencia */}
                    <details>
                        <summary>Apariencia</summary>
                        <div className="flex flex-col  px-1">
                            <div className="flex flex-row gap-2 items-center  px-5 m-0 p-0  ">
                                <span className="text-blue-400">├</span>
                                <input type="checkbox" />
                                <span>Bordes celdas </span>
                            </div>
                            <div className="flex flex-row gap-2 items-center  px-5 m-0 p-0 ">
                                <span className="text-blue-400">├</span>
                                <input type="checkbox" />
                                <span>Titulos Columnas</span>
                            </div>
                            <div className="flex flex-row gap-2 items-center  px-5 m-0 p-0 ">
                                <span className="text-blue-400">├</span>
                                <input type="checkbox" />
                                <span>Titulos Filas</span>
                            </div>
                            <div className="flex flex-row gap-2 items-center  px-5 m-0 p-0 ">
                                <span className="text-blue-400">└</span>
                                <input type="color" />
                                <span>Fondo</span>
                            </div>
                        </div>
                    </details>
                    <details>
                        <summary>Area de impresion</summary>
                        <div className="flex flex-col  px-1">
                            <div className="flex flex-row gap-2 items-center  px-5 m-0 p-0  ">
                                <span className="text-blue-400">├</span>
                                <span className="text-xs">Rango de impresion </span>
                                <input
                                    type="text"
                                    className="border rounded-sm border-blue-400 px-1"
                                    placeholder="columna:Fila"
                                />
                            </div>
                            <div className="flex flex-row gap-2 items-center  px-5 m-0 p-0  ">
                                <span className="text-blue-400">├</span>
                                <span className="text-xs">Rango de Titulos </span>
                                <input
                                    type="text"
                                    className="border rounded-sm border-blue-400 px-1"
                                    placeholder="columna:Fila"
                                />
                            </div>
                            <div className="flex flex-row gap-2 items-center  px-5 m-0 p-0  ">
                                <span className="text-blue-400">├</span>
                                <span className="text-xs">Rango de Contenido </span>
                                <input
                                    type="text"
                                    className="border rounded-sm border-blue-400 px-1"
                                    placeholder="columna:Fila"
                                />
                            </div>
                            <div className="flex flex-row gap-2 items-center  px-5 m-0 p-0  ">
                                <span className="text-blue-400">└</span>
                                <span className="text-xs">Rango de Pie de pagina</span>
                                <input
                                    type="text"
                                    className="border rounded-sm border-blue-400 px-1"
                                    placeholder="columna:Fila"
                                />
                            </div>
                        </div>
                    </details>
                </section>
            )}
            {graficos && (
                <section className="animate__animated    animate__fadeInRightBig px-5 py-3 fixed flex flex-col gap-2  h-screen top-0 right-0 w-96 bg-white border-l border-blue-400 z-50">
                    <span className="text-sm font-semibold border-b border-blue-500 py-1">
                        Selecciona la grafica{" "}
                    </span>
                    {/* apariencia */}
                    <div className="flex flex-wrap gap-1 items-center justify-center">
                        <div className=" w-32 h-20 flex flex-col gap-2  items-center justify-center border p-2 rounded-sm border-blue-400 hover:bg-gray-200 ">
                            <ChartColumn size={30} />
                            <span className="text-sm">Barras </span>
                        </div>
                        <div className="flex w-32 h-20 flex-col gap-2  items-center justify-center border p-2 rounded-sm border-blue-400 hover:bg-gray-200 ">
                            <ChartLine size={30} />
                            <span className="text-sm">Lineas </span>
                        </div>
                        <div className="flex w-32 h-20 flex-col gap-2  items-center justify-center border p-2 rounded-sm border-blue-400 hover:bg-gray-200 ">
                            <ChartPie size={30} />
                            <span className="text-sm">Torta </span>
                        </div>
                        <div className="flex w-32 h-20 flex-col gap-2  items-center justify-center border p-2 rounded-sm border-blue-400 hover:bg-gray-200 ">
                            <ChartCandlestick size={30} />
                            <span className="text-sm">Velas </span>
                        </div>
                        <div className="flex w-32 h-20 flex-col gap-2  items-center justify-center border p-2 rounded-sm border-blue-400 hover:bg-gray-200 ">
                            <ChartScatter size={30} />
                            <span className="text-sm">Dispercion </span>
                        </div>
                        <div className="flex w-32 h-20 flex-col gap-2  items-center justify-center border p-2 rounded-sm border-blue-400 hover:bg-gray-200 ">
                            <ChartArea size={30} />
                            <span className="text-sm">Area </span>
                        </div>
                        <div className="flex w-32 h-20 flex-col gap-2  items-center justify-center border p-2 rounded-sm border-blue-400 hover:bg-gray-200 ">
                            <MapPlus size={30} />
                            <span className="text-sm">Mapa </span>
                        </div>
                    </div>
                </section>
            )}
        </section>
    );
};

/* backgroundColor: isSelected(index1, index2)
                          ? "#07BBF280"
                          : "transparent", */
