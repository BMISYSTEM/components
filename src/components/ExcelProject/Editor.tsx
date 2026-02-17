import { useEffect, useRef } from "react";
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";

export const Editor = () => {
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (editorRef.current) return;

    const editor = grapesjs.init({
       container: "#gjs",
  height: "100vh",
  storageManager: false,
  avoidInlineStyle: false,
  forceClass: false,

      blockManager: {
        blocks: [
          {
            id: "section",
            label: "Sección",
            content: `<section style="padding:20px;">
                        <h1>Título</h1>
                        <p>Contenido...</p>
                      </section>`,
          },
          {
            id: "table",
            label: "Tabla",
            content: `
              <table border="1" width="100%" style="border-collapse: collapse;">
                <tr>
                  <th>Columna 1</th>
                  <th>Columna 2</th>
                </tr>
                <tr>
                  <td>{{dato1}}</td>
                  <td>{{dato2}}</td>
                </tr>
              </table>
            `,
          },
          {
            id: "image",
            label: "Imagen",
            content: `<img src="https://via.placeholder.com/300" />`,
          },
        ],
      },
    });

    editorRef.current = editor;

    /* 🔥 COMANDO PARA EDITAR HTML + CSS */
    editor.Commands.add("edit-html-full", {
      run(editor: any) {
        const html = editor.getHtml();
        const css = editor.getCss();

        const content = `
          <div style="display:flex; flex-direction:column; gap:10px;">
            <textarea id="gjs-html-editor"
              style="width:100%; height:350px; font-family:monospace;">
<style>
${css}
</style>
${html}
            </textarea>
            <button id="gjs-save-html"
              style="padding:10px; background:#1e3a8a; color:white; border:none; cursor:pointer;">
              Guardar cambios
            </button>
          </div>
        `;

        editor.Modal.setTitle("Editar HTML Completo");
        editor.Modal.setContent(content);
        editor.Modal.open();

        setTimeout(() => {
          const btn = document.getElementById("gjs-save-html");

          btn?.addEventListener("click", () => {
            const textarea = document.getElementById(
              "gjs-html-editor"
            ) as HTMLTextAreaElement;

            const value = textarea.value;

            const cssMatch = value.match(/<style>([\s\S]*?)<\/style>/);
            const newCss = cssMatch ? cssMatch[1] : "";
            const newHtml = value.replace(/<style>[\s\S]*?<\/style>/, "");

            editor.setComponents(newHtml.trim());
            editor.setStyle(newCss.trim());

            editor.Modal.close();
          });
        }, 0);
      },
    });

    /* 🔥 BOTÓN EN LA BARRA SUPERIOR */
    editor.Panels.addButton("options", {
      id: "edit-html-full",
      label: "</>",
      command: "edit-html-full",
      attributes: { title: "Editar HTML" },
    });
  }, []);

  const handleSave = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const html = editor.getHtml();
    const css = editor.getCss();

    console.log("HTML:", html);
    console.log("CSS:", css);
  };

  return (
    <>
      <button onClick={handleSave}>Guardar Plantilla</button>
      <div id="gjs" />
    </>
  );
};
