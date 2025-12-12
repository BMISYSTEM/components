import React, { useRef, useState } from "react";

type ReportElementType = "title" | "text" | "image";

interface ReportElementData {
  id: string;
  type: ReportElementType;
  content: string;
}

export const ReportDesing = () => {
  const [elements, setElements] = useState<ReportElementData[]>([]);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Dimensiones reales (Legal / Oficio)
  const PAGE_WIDTH_PT = 612; // 8.5in × 72
  const PAGE_HEIGHT_PT = 1008; // 14in × 72

  function addElement(type: ReportElementType, x: number, y: number) {
    setElements((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type,
        x,
        y,
        content:
          type === "title"
            ? "Nuevo título"
            : type === "text"
              ? "Texto ejemplo"
              : "https://placehold.co/200",
      },
    ]);
  }

  function handleDrop(e: React.DragEvent) {
    const type = e.dataTransfer.getData("item") as ReportElementType;
    if (!type || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    addElement(type, x, y);
  }

  function startDrag(e: React.MouseEvent, id: string) {
    e.stopPropagation();

    const el = elements.find((e) => e.id === id);
    if (!el) return;

    setDraggingId(id);
    setOffset({
      x: e.clientX - el.x,
      y: e.clientY - el.y,
    });
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!draggingId) return;

    setElements((prev) =>
      prev.map((el) =>
        el.id === draggingId
          ? {
              ...el,
              x: e.clientX - offset.x,
              y: e.clientY - offset.y,
            }
          : el,
      ),
    );
  }

  function stopDrag() {
    setDraggingId(null);
  }

  function updateElement(id: string, value: string) {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, content: value } : el)),
    );
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "sans-serif",
        userSelect: draggingId ? "none" : "auto",
      }}
      onMouseMove={onMouseMove}
      onMouseUp={stopDrag}
    >
      {/* PALETA */}
      <div
        style={{
          width: 180,
          padding: 20,
          borderRight: "1px solid #ddd",
          background: "#fafafa",
        }}
      >
        <PrintPreview elements={elements} />
        <h3>Elementos</h3>

        {["title", "text", "image"].map((type) => (
          <div
            key={type}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("item", type)}
            style={{
              padding: 10,
              border: "1px solid #ccc",
              marginBottom: 10,
              cursor: "grab",
              borderRadius: 6,
              background: "#fff",
            }}
          >
            {type === "title" && "📌 Título"}
            {type === "text" && "✏️ Texto"}
            {type === "image" && "🖼️ Imagen"}
          </div>
        ))}

        <h4 style={{ marginTop: 30 }}>JSON:</h4>
        <pre style={{ fontSize: 11, background: "#eee", padding: 10 }}>
          {JSON.stringify(elements, null, 2)}
        </pre>
      </div>

      {/* CANVAS - DOCUMENTO OFICIO */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          padding: 20,
          overflow: "auto",
          background: "#e5e5e5",
        }}
      >
        <div
          ref={canvasRef}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            width: `${PAGE_WIDTH_PT}pt`,
            height: `${PAGE_HEIGHT_PT}pt`,
            background: "white",
            position: "relative",
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          }}
        >
          {elements.map((el) => (
            <div
              key={el.id}
              onMouseDown={(e) => startDrag(e, el.id)}
              style={{
                position: "absolute",
                top: `${el.y}pt`,
                left: `${el.x}pt`,
                padding: 10,
                border: "1px solid #ddd",
                background: "white",
                borderRadius: 8,
                minWidth: 100,
                cursor: "move",
              }}
            >
              {el.type === "title" && (
                <input
                  value={el.content}
                  onChange={(e) => updateElement(el.id, e.target.value)}
                  style={{
                    fontSize: 24,
                    width: "100%",
                    border: "none",
                    outline: "none",
                  }}
                />
              )}

              {el.type === "text" && (
                <textarea
                  value={el.content}
                  onChange={(e) => updateElement(el.id, e.target.value)}
                  style={{ width: "100%", minHeight: 60 }}
                />
              )}

              {el.type === "image" && (
                <>
                  <input
                    value={el.content}
                    onChange={(e) => updateElement(el.id, e.target.value)}
                    style={{ width: "100%" }}
                  />

                  <img
                    src={el.content}
                    alt=""
                    style={{ marginTop: 10, maxWidth: 200 }}
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

type ElementType = "text" | "image";

interface CanvasElement {
  id: string;
  type: ElementType;
  x: number; // position in pt
  y: number; // position in pt
  width?: number; // in pt
  height?: number; // in pt
  content: string; // text or image url
}

interface Props {
  elements: CanvasElement[];
}

const PrintPreview: React.FC<Props> = ({ elements }) => {
  const printDocument = () => {
    // Crear HTML a partir del JSON
    const htmlContent = generateHTML(elements);

    // Crear ventana
    const printWindow = window.open("", "_blank", "width=800,height=600");

    if (!printWindow) return;

    // Escribir contenido
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Esperar a que cargue
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print(); // o el usuario presiona Ctrl + P
    };
  };

  return (
    <button
      onClick={printDocument}
      style={{ padding: "10px 20px", fontSize: "16px" }}
    >
      Imprimir documento
    </button>
  );
};

// ----------------------------------------------------
//  🔧 Función que arma el HTML con tu JSON
// ----------------------------------------------------
function generateHTML(elements: CanvasElement[]): string {
  const pageWidth = 612; // 8.5in en pt (US Letter — AJUSTA si usas Oficio)
  const pageHeight = 936; // 13in en pt (Oficio USA)

  const elementHTML = elements
    .map((el) => {
      if (el.type === "text") {
        return `
          <div style="
            position: absolute;
            left: ${el.x}pt;
            top: ${el.y}pt;
            width: ${el.width ?? "auto"};
            font-size: 12pt;
          ">
            ${el.content}
          </div>
        `;
      }

      if (el.type === "image") {
        return `
          <img src="${el.content}" style="
            position: absolute;
            left: ${el.x}pt;
            top: ${el.y}pt;
            width: ${el.width ?? 100}pt;
            height: ${el.height ?? "auto"};
          "/>
        `;
      }

      return "";
    })
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Documento</title>
<style>
  @page {
    size: 8.5in 13in; /* Documento Oficio */
    margin: 0;
  }
  body {
    margin: 0;
    padding: 0;
  }
  #page {
    position: relative;
    width: ${pageWidth}pt;
    height: ${pageHeight}pt;
  }
</style>
</head>
<body>
  <div id="page">
    ${elementHTML}
  </div>
</body>
</html>
`;
}
