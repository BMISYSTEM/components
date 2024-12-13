import React, { useRef } from "react";

interface RichTextEditorProps {}

const TextAreaFormat: React.FC<RichTextEditorProps> = () => {
  const editorRef = useRef<HTMLDivElement>(null);

  const applyStyle = (style: string, value?: string) => {
    document.execCommand(style, false, value);
  };

  const addList = () => {
    document.execCommand("insertUnorderedList");
  };

  const alignText = (alignment: "left" | "center" | "right") => {
    document.execCommand("justify" + alignment.charAt(0).toUpperCase() + alignment.slice(1));
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 border border-gray-300 rounded-lg shadow-lg">
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Tamaño de texto */}
        <select
          onChange={(e) => applyStyle("fontSize", e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="3">Tamaño</option>
          <option value="1">Pequeño</option>
          <option value="3">Normal</option>
          <option value="5">Grande</option>
        </select>
        {/* Color del texto */}
        <input
          type="color"
          onChange={(e) => applyStyle("foreColor", e.target.value)}
          className="w-10 h-10 border border-gray-300 rounded"
        />
        {/* Estilos de texto */}
        <button
          onClick={() => applyStyle("bold")}
          className="p-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Negrita
        </button>
        <button
          onClick={() => applyStyle("italic")}
          className="p-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Cursiva
        </button>
        <button
          onClick={() => applyStyle("underline")}
          className="p-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Subrayado
        </button>
        {/* Alineación */}
        <button
          onClick={() => alignText("left")}
          className="p-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Alinear Izquierda
        </button>
        <button
          onClick={() => alignText("center")}
          className="p-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Centrar
        </button>
        <button
          onClick={() => alignText("right")}
          className="p-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Alinear Derecha
        </button>
        {/* Lista */}
        <button
          onClick={addList}
          className="p-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Lista
        </button>
      </div>
      {/* Editor de texto */}
      <div
        ref={editorRef}
        contentEditable
        className="w-full h-64 p-4 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200 overflow-auto"
      >
        Escribe algo aquí...
      </div>
    </div>
  );
};

export default TextAreaFormat;
