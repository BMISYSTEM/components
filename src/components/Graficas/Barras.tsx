import React, { LegacyRef, useEffect, useRef, useState } from 'react'
import * as d3 from "d3";
export const Barras = () => {
    const data:number[] = [30, 80, 45, 60, 20, 90, 50]
    const svgRef = useRef<SVGSVGElement | null>(null);
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const escalaColores = ["#43F00A","#B3F00A","#E1F00A","#F0980A","#F0300A"]
    const [widthInitial,setWhidt] = useState(500)
    const [heightInitial,setHeigth] = useState(400)
    useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = widthInitial - 20;
    const height = heightInitial -20;
    // Limpiar antes de redibujar
     svg.selectAll("*").remove();
     // Crear grupo principal
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
    // Escalas
    const xScale = d3.scaleBand()
      .domain(data.map((d, i) => i.toString()))
      .range([0, width])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data) ?? 0])
      .range([height, 0]);
       // Ejes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).ticks(5);

    g.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

      g.append("g").call(yAxis);

    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("padding", "6px 10px")
      .style("background", "rgba(0,0,0,0.7)")
      .style("color", "#fff")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0);

 // Dibujar barras
    g.selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (_, i) => xScale(i.toString())!)
      .attr("y", (d) => yScale(d))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - yScale(d))
      .attr("fill", (d)=> 
        escalaColores[Math.floor((
            (
                ( 
                    (Number(d) * 100) 
                    / Math.max(...data)
                )
            ) * 5 ) / 100)]  )
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "gray"); // color del hover 
        tooltip
          .style("opacity", 1)
          .html(`<strong>Prueba de tooltip ${d}</strong>`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 20 + "px");
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 20 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", (d)=> 
        escalaColores[Math.floor((
            (
                ( 
                    (Number(d) * 100) 
                    / Math.max(...data)
                )
            ) * 5 ) / 100)]  )// se vuelve a calcular el color despues del hover 
        tooltip.style("opacity", 0);
      });

  }, [data]);

  return (
    <svg ref={svgRef}
        width={widthInitial}
        height={heightInitial}
        style={{ background: "#f9f9f9", overflow: "visible" }}
    />
  )
}
