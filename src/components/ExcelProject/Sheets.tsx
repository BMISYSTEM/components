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
import { useEffect, useState, useRef } from "react";
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
    background?: string,
    borderTop?: string,
    borderBottom?: string,
    borderLeft?: string,
    borderRight?: string,
    borderAll?: string,
    align?: "left" | "center" | "right" | "justify",
    vAlign?: "top" | "middle" | "bottom",
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
    AreaImpresion:string // 1:1,5:9 columna:Fila
    images?: ImageItem[];
}

interface ImageItem {
    id: string;
    src: string; // data URL
    top: number; // px relative to container
    left: number; // px
    width: number; // px
    height: number; // px
    cell?: string; // optional cell key "col:row"
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
        columns: 60,
        rows: 60,
        titleColumn: true,
        titleRow: true,
    });
    const [sheetModel, setSheetModel] = useState<SheetModel>({
        sheet: {
            rows: configSheet.rows,
            columns: configSheet.columns,
            defaultRowHeight: 5,
            defaultColumnWidth: 5,
            background: configSheet.baground,
        },
        values: {},
        styles: [],
        merges: [],
        columnSizes: {},
        rowSizes: {},
        AreaImpresion: "",
        images: [],
    });
    const [columnWidths, setColumnWidths] = useState(
        Array(configSheet.columns).fill(100) // ancho inicial de 100px
    );
    const [rowsHeigths, setRowsHeigths] = useState(
        Array(configSheet.rows).fill(30) // ancho inicial de 100px
    );
    useEffect(() => {
        // Aplicar al state local los tamaños que existan en el modelo,
        // pero NO escribir defaults en sheetModel. Solo las columnas/filas
        // presentes en sheetModel se aplican — las demás quedan como están.
        if (sheetModel.columnSizes && Object.keys(sheetModel.columnSizes).length > 0) {
            setColumnWidths((prev) => prev.map((w, i) => (sheetModel.columnSizes[i] ?? w)));
        }

        if (sheetModel.rowSizes && Object.keys(sheetModel.rowSizes).length > 0) {
            setRowsHeigths((prev) => prev.map((h, i) => (sheetModel.rowSizes[i] ?? h)));
        }
    }, [sheetModel.columnSizes, sheetModel.rowSizes]);
    const [selection, setSelection] = useState<{
        start: { row: number; col: number } | null;
        end: { row: number; col: number } | null;
    }>({ start: null, end: null });

    const [isSelecting, setIsSelecting] = useState(false);
    // constroles
    const [configuraciones, setConfiguraciones] = useState(false);
    const [graficos, setGraficos] = useState(false);
    const [rangos, setRangos] = useState<Rangos[]>([]);
    const [savedRange, setSavedRange] = useState<Rangos | null>(null);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const autoPrintRef = useRef(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
    const STORAGE_KEY = "sheets_model_v1";
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
    const resizeRef = useRef<{
        id: string;
        startX: number;
        startY: number;
        startW: number;
        startH: number;
    } | null>(null);
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
                // persistir tamaño en el modelo
                setColumnSize(colIndex, newWidth);
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
                // persistir tamaño en el modelo
                setRowSize(rowIndex, newHeidth);
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

        // Si la selección es una sola celda, no descombinar (evita descombinar al hacer click)
        if (r1 === r2 && c1 === c2) {
            alert("Selecciona un rango mayor a una celda para descombinar.");
            return;
        }

        // Actualizar merges en el modelo, filtrando aquellos que intersecten la selección
        setSheetModel((prev) => ({
            ...prev,
            merges: prev.merges.filter((m) => {
                try {
                    const parsed = parseRange(m);
                    const mr1 = parsed.startRow;
                    const mr2 = parsed.endRow;
                    const mc1 = parsed.startCol + 1;
                    const mc2 = parsed.endCol + 1;

                    // Si el merge NO intersecta la selección, lo mantenemos
                    const intersects = !(mr2 < r1 || mr1 > r2 || mc2 < c1 || mc1 > c2);
                    return !intersects;
                } catch (e) {
                    return true;
                }
            }),
        }));
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
        if (!sheetModel?.merges) return;
        const newRangos = sheetModel.merges.map((m) => parseRange(m));
        setRangos(newRangos);
    }, [sheetModel.merges]);
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
    // actualizar savedRange cuando cambie AreaImpresion
    useEffect(() => {
        if (sheetModel.AreaImpresion) {
            try {
                setSavedRange(parseRange(sheetModel.AreaImpresion));
            } catch (e) {
                setSavedRange(null);
            }
        } else {
            setSavedRange(null);
        }
    }, [sheetModel.AreaImpresion]);
    // helpers para valores y estilos de celdas
    const getCellKey = (row: number, col: number) => `${col}:${row}`;

    const getCellValue = (row: number, col: number) => {
        return sheetModel.values[getCellKey(row, col)] ?? "";
    };

    const getConfigStyle = (row: number, col: number) => {
        return sheetModel.styles.find((s) => s.cell === getCellKey(row, col));
    };

    const getCellStyle = (row: number, col: number) => {
        const cfg = getConfigStyle(row, col);
        return cfg?.background ?? sheetModel.sheet.background ?? "transparent";
    };

    const saveTextSheets = (text: string, row: number, col: number) => {
        const key = getCellKey(row, col);
        setSheetModel((prev) => ({ ...prev, values: { ...prev.values, [key]: text } }));
    };

    const changeColorCell = () => {
        const key = `${activeCell.col}:${activeCell.row}`;
        setSheetModel((prev) => {
            const exists = prev.styles.find((s) => s.cell === key);
            if (exists) {
                return { ...prev, styles: prev.styles.map((s) => (s.cell === key ? { ...s, background: bagroundColor } : s)) };
            }
            return { ...prev, styles: [...prev.styles, { cell: key, background: bagroundColor }] };
        });
    };

    const markSelectionAsArea = () => {
        if (!selection.start || !selection.end) return alert("Selecciona un rango primero");
        const r1 = Math.min(selection.start.row, selection.end.row);
        const r2 = Math.max(selection.start.row, selection.end.row);
        const c1 = Math.min(selection.start.col, selection.end.col) + 1;
        const c2 = Math.max(selection.start.col, selection.end.col) + 1;
        const range = `${letrasColumn(c1)}${r1 + 1}:${letrasColumn(c2)}${r2 + 1}`;
        saveAreaImpresion(range);
        setSavedRange(parseRange(range));
    };

    /*  guardar color de las celdas en el json  */
    const saveColorSheets = (color: string, row: number, col: number) => {
        const key = `${col}:${row}`;
        setSheetModel((prev) => {
            const exists = prev.styles.find((s) => s.cell === key);
            const newStyles = exists
                ? prev.styles.map((s) => (s.cell === key ? { ...s, background: color } : s))
                : [...prev.styles, { cell: key, background: color }];

            return {
                ...prev,
                styles: newStyles,
            };
        });
    };
    /* columnas / filas tamaños */
    const setColumnSize = (col: number, size: number) => {
        setSheetModel((prev) => ({
            ...prev,
            columnSizes: {
                ...prev.columnSizes,
                [col]: Math.max(30, Math.round(size)),
            },
        }));
    };

    const setRowSize = (row: number, size: number) => {
        setSheetModel((prev) => ({
            ...prev,
            rowSizes: {
                ...prev.rowSizes,
                [row]: Math.max(30, Math.round(size)),
            },
        }));
    };
    const saveAreaImpresion = (rango:string) =>{
        setSheetModel((prev) => ({
            ...prev,
            AreaImpresion: rango,
        }));
    }

    // persistir sheetModel en localStorage cuando cambie
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sheetModel));
        } catch (e) {
            console.warn("No se pudo guardar sheetModel en localStorage", e);
        }
    }, [sheetModel]);

    const setCellBorder = (cellKey: string, borderSpec: Partial<stylesCells>) => {
        setSheetModel((prev) => {
            const exists = prev.styles.find((s) => s.cell === cellKey);
            if (exists) {
                const updated = prev.styles.map((s) =>
                    s.cell === cellKey ? { ...s, ...borderSpec } : s
                );
                return { ...prev, styles: updated };
            }
            return { ...prev, styles: [...prev.styles, { cell: cellKey, ...borderSpec }] };
        });
    };

    const applyBorderToSelection = (which: "top" | "bottom" | "left" | "right" | "all" | "none") => {
        const borderVal = which === "none" ? undefined : "1px solid #000";

        const applyToCell = (r: number, c: number) => {
            const key = `${c}:${r}`;
            if (which === "all") {
                setCellBorder(key, { borderAll: borderVal, borderTop: borderVal, borderBottom: borderVal, borderLeft: borderVal, borderRight: borderVal });
            } else if (which === "none") {
                setCellBorder(key, { borderAll: undefined, borderTop: undefined, borderBottom: undefined, borderLeft: undefined, borderRight: undefined });
            } else if (which === "top") {
                setCellBorder(key, { borderTop: borderVal });
            } else if (which === "bottom") {
                setCellBorder(key, { borderBottom: borderVal });
            } else if (which === "left") {
                setCellBorder(key, { borderLeft: borderVal });
            } else if (which === "right") {
                setCellBorder(key, { borderRight: borderVal });
            }
        };

        if (selection.start && selection.end) {
            const r1 = Math.min(selection.start.row, selection.end.row);
            const r2 = Math.max(selection.start.row, selection.end.row);
            const c1 = Math.min(selection.start.col, selection.end.col);
            const c2 = Math.max(selection.start.col, selection.end.col);

            for (let r = r1; r <= r2; r++) {
                for (let c = c1; c <= c2; c++) {
                    applyToCell(r, c);
                }
            }
            return;
        }

        // si no hay selección, aplicar a la celda activa
        applyToCell(activeCell.row, activeCell.col);
    };

    const setCellAlignment = (cellKey: string, align: "left" | "center" | "right" | "justify") => {
        setSheetModel((prev) => {
            const exists = prev.styles.find((s) => s.cell === cellKey);
            if (exists) {
                const updated = prev.styles.map((s) => (s.cell === cellKey ? { ...s, align } : s));
                return { ...prev, styles: updated };
            }
            return { ...prev, styles: [...prev.styles, { cell: cellKey, align }] };
        });
    };

    const setCellVAlignment = (cellKey: string, vAlign: "top" | "middle" | "bottom") => {
        setSheetModel((prev) => {
            const exists = prev.styles.find((s) => s.cell === cellKey);
            if (exists) {
                const updated = prev.styles.map((s) => (s.cell === cellKey ? { ...s, vAlign } : s));
                return { ...prev, styles: updated };
            }
            return { ...prev, styles: [...prev.styles, { cell: cellKey, vAlign }] };
        });
    };

    const applyAlignmentToSelection = (align: "left" | "center" | "right" | "justify") => {
        if (selection.start && selection.end) {
            const r1 = Math.min(selection.start.row, selection.end.row);
            const r2 = Math.max(selection.start.row, selection.end.row);
            const c1 = Math.min(selection.start.col, selection.end.col);
            const c2 = Math.max(selection.start.col, selection.end.col);

            for (let r = r1; r <= r2; r++) {
                for (let c = c1; c <= c2; c++) {
                    const key = `${c}:${r}`;
                    setCellAlignment(key, align);
                }
            }
            return;
        }

        const key = `${activeCell.col}:${activeCell.row}`;
        setCellAlignment(key, align);
    };

    const applyVAlignmentToSelection = (vAlign: "top" | "middle" | "bottom") => {
        if (selection.start && selection.end) {
            const r1 = Math.min(selection.start.row, selection.end.row);
            const r2 = Math.max(selection.start.row, selection.end.row);
            const c1 = Math.min(selection.start.col, selection.end.col);
            const c2 = Math.max(selection.start.col, selection.end.col);

            for (let r = r1; r <= r2; r++) {
                for (let c = c1; c <= c2; c++) {
                    const key = `${c}:${r}`;
                    setCellVAlignment(key, vAlign);
                }
            }
            return;
        }

        const key = `${activeCell.col}:${activeCell.row}`;
        setCellVAlignment(key, vAlign);
    };

    const isInSavedArea = (row: number, col: number) => {
        if (!savedRange) return false;
        return row >= savedRange.startRow && row <= savedRange.endRow && col >= savedRange.startCol && col <= savedRange.endCol;
    };

    const buildPrintTableHTML = (rangeStr: string) => {
        const r = parseRange(rangeStr);
        const startR = r.startRow;
        const endR = r.endRow;
        const startC = r.startCol;
        const endC = r.endCol;

        const defaultColWidth = sheetModel.sheet.defaultColumnWidth || 100;
        const defaultRowHeight = sheetModel.sheet.defaultRowHeight || 30;

        // calcular anchos y altos por celda (la columna 0 tiene ancho fijo 50px en la UI)
        const colWidths: number[] = [];
        for (let c = startC; c <= endC; c++) {
            const w = c === 0 ? 50 : (sheetModel.columnSizes?.[c] ?? defaultColWidth);
            colWidths.push(w);
        }
        const rowHeights: number[] = [];
        for (let rr = startR; rr <= endR; rr++) rowHeights.push(sheetModel.rowSizes?.[rr] ?? defaultRowHeight);

        const areaWidth = colWidths.reduce((a, b) => a + b, 0);
        const areaHeight = rowHeights.reduce((a, b) => a + b, 0);

        // offsets antes del inicio (en px) para convertir coordenadas absolutas de imágenes
        const accumCol: number[] = [];
        for (let i = 0; i < startC; i++) {
            const w = i === 0 ? 50 : (sheetModel.columnSizes?.[i] ?? defaultColWidth);
            accumCol.push(w);
        }
        const offsetBeforeStartCol = accumCol.reduce((a, b) => a + b, 0);

        const accumRow: number[] = [];
        for (let i = 0; i < startR; i++) accumRow.push(sheetModel.rowSizes?.[i] ?? defaultRowHeight);
        const offsetBeforeStartRow = accumRow.reduce((a, b) => a + b, 0);

        let html = `<!doctype html><html><head><meta charset="utf-8"><title>Impresión</title>`;
        html += `<style>body{margin:0;padding:0} .print-wrapper{position:relative;width:${areaWidth}px;height:${areaHeight}px;} table{border-collapse:collapse;position:absolute;left:0;top:0;} td,th{padding:4px;vertical-align:top;border:none;}</style>`;
        html += `</head><body>`;

        html += `<div class="print-wrapper">`;
        html += `<table>`;
        html += `<tbody>`;

        for (let row = startR; row <= endR; row++) {
            html += `<tr>`;
            for (let col = startC; col <= endC; col++) {
                const merge = getMergeInfo(row, col);
                if (merge && !merge.isMaster) continue;

                const rowspan = merge ? `rowspan="${merge.rowSpan}"` : "";
                const colspan = merge ? `colspan="${merge.colSpan}"` : "";

                const bg = getCellStyle(row, col);
                const w = sheetModel.columnSizes?.[col] ?? defaultColWidth;
                const h = merge && merge.rowSpan && merge.rowSpan > 1
                    ? Array.from({ length: merge.rowSpan }).reduce((acc:any, _, i) => acc + (sheetModel.rowSizes?.[row + i] ?? defaultRowHeight), 0)
                    : (sheetModel.rowSizes?.[row] ?? defaultRowHeight);

                const value = getCellValue(row, col);
                const cellKey = `${col}:${row}`;
                const imgsInCell = (sheetModel.images || []).filter((im) => im.cell === cellKey);

                const cellStyle = (getConfigStyle(row, col) || {}) as Partial<stylesCells>;
                let borderCss = "";
                if (cellStyle.borderAll) {
                    borderCss += `border:${cellStyle.borderAll};`;
                } else {
                    if (cellStyle.borderTop) borderCss += `border-top:${cellStyle.borderTop};`;
                    if (cellStyle.borderBottom) borderCss += `border-bottom:${cellStyle.borderBottom};`;
                    if (cellStyle.borderLeft) borderCss += `border-left:${cellStyle.borderLeft};`;
                    if (cellStyle.borderRight) borderCss += `border-right:${cellStyle.borderRight};`;
                }

                let alignCss = "";
                if (cellStyle.align) alignCss += `text-align:${cellStyle.align};`;
                if (cellStyle.vAlign) alignCss += `vertical-align:${cellStyle.vAlign === 'middle' ? 'middle' : cellStyle.vAlign};`;

                const styleAttr = `background:${bg};width:${w}px;height:${h}px;${borderCss}${alignCss}`;
                // construir contenido de la celda incluyendo imágenes asignadas a la celda
                let inner = `${value}`;
                for (const ci of imgsInCell) {
                    inner += `<div style="margin-top:4px;"><img src="${ci.src}" style="max-width:100%;height:auto;display:block;" /></div>`;
                }

                html += `<td ${rowspan} ${colspan} style="${styleAttr}">${inner}</td>`;
            }
            html += `</tr>`;
        }

        html += `</tbody></table>`;

        // incluir imágenes que intersecten el área
        const images = sheetModel.images || [];
        for (const img of images) {
            const imgLeft = img.left;
            const imgTop = img.top;
            const imgRight = imgLeft + img.width;
            const imgBottom = imgTop + img.height;

            const areaLeft = offsetBeforeStartCol;
            const areaTop = offsetBeforeStartRow;
            const areaRight = areaLeft + areaWidth;
            const areaBottom = areaTop + areaHeight;

            const intersects = !(imgRight < areaLeft || imgLeft > areaRight || imgBottom < areaTop || imgTop > areaBottom);
            if (!intersects) continue;

            const relLeft = Math.max(0, imgLeft - areaLeft);
            const relTop = Math.max(0, imgTop - areaTop);

            html += `<img src="${img.src}" style="position:absolute;left:${relLeft}px;top:${relTop}px;width:${img.width}px;height:${img.height}px;object-fit:contain;" />`;
        }

        html += `</div>`;
        html += `</body></html>`;
        return html;
    };

    const handlePrintArea = () => {
        // prefer selection, then saved AreaImpresion
        let rangeStr = sheetModel.AreaImpresion;
        if (selection.start && selection.end) {
            const r1 = Math.min(selection.start.row, selection.end.row);
            const r2 = Math.max(selection.start.row, selection.end.row);
            const c1 = Math.min(selection.start.col, selection.end.col) + 1;
            const c2 = Math.max(selection.start.col, selection.end.col) + 1;
            rangeStr = `${letrasColumn(c1)}${r1 + 1}:${letrasColumn(c2)}${r2 + 1}`;
            // save the defined area
            saveAreaImpresion(rangeStr);
        }

        if (!rangeStr) {
            alert("No hay área de impresión definida.");
            return;
        }

        const html = buildPrintTableHTML(rangeStr);
        // Intentar abrir ventana nueva (sin flags para máxima compatibilidad)
        const newWin = window.open("", "_blank");
        if (newWin) {
            try {
                newWin.document.open();
                newWin.document.write(html);
                newWin.document.close();
                newWin.focus();
                setTimeout(() => {
                    newWin.print();
                }, 250);
                return;
            } catch (err) {
                // si ocurre un error al escribir en la ventana, caemos al fallback
                console.warn("Error escribiendo en nueva ventana, usando iframe fallback", err);
            }
        }

        // Fallback: crear un iframe embebido (evita bloqueo de popups)
        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0px";
        iframe.style.height = "0px";
        iframe.style.border = "0";
        iframe.style.visibility = "hidden";
        // usar srcdoc si disponible
        try {
            (iframe as any).srcdoc = html;
        } catch (e) {
            // IE fallback
            iframe.src = "data:text/html;charset=utf-8," + encodeURIComponent(html);
        }

        document.body.appendChild(iframe);

        const printFromIframe = () => {
            try {
                const idoc = (iframe.contentWindow || iframe.contentDocument) as any;
                // esperar carga
                setTimeout(() => {
                    try {
                        idoc.focus();
                        idoc.print();
                    } catch (e) {
                        console.warn("Impresión desde iframe falló", e);
                    }
                    // limpiar
                    setTimeout(() => document.body.removeChild(iframe), 500);
                }, 250);
            } catch (e) {
                console.warn("No se pudo imprimir desde iframe", e);
                document.body.removeChild(iframe);
                alert("No se pudo abrir la ventana de impresión ni usar el fallback de iframe.");
            }
        };

        // Si el iframe tiene onload, usarlo; sino intentar imprimir tras pequeño delay
        iframe.onload = printFromIframe;
        // Por si onload no se dispara
        setTimeout(printFromIframe, 500);
    };

    // ---- Imagenes flotantes: subida, arrastre y borrado ----
    const handleImageUpload = (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const src = String(reader.result);
            const newImg: ImageItem = {
                id: `${Date.now()}`,
                src,
                top: 10,
                left: 10,
                width: 120,
                height: 80,
            };
            // asignar la imagen a la celda activa (si hay una)
            const cellKey = `${activeCell.col}:${activeCell.row}`;
            newImg.cell = cellKey;
            setSheetModel((prev) => ({ ...prev, images: [...(prev.images || []), newImg] }));
            // limpiar input
            const input = document.getElementById("__img_input") as HTMLInputElement | null;
            if (input) input.value = "";
        };
        reader.readAsDataURL(file);
    };

    const startDragImage = (e: React.MouseEvent, img: ImageItem) => {
        e.stopPropagation();
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const offsetX = e.clientX - rect.left - img.left + container.scrollLeft;
        const offsetY = e.clientY - rect.top - img.top + container.scrollTop;
        dragRef.current = { id: img.id, offsetX, offsetY };

        const onMove = (ev: MouseEvent) => {
            if (!dragRef.current) return;
            const cur = dragRef.current;
            const cRect = container.getBoundingClientRect();
            const x = ev.clientX - cRect.left - cur.offsetX + container.scrollLeft;
            const y = ev.clientY - cRect.top - cur.offsetY + container.scrollTop;
            setSheetModel((prev) => ({
                ...prev,
                images: (prev.images || []).map((im) => (im.id === cur.id ? { ...im, left: Math.max(0, Math.round(x)), top: Math.max(0, Math.round(y)) } : im)),
            }));
        };

        const onUp = () => {
            dragRef.current = null;
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        };

        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    };

    const startResizeImage = (e: React.MouseEvent, img: ImageItem) => {
        e.stopPropagation();
        const container = containerRef.current;
        if (!container) return;
        resizeRef.current = {
            id: img.id,
            startX: e.clientX,
            startY: e.clientY,
            startW: img.width,
            startH: img.height,
        };

        const onMove = (ev: MouseEvent) => {
            if (!resizeRef.current) return;
            const cur = resizeRef.current;
            const dx = ev.clientX - cur.startX;
            const dy = ev.clientY - cur.startY;
            const nw = Math.max(20, Math.round(cur.startW + dx));
            const nh = Math.max(20, Math.round(cur.startH + dy));
            setSheetModel((prev) => ({
                ...prev,
                images: (prev.images || []).map((im) => (im.id === cur.id ? { ...im, width: nw, height: nh } : im)),
            }));
        };

        const onUp = () => {
            resizeRef.current = null;
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        };

        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    };

    const removeImage = (id: string) => {
        setSheetModel((prev) => ({ ...prev, images: (prev.images || []).filter((i) => i.id !== id) }));
    };
    console.log(sheetModel)
    return (
        <section className="flex flex-col">
            <div className="h-auto flex flex-wrap px-5 py-2 gap-1">
                <button className="flex flex-col items-center justify-center gap-1 border h-14 p-1 rounded-sm hover:border-blue-300 ">
                    <FileText size={15} />
                    <span className="text-xs">Imprimir</span>
                </button>
                <button onClick={() => handlePrintArea()} className="flex flex-col items-center justify-center gap-1 border h-14 p-1 rounded-sm hover:border-blue-300 ">
                    <FileText size={15} />
                    <span className="text-xs">Imprimir Área</span>
                </button>
                <button onClick={() => markSelectionAsArea()} className="flex flex-col items-center justify-center gap-1 border h-14 p-1 rounded-sm hover:border-blue-300 ">
                    <FileText size={15} />
                    <span className="text-xs">Marcar Área</span>
                </button>
                <button onClick={() => { if (!sheetModel.AreaImpresion) { alert('No hay área guardada'); return } ; autoPrintRef.current = false; setShowPrintModal(true); }} className="flex flex-col items-center justify-center gap-1 border h-14 p-1 rounded-sm hover:border-blue-300 ">
                    <FileText size={15} />
                    <span className="text-xs">Abrir Área (Modal)</span>
                </button>
                <button onClick={() => { if (!sheetModel.AreaImpresion) { alert('No hay área guardada'); return } ; autoPrintRef.current = true; setShowPrintModal(true); }} className="flex flex-col items-center justify-center gap-1 border h-14 p-1 rounded-sm hover:border-blue-300 ">
                    <FileText size={15} />
                    <span className="text-xs">Imprimir Guardada</span>
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
                    <div className="flex flex-row gap-1 items-center justify-center border px-2 py-1 rounded-sm">
                        <button onClick={() => applyBorderToSelection('top')} title="Borde Arriba" className="px-2">T</button>
                        <button onClick={() => applyBorderToSelection('bottom')} title="Borde Abajo" className="px-2">B</button>
                        <button onClick={() => applyBorderToSelection('left')} title="Borde Izquierda" className="px-2">L</button>
                        <button onClick={() => applyBorderToSelection('right')} title="Borde Derecha" className="px-2">R</button>
                        <button onClick={() => applyBorderToSelection('all')} title="Todos los bordes" className="px-2">Todos</button>
                        <button onClick={() => applyBorderToSelection('none')} title="Quitar bordes" className="px-2">Ninguno</button>
                    </div>
                    <div className="flex flex-row gap-1 items-center justify-center border px-2 py-1 rounded-sm">
                        <button onClick={() => applyAlignmentToSelection('left')} title="Alinear a la izquierda" className="px-2">L</button>
                        <button onClick={() => applyAlignmentToSelection('center')} title="Centrar texto" className="px-2">C</button>
                        <button onClick={() => applyAlignmentToSelection('right')} title="Alinear a la derecha" className="px-2">R</button>
                        <button onClick={() => applyAlignmentToSelection('justify')} title="Justificar texto" className="px-2">J</button>
                    </div>
                    <div className="flex flex-row gap-1 items-center justify-center border px-2 py-1 rounded-sm">
                        <button onClick={() => applyVAlignmentToSelection('top')} title="Alinear arriba" className="px-2">VT</button>
                        <button onClick={() => applyVAlignmentToSelection('middle')} title="Alinear medio" className="px-2">VM</button>
                        <button onClick={() => applyVAlignmentToSelection('bottom')} title="Alinear abajo" className="px-2">VB</button>
                    </div>
                    <div className="flex items-center">
                        <label className="px-2 py-1 border rounded cursor-pointer bg-white text-sm">
                            <input id="__img_input" type="file" accept="image/*" onChange={(e) => handleImageUpload(e)} className="hidden" />
                            Subir Imagen
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                if (!selectedImageId) { alert('Selecciona una imagen primero'); return; }
                                // traer al frente
                                setSheetModel((prev) => {
                                    const imgs = prev.images || [];
                                    const idx = imgs.findIndex(i => i.id === selectedImageId);
                                    if (idx === -1) return prev;
                                    const item = imgs[idx];
                                    const others = imgs.filter((_, i) => i !== idx);
                                    return { ...prev, images: [...others, item] };
                                });
                            }}
                            className="px-2 py-1 border rounded"
                        >
                            Traer al frente
                        </button>
                        <button
                            onClick={() => {
                                if (!selectedImageId) { alert('Selecciona una imagen primero'); return; }
                                // enviar al fondo
                                setSheetModel((prev) => {
                                    const imgs = prev.images || [];
                                    const idx = imgs.findIndex(i => i.id === selectedImageId);
                                    if (idx === -1) return prev;
                                    const item = imgs[idx];
                                    const others = imgs.filter((_, i) => i !== idx);
                                    return { ...prev, images: [item, ...others] };
                                });
                            }}
                            className="px-2 py-1 border rounded"
                        >
                            Enviar al fondo
                        </button>
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
                <div ref={containerRef} className="relative w-full h-full overflow-auto">
                    <table className="min-w-full">
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
                                        const cellKeyRender = `${index2}:${index1}`;
                                        const merge = getMergeInfo(index1, index2);
                                        if (merge && !merge.isMaster) return null;
                                        return (
                                            <td
                                                key={index2}
                                                rowSpan={merge?.rowSpan}
                                                colSpan={merge?.colSpan}
                                                style={(() => {
                                                    const cfg = getConfigStyle(index1, index2);
                                                    const v = cfg?.vAlign;
                                                    const justify = v === "middle" ? "center" : v === "bottom" ? "flex-end" : "flex-start";
                                                    // calcular altura total si la celda está combinada (rowSpan)
                                                    const span = merge?.rowSpan ?? 1;
                                                    const totalHeight = span > 1 ? rowsHeigths.slice(index1, index1 + span).reduce((a, b) => a + b, 0) : rowsHeigths[index1];

                                                    const base: any = {
                                                        width: index2 > 0 ? "auto" : "50px",
                                                        backgroundColor: isSelected(index1, index2)
                                                            ? "#07BBF280"
                                                            : "transparent",
                                                        height: totalHeight,
                                                        margin: "0",
                                                        padding: "0",
                                                        border: cfg?.borderAll ?? (index2 === 0 ? "1px solid #cbd5e1" : ""),
                                                        borderTop: cfg?.borderTop,
                                                        borderBottom: cfg?.borderBottom,
                                                        borderLeft: cfg?.borderLeft,
                                                        borderRight: cfg?.borderRight,
                                                        boxShadow: isInSavedArea(index1, index2) ? "inset 0 0 0 3px rgba(255,0,0,0.25)" : undefined,
                                                    };

                                                    return base;
                                                })()}
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
                                                        {(() => {
                                                            const cfg = getConfigStyle(index1, index2);
                                                            const v = cfg?.vAlign;
                                                            const justifyInner = v === "middle" ? "center" : v === "bottom" ? "flex-end" : "flex-start";
                                                            // mostrar o textarea O las imágenes ancladas, nunca ambos
                                                            const imgsInCell = (sheetModel.images || []).filter(i => i.cell === cellKeyRender);
                                                            if (imgsInCell.length > 0) {
                                                                return (
                                                                    <div style={{ width: "100%", height: "100%" }}>
                                                                        {imgsInCell.map(img => (
                                                                            <div key={img.id} style={{ width: "100%", height: "100%" }}>
                                                                                <img src={img.src} alt="img" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                );
                                                            }

                                                            return (
                                                                <div style={{ display: "flex", flexDirection: "column", justifyContent: justifyInner, height: "100%", width: "100%" }}>
                                                                    <textarea
                                                                        data-row={index1}
                                                                        data-col={index2}
                                                                        value={sheetModel.values[cellKeyRender] ?? ""}
                                                                        onKeyDown={(e) => handleKeyDown(e, index1, index2)}
                                                                        style={{
                                                                            height: "100%",
                                                                            margin: 0,
                                                                            padding: 0,
                                                                            resize: "none",
                                                                            backgroundColor: cfg?.background ?? "",
                                                                            textAlign: cfg?.align as any,
                                                                            width: "100%",
                                                                        }}
                                                                        onChange={(e) => saveTextSheets(e.target.value, index1, index2)}
                                                                        className="relative m-0 p-0 border  focus:z-50 w-full outline-none focus:ring-1 ring-blue-500"
                                                                    />
                                                                </div>
                                                            );
                                                        })()}
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

                    {/* imágenes flotantes (sobre la tabla) - solo las que NO están ancladas a una celda */}
                    {(sheetModel.images || []).filter(img => !img.cell).map((img) => (
                        <div
                            key={img.id}
                            onClick={(e) => { e.stopPropagation(); setSelectedImageId(img.id); }}
                            onMouseDown={(e) => startDragImage(e as any, img)}
                            style={{
                                position: "absolute",
                                top: img.top,
                                left: img.left,
                                width: img.width,
                                height: img.height,
                                zIndex: 40,
                                cursor: "grab",
                                boxShadow: selectedImageId === img.id ? "0 0 0 2px rgba(0,120,212,0.6)" : undefined,
                            }}
                        >
                            <img src={img.src} alt="img" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                            <button
                                onClick={(e) => { e.stopPropagation(); removeImage(img.id); if (selectedImageId === img.id) setSelectedImageId(null); }}
                                style={{ position: "absolute", right: 2, top: 2, zIndex: 50, background: "rgba(255,255,255,0.8)", border: "1px solid #ccc", borderRadius: 4, padding: "2px 4px" }}
                            >
                                X
                            </button>
                            {/* resize handle bottom-right */}
                            <div
                                onMouseDown={(e) => startResizeImage(e as any, img)}
                                style={{ position: "absolute", right: 4, bottom: 4, width: 12, height: 12, background: "white", border: "1px solid #666", cursor: "nwse-resize", zIndex: 60 }}
                            />
                        </div>
                    ))}
                </div>
            </section>
            {showPrintModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white w-[90%] h-[85%] rounded shadow-lg flex flex-col">
                        <div className="flex items-center justify-between p-3 border-b">
                            <div className="font-semibold">Vista previa - Área de impresión</div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        // imprimir desde iframe
                                        try {
                                            const idoc = iframeRef.current?.contentWindow;
                                            idoc?.focus();
                                            idoc?.print();
                                        } catch (e) {
                                            console.warn("Error imprimiendo desde modal", e);
                                        }
                                    }}
                                    className="px-3 py-1 bg-blue-500 text-white rounded"
                                >
                                    Imprimir
                                </button>
                                <button
                                    onClick={() => setShowPrintModal(false)}
                                    className="px-3 py-1 border rounded"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto p-2">
                            {sheetModel.AreaImpresion ? (
                                <iframe
                                    ref={iframeRef}
                                    title="print-preview"
                                    srcDoc={buildPrintTableHTML(sheetModel.AreaImpresion)}
                                    className="w-full h-full border"
                                    onLoad={() => {
                                        // si se pidió autoPrint, ejecutarlo
                                        if (autoPrintRef.current) {
                                            try {
                                                const idoc = iframeRef.current?.contentWindow;
                                                idoc?.focus();
                                                idoc?.print();
                                            } catch (e) {
                                                console.warn("Auto print falló", e);
                                            }
                                            autoPrintRef.current = false;
                                        }
                                    }}
                                />
                            ) : (
                                <div>No hay área definida para mostrar.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
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
                                    onBlur={(e) => saveAreaImpresion(e.target.value)}
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
