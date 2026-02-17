import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Tabla from "./components/Tabla.tsx";
import "./output.css";
import Calendario from "./components/Calendario.tsx";
import TextAreaFormat from "./components/TextAreaFormat.tsx";
import Dashboard from "./components/Dashboard.tsx";
import { Barras } from "./components/Graficas/Barras.tsx";
import { Funel } from "./components/Graficas/Funel.tsx";
import { ReportDesing } from "./components/ReportDesing.tsx";
import { Sheets } from "./components/ExcelProject/Sheets.tsx";
import { Editor } from "./components/ExcelProject/Editor.tsx";

/**data para la tabla  */
const data = [
  { id: 1, name: "Juan", age: 28, email: "juan@example.com" },
  { id: 2, name: "Ana", age: 32, email: "ana@example.com" },
  { id: 3, name: "Luis", age: 25, email: "luis@example.com" },
  { id: 4, name: "María", age: 30, email: "maria@example.com" },
];

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* <Tabla data={data} /> */}
    {/* <Calendario/> */}
    {/* <TextAreaFormat/> */}
    {/* <Dashboard/> */}
    {/*<Barras/>*/}
    {/*<Funel/>*/}
    {/* <ReportDesing /> */}
   {/*  <Sheets/> */}
   <Editor/>
  </StrictMode>,
);
