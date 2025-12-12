import { useEffect, useState } from "react"
interface ConfigSheet {
    columns: number,
    rows: number,
    baground: string,
    titleColumn: boolean,
    titleRow: boolean
}

export const Sheets = () => {
    const [activeCell, setActiveCell] = useState({ row: 0, col: 0 });
    const [rowSelect,setRowSelect] = useState(0)
    const [columnSelect,setColumnSelect] = useState(0)
    const [configSheet, setConfigSheet] = useState<ConfigSheet>({
        baground: "#ffffff",
        columns: 20,
        rows: 30,
        titleColumn: true,
        titleRow: true
    })
    const [columnWidths, setColumnWidths] = useState(
        Array(configSheet.columns).fill(100) // ancho inicial de 100px
    );
    const [rowsHeigths, setRowsHeigths] = useState(
        Array(configSheet.rows).fill(30) // ancho inicial de 100px
    );
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
            `input[data-row='${newRow}'][data-col='${newCol}']`
        ) as HTMLInputElement | null;
        nextInput?.focus();
    }
    const handleMouseDownx = (e: any, colIndex: number) => {
            setColumnSelect(colIndex)
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
            setRowSelect((rowIndex+1))
            e.preventDefault();
            const startY = e.clientY;
            const startHeigth = rowsHeigths[rowIndex];
            console.log(startY,startHeigth)
            const onMouseMove = (eMove: any) => {
                const newHeidth = Math.max(startHeigth + (eMove.clientY - startY), 30); // ancho mínimo 30px
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

    return (
        <section className="flex flex-col w-full h-screen overflow-hidden bg-white">
            <table className="overflow-auto">
                <thead>
                    <tr className="">
                        {Array.from({ length: configSheet.columns }).map((_, index) => (
                            <th key={index}
                                style={{
                                    width: index > 0 ? columnWidths[index] + "px" : "50px",
                                }}
                                className="border border-slate-300 text-sm text-black m-0 p-0"
                            >
                                <div onClick={()=>setColumnSelect((index))} className="flex flex-row  relative">
                                    <span className="font-semibold">
                                        {index} 
                                    </span>
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
                    {
                        Array.from({ length: configSheet.rows }).map((_, index1) => (
                            <tr key={index1} className="p-0 m-0 "
                                
                            >
                                {Array.from({ length: configSheet.columns }).map((_, index2) => (
                                    <td key={index2}
                                        style={{
                                            width: index2 > 0 ? "auto" : "50px",
                                            background: index2 > 0 ? "transparent" : "#E0E0E0",
                                            height: "30px",
                                            margin:"0",
                                            padding:"0"
                                        }}
                                        className="m-0 p-0 border border-slate-300 text-sm text-black "
                                    >
                                        {index2 > 0 ?
                                            <input
                                                data-row={index1}
                                                data-col={index2}
                                                onKeyDown={(e) => handleKeyDown(e, index1, index2)}
                                                type="text"
                                                style={{
                                                    height:rowsHeigths[index1],
                                                    margin:"0",padding:"0",
                                                    backgroundColor:rowSelect === (index1+1) ? "#07BBF280" :
                                                    columnSelect === (index2) ? "#07BBF280" :
                                                    "transparent"
                                                    
                                                }}
                                                onFocus={()=>{
                                                    setRowSelect(0)
                                                    setColumnSelect(0)
                                                }}
                                                className="w-full h-full m-0 p-0 border-0 border-none outline-none
                                                focus:ring-1 ring-blue-500
                                                "
                                            />
                                            // imagen 
                                            :
                                            <div
                                            onClick={()=>setRowSelect((index1+1))}
                                            className="h-full relative">
                                                <span>{index1}</span>
                                                <div
                                                    className="absolute bottom-0  h-1 w-full  cursor-row-resize"
                                                    onMouseDown={(e) => handleMouseDowny(e, index1)}
                                                ></div>
                                            </div>
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))
                    }
                </tbody>
            </table>


        </section>
    )
}
