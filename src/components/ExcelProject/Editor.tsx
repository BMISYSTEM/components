import { useEffect, useRef } from "react";
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import * as cheerio from 'cheerio';
import fondo1 from "./assets/fondo1.avif"
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

    editor.Panels.addButton("options", {
      id: "edit-html-full",
      label: "</>",
      command: "edit-html-full",
      attributes: { title: "Editar HTML" },
    });
  }, []);


  const datos = {
    background:fondo1,
    empresa: "SUPERMERCADO BAYRON",
    nit: "900123456-7",
    direccion: "Calle 123 #45-67",
    telefono: "3001234567",
    numeroFactura: "FAC-00123",
    fecha: "04/03/2026",
    cajero: "Juan Perez",
    subtotal: "45.000",
    iva: "8.550",
    totalGeneral: "53.550",
    mensajeFinal: "Vuelva pronto",
    items: [
      {
        producto: "Arroz 1kg",
        cantidad: 2,
        precioUnitario: "3.000",
        total: "6.000"
      },
      {
        producto: "Leche Entera",
        cantidad: 1,
        precioUnitario: "4.500",
        total: "4.500"
      }
    ]
  };

  function render(html: string, datos: any) {
    let resultado = html.replace(/{{(.*?)}}/g, (match, key) => {
      if (key.trim() === 'items') return match;
      return datos[key.trim()] ?? match;
    });

    const $ = cheerio.load(resultado);

    const filaTemplate = $(".item-template").first();

    if (filaTemplate.length && Array.isArray(datos.items)) {

      const templateHtml = filaTemplate.html()!;

      datos.items.forEach((item: any) => {

        const nuevaFila = filaTemplate.clone();

        const filaRenderizada = templateHtml.replace(/{{(.*?)}}/g, (match, key) => {
          return item[key.trim()] ?? '';
        });

        nuevaFila.html(filaRenderizada);

        filaTemplate.parent().append(nuevaFila);
      });

      filaTemplate.remove();
    }

    const htmlFinal = $.html();

    const ventana = window.open('', '_blank', 'width=400,height=800');

    if (!ventana) return;

    ventana.document.write(`
    <html>
      <head>
        <title>Imprimir</title>
      </head>
      <body>
        ${htmlFinal}
      </body>
    </html>
  `);

    ventana.document.close();

    ventana.focus();

    ventana.print();

    ventana.onafterprint = () => {
      ventana.close();
    };
  }

  return (
    <>
      <button onClick={() => render(editorRef.current.getHtml(), datos)}>Generar pdf </button>
      <div id="gjs" />
    </>
  );
};


// ejemplo plantilla

// campos simples se agregan en {{}} como datos del sistema ejemplo {{fecha}} o {{nombre_empresa}}
// los datos de tabla se agregan con data-field="variable"
// <!DOCTYPE html>
// <html>
// <head>
// <meta charset="UTF-8">
// </head>

// <body style="font-family: Arial, sans-serif; color:#333333; margin:40pt;">

//   <!-- HEADER -->
//   <div style="text-align:center; margin-bottom:30pt;">
//     <h1 style="margin:0; font-size:22pt; color:#1F3A8A;">
//       COTIZACIÓN
//     </h1>
//     <p style="margin:4pt 0 0 0; font-size:10pt; color:#666666;">
//       N° {{numero_cotizacion}}
//     </p>
//   </div>

//   <!-- EMPRESA -->
//   <div style="margin-bottom:20pt;">
//     <p style="margin:0; font-size:12pt;">
//       <strong>{{empresa_nombre}}</strong>
//     </p>
//     <p style="margin:2pt 0; font-size:10pt;">
//       NIT: {{empresa_nit}}
//     </p>
//     <p style="margin:2pt 0; font-size:10pt;">
//       Tel: {{empresa_telefono}}
//     </p>
//   </div>

//   <!-- CLIENTE -->
//   <div style="margin-bottom:20pt;">
//     <p style="margin:2pt 0; font-size:11pt;">
//       <strong>Cliente:</strong> {{nombre}}
//     </p>
//     <p style="margin:2pt 0; font-size:11pt;">
//       <strong>Email:</strong> {{email}}
//     </p>
//     <p style="margin:2pt 0; font-size:11pt;">
//       <strong>Fecha:</strong> {{fecha}}
//     </p>
//   </div>

//   <!-- TABLA PRODUCTOS -->
//   <table id="tabla-productos"
//          style="width:100%; border-collapse:collapse; margin-top:20pt;">

//     <thead>
//       <tr style="background-color:#1F3A8A; color:white;">
//         <th style="padding:8pt; font-size:10pt; text-align:left;">Producto</th>
//         <th style="padding:8pt; font-size:10pt; text-align:center;">Cantidad</th>
//         <th style="padding:8pt; font-size:10pt; text-align:right;">Precio</th>
//         <th style="padding:8pt; font-size:10pt; text-align:right;">Total</th>
//       </tr>
//     </thead>

//     <tbody>

//       <!-- FILA BASE (NO SE RENDERIZA, SE USA COMO TEMPLATE) -->
//       <tr class="item-template" style="border-bottom:1pt solid #DDDDDD;">
//         <td style="padding:8pt; font-size:10pt;" data-field="producto"></td>
//         <td style="padding:8pt; font-size:10pt; text-align:center;" data-field="cantidad"></td>
//         <td style="padding:8pt; font-size:10pt; text-align:right;" data-field="precio"></td>
//         <td style="padding:8pt; font-size:10pt; text-align:right;" data-field="total"></td>
//       </tr>

//     </tbody>
//   </table>

//   <!-- TOTALES -->
//   <div style="margin-top:20pt; text-align:right;">
//     <p style="font-size:11pt; margin:3pt 0;">
//       Subtotal: <strong>{{subtotal}}</strong>
//     </p>
//     <p style="font-size:11pt; margin:3pt 0;">
//       IVA: <strong>{{iva}}</strong>
//     </p>
//     <p style="font-size:13pt; margin:5pt 0; color:#1F3A8A;">
//       TOTAL: <strong>{{total_general}}</strong>
//     </p>
//   </div>

//   <div style="margin-top:40pt; font-size:9pt; text-align:center; color:#777777;">
//     Gracias por confiar en nosotros.
//   </div>

// </body>
// </html>