import React from "react";
import { groupByCity } from "./utils";
import { forceSimulation, forceX, forceY, forceCollide, scaleLinear, min, max, select } from "d3";
import { useRef } from 'react';


function AirportBubble(props) {
    const { width, height, routes, selectedAirline } = props;
    const svgRef = useRef();

    useEffect(() => {
        if (!routes || routes.length === 0) {
            console.warn("No routes data available");
            return;
        }

        // Select the SVG element
        const svg = select(svgRef.current);

        // Filter routes by selected airline
        const filteredRoutes = selectedAirline
            ? routes.filter(route => route.AirlineID === selectedAirline)
            : routes;

        // Group cities and sort ascendingly by Count
        let cities = groupByCity(filteredRoutes).sort((a, b) => a.Count - b.Count);

        if (!cities || cities.length === 0) {
            console.warn("No cities data available");
            return;
        }

        // Define the scale for bubble radius
        const radiusScale = scaleLinear()
            .domain([min(cities, d => d.Count || 0), max(cities, d => d.Count || 0)])
            .range([2, width * 0.15]);

        // Initialize x and y coordinates for force simulation
        cities.forEach(city => {
            city.x = width / 2; // Initial x-coordinate
            city.y = height / 2; // Initial y-coordinate
        });

        // Create force simulation
        const simulation = forceSimulation(cities)
            .velocityDecay(0.2)
            .force("x", forceX(width / 2).strength(0.02))
            .force("y", forceY(height / 2).strength(0.02))
            .force("collide", forceCollide(d => radiusScale(d.Count)))
            .tick(200) // Run 200 ticks
            .on("tick", () => {
                // Update positions of circles
                svg.selectAll("circle")
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);

                // Update positions of text
                svg.selectAll("text")
                    .attr("x", d => d.x)
                    .attr("y", d => d.y);
            });

        // Render bubbles
        const bubbles = svg.selectAll("circle").data(cities);

        bubbles
            .enter()
            .append("circle")
            .merge(bubbles)
            .attr("r", d => radiusScale(d.Count))
            .attr("fill", (d, idx) => (idx >= cities.length - 5 ? "#ADD8E6" : "#2a5599")) // Top 5 hubs highlighted
            .attr("stroke", "black")
            .attr("stroke-width", "2")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("key", (d, idx) => idx); // Avoid warnings with unique keys

        bubbles.exit().remove();

        // Render text labels for top 5 cities
        const labels = svg.selectAll("text").data(cities);

        labels
            .enter()
            .append("text")
            .merge(labels)
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .style("text-anchor", "middle")
            .style("stroke", "pink")
            .style("stroke-width", "0.5em")
            .style("fill", "#992a2a") // Top 5 text color
            .style("font-size", "16px")
            .style("font-family", "cursive")
            .style("paint-order", "stroke")
            .style("stroke-linejoin", "round")
            .text((d, idx) => (idx >= cities.length - 5 ? d.City : "")); // Add text to top 5 cities

        labels.exit().remove();

        simulation.alpha(1).restart();
    }, [routes, selectedAirline, width, height]);

    return <svg ref={svgRef} id="bubble" width={width} height={height}></svg>;
}

export { AirportBubble };