import { useEffect, useRef, useState } from "react"
import * as d3 from "d3";
const data = [
  { etapa: "Visitas", valor: 1000 },
  { etapa: "Registros", valor: 600 },
  { etapa: "Pruebas Gratis", valor: 300 },
  { etapa: "Compras", valor: 100 },
];
export const Funel = () => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const escalaColores = ["#43F00A", "#B3F00A", "#E1F00A", "#F0980A", "#F0300A"]
    const [widthInitial, setWhidt] = useState(700)
    const [heightInitial, setHeigth] = useState(400)
      useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 600;
    const height = 400;
    const margin = 40;

    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin}, ${margin})`);

    const maxValor = d3.max(data, (d) => d.valor) ?? 0;
    const sectionHeight = (height - margin * 2) / data.length;

    const xScale = d3
      .scaleLinear()
      .domain([0, maxValor])
      .range([0, width - margin * 4]);

    const color = d3.scaleSequential(d3.interpolateBlues).domain([0, data.length]);

    // 🔹 Dibujar cada nivel
    data.forEach((d, i) => {
      const topWidth = xScale(d.valor);
      const bottomWidth = i < data.length - 1 ? xScale(data[i + 1].valor) : 0;

      const yTop = i * sectionHeight;
      const yBottom = (i + 1) * sectionHeight;

      const xTop = (width - topWidth) / 2;
      const xBottom = (width - bottomWidth) / 2;

      const points = [
        [xTop, yTop],
        [xTop + topWidth, yTop],
        [xBottom + bottomWidth, yBottom],
        [xBottom, yBottom],
      ];

      const fillColor = color(i);

      g.append("polygon")
        .attr("points", points.map((p) => p.join(",")).join(" "))
        .attr("fill", fillColor)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1);

      // 🔹 Coordenadas del centro del trapezoide (para la flecha)
      const xCenter = width / 2;
      const yCenter = yTop + sectionHeight / 2;

      const textOffset = 160; // distancia del texto al centro
      const isLeft = i % 2 === 0; // alternar lados
      const textX = isLeft ? xCenter - textOffset : xCenter + textOffset;
      const textAnchor = isLeft ? "end" : "start";
      const lineX1 = xCenter;
      const lineX2 = isLeft ? xCenter - 100 : xCenter + 100;

      // 🔹 Línea que conecta texto con el embudo
      g.append("line")
        .attr("x1", lineX1)
        .attr("y1", yCenter)
        .attr("x2", lineX2)
        .attr("y2", yCenter)
        .attr("stroke", fillColor)
        .attr("stroke-width", 2);

      // 🔹 Flecha (triángulo)
      const arrowSize = 6;
      const arrowDir = isLeft ? -1 : 1;

      g.append("polygon")
        .attr(
          "points",
          [
            [lineX1, yCenter],
            [lineX1 + arrowDir * arrowSize, yCenter - arrowSize / 2],
            [lineX1 + arrowDir * arrowSize, yCenter + arrowSize / 2],
          ]
            .map((p) => p.join(","))
            .join(" ")
        )
        .attr("fill", fillColor);

      // 🔹 Texto externo
      g.append("text")
        .attr("x", textX)
        .attr("y", yCenter)
        .attr("dy", ".35em")
        .attr("text-anchor", textAnchor)
        .style("fill", "#333")
        .style("font-weight", "600")
        .style("font-size", "14px")
        .text(`${d.etapa}: ${d.valor.toLocaleString()}`);
    });
  }, []);
    return (
         <svg ref={svgRef}
        width={widthInitial}
        height={heightInitial}
        style={{ background: "#f9f9f9", overflow: "visible" }}
    />
    )
}
