import React from "react";
import { max, scaleBand, scaleLinear } from "d3";
import { XAxis, YAxis } from "./axes";


export function BarChart(props) {
    const { offsetX, offsetY, data, height, width, selectedAirline, setSelectedAirline } = props;

    // Calculate scales
    let maximumCount = max(data, d => d.Count);
    const xScale = scaleLinear().range([0, width]).domain([0, maximumCount]).nice();
    const yScale = scaleBand().range([0, height]).domain(data.map(a => a.AirlineName)).padding(0.2);

    // Define the color of the bars
    const color = (d) => d.AirlineID === selectedAirline ? "#992a5b" : "#2a5599";

    // Define onClick callback
    const handleClick = (d) => {
        if (d.AirlineID === selectedAirline) {
            // If the clicked bar is already selected, unselect it
            setSelectedAirline(null);
        } else {
            // Otherwise, select the clicked bar
            setSelectedAirline(d.AirlineID);
        }
    };

    return (
        <g transform={`translate(${offsetX}, ${offsetY})`}>
            {data.map(d => (
                <rect
                    key={d.AirlineID}
                    x={0}
                    y={yScale(d.AirlineName)}
                    width={xScale(d.Count)}
                    height={yScale.bandwidth()}
                    onClick={() => handleClick(d)} // Attach the onClick event
                    stroke="black"
                    fill={color(d)} // Use dynamic color based on selection
                />
            ))}
            {/* Axes */}
            <YAxis yScale={yScale} height={height} offsetX={offsetX} />
            <XAxis xScale={xScale} width={width} height={height} />
        </g>
    );
}