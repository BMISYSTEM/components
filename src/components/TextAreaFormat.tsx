import  {  useRef, useState } from "react";
const TextAreaFormat = () => {
  const [text,setText] = useState("")
  const editorRef = useRef<HTMLDivElement>(null);
  const [contenido,setContenido] = useState(text)
  const enlaceEjemplo = "\<\a \href\=\"https://dominio.com\">texto...</a\>"
  const applyStyle = (style: string, value?: string) => {
    document.execCommand(style, false, value);
    updateEditorContent();
  };
  const alignText = (alignment: "left" | "center" | "right") => {
    document.execCommand("justify" + alignment.charAt(0).toUpperCase() + alignment.slice(1));
    updateEditorContent();
  };
  const createEnlace = (enlace : string) =>{
    const selection = window.getSelection();
    const selectedText = selection?.toString();
    document.execCommand("insertHTML",false,selectedText);
    updateEditorContent();
  }
  const updateEditorContent = () => {
    if (editorRef.current) {
      setText(editorRef.current.innerHTML);  
      setContenido(editorRef.current.innerHTML)
    }
  };
  return (
    <div className="max-w-xl mx-auto mt-2 p-4 border border-gray-300 rounded-lg shadow-lg">
     
      <div className="flex flex-wrap gap-2 mb-4 text-slate-800">
        {/* Tamaño de texto */}
        <select
          onChange={(e) => applyStyle("fontSize", e.target.value)}
          className="p-2 border border-gray-300 rounded text-slate-800"
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
          type="button"
          onClick={() => applyStyle("bold")}
          className="p-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Negrita
        </button>
        <button
          type="button"
          onClick={() => applyStyle("italic")}
          className="p-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Cursiva
        </button>
        <button
          type="button"
          onClick={() => applyStyle("underline")}
          className="p-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Subrayado
        </button>
        {/* Alineación */}
        <button
          type="button"
          onClick={() => alignText("left")}
          className="p-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Alinear Izquierda
        </button>
        <button
          type="button"
          onClick={() => alignText("center")}
          className="p-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Centrar
        </button>
        <button
          type="button"
          onClick={() => alignText("right")}
          className="p-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Alinear Derecha
        </button>
        <button
          type="button"
          onClick={() => createEnlace("a")}
          className="p-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Crear Vinculo
        </button>
      </div>
      {/* Editor de texto */}
      <div
        ref={editorRef}
        contentEditable
        onBlur={()=>updateEditorContent()}
        className="w-full text-black h-64 p-4 border border-gray-300 bg-white rounded focus:outline-none focus:ring focus:ring-blue-200 overflow-auto"
        dangerouslySetInnerHTML={{ __html: contenido }} 
      >
      </div>

      <div className="mt-4">
        <h3 className="text-xl font-semibold">Contenido Renderizado</h3>
        <div
          className="border border-gray-300 p-4 mt-2 rounded bg-amber-50 text-black"
          
          dangerouslySetInnerHTML={{ __html: contenido }}  
        />
      </div>
      <div className="mt-20">
        <p>Indicaciones</p>
        <p>enlace <span>{enlaceEjemplo}</span></p>
      </div>
    </div>
  );
};

export default TextAreaFormat;
