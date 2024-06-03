<script>
    import { onMount } from "svelte";
    import { feature, mesh } from "topojson-client";
    import { geoMercator, geoPath } from 'd3-geo';
    import * as d3 from "d3";
    import cal from "./caCountiesTopoSimple.json";

    let width = 650;
    let height = 600;
    let selectedCounty = ""; // Variable to store the selected county

    let data = [];
    let specific_data = [];

    let columns;
    
    async function loadTotalCrimeData() {
        const response = await d3.csv('./annual_crime_totals.csv');
        columns = response.columns.slice(1); // Assuming the first column is 'County' and second is 'Crimes'
        data = response.flatMap(d => columns.map(year => ({
            County: d.County,
            Year: parseInt(year, 10), // Ensure Year is an integer
            Crime_Count: +d[year], // Ensure Crime_Count is a number
        })));
    }
    async function loadSpecificData() {
        const response = await d3.csv('./counties_crime.csv');
        columns = response.columns.slice(2); // Assuming the first column is 'County' and second is 'Crimes'
        specific_data = response.flatMap(d => columns.map(year => ({
            County: d.County,
            Year: parseInt(year, 10),
            Crime_Count: +d[year],
            Crime_Category: d.Crimes
        })));
        console.log(specific_data);
    }
    onMount(loadTotalCrimeData);
    onMount(loadSpecificData);

    let projection = geoMercator()
        .scale(1000 * 2.4)
        .center([-119, 37.5])
        .translate([width / 2, height / 2]);

    let path = geoPath()
        .projection(projection);

    function updateScaleBar(svg, maxCrimeCount) {
        const scaleBarWidth = 300;
        const minValue = 0;

        svg.select(".scale-bar text:first-of-type")
            .text(minValue);

        svg.select(".scale-bar text:last-of-type")
            .text(maxCrimeCount);
    }

    onMount(() => {
        const svg = d3.select("#map").append("svg")
            .attr("id", "calMap")
            .attr("width", width)
            .attr("height", height);

        svg.append("path")
            .datum(feature(cal, cal.objects.subunits))
            .attr("class", "land")
            .attr("d", path);

        const div = d3.select("#map").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("text-align", "center")
            .style("width", "150px")
            .style("padding", "2px")
            .style("font", "12px sans-serif")
            .style("color", "white")
            .style("background", "rgb(0, 0, 0)")
            .style("border", "0px")
            .style("border-radius", "8px")
            .style("pointer-events", "none")
            .style("opacity", 0);

        svg.selectAll(".subunit")
            .data(feature(cal, cal.objects.subunits).features)
            .enter().append("path")
            .attr("class", d => "subunit " + d.properties.name)
            .attr("d", path)
            .on("mouseover", function(event, d) {
                const countyData = specific_data.filter(c => c.County === d.properties.name);
                const selectedYear = document.getElementById('selectedYear').textContent;
                const crimeCount = countyData.filter(c => c.Year === parseInt(selectedYear, 10));
                const violent = crimeCount.filter(c => c.Crime_Category === "Violent Crimes");
                const property = crimeCount.filter(c => c.Crime_Category === "Property Crimes");
                const arson = crimeCount.filter(c => c.Crime_Category === "Arson");
                const countyTotalData = data.filter(c => c.County === d.properties.name);
                const totalCrimeCount = countyTotalData.filter(c => c.Year === parseInt(selectedYear, 10));
                console.log(totalCrimeCount);



                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html(`${d.properties.fullName}<br><br>
                        Violent Crime: ${violent[0].Crime_Count}<br>
                        Property Crimes: ${property[0].Crime_Count}<br>
                        Arson: ${arson[0].Crime_Count}<br>
                        Total: ${totalCrimeCount[0].Crime_Count}`)
                    .style("left", (event.pageX) + 10 + "px")
                    .style("top", (event.pageY - 30) + "px");
            })
            .on("mouseout", function() {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", function(event, d) {
                selectedCounty = d.properties.fullName;
                highlightCounty();
            });

        svg.append("path")
            .datum(mesh(cal, cal.objects.subunits, (a, b) => a === b))
            .attr("class", "exterior-boundary")
            .attr("d", path);

        const colorScale = d3.scaleLinear()
            .domain([0, 0.5, 1])
            .range(["#60cc62", "#ff8080"]); 

        // Add colored scale bar
        function addScaleBar() {
            const scaleBarWidth = 300;
            const scaleBarHeight = 10;

            const scaleBar = svg.append("g")
                .attr("class", "scale-bar")
                .attr("transform", `translate(${width - scaleBarWidth - 30}, ${height - 500})`);

            // Create a gradient for the scale bar
            const defs = svg.append("defs");

            const gradient = defs.append("linearGradient")
                .attr("id", "gradient")
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "200%")
                .attr("y2", "0%");

            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "#60cc62");

            gradient.append("stop")
                .attr("offset", "50%")
                .attr("stop-color", "#ff8080");


            // Append a rect element and fill it with the gradient
            scaleBar.append("rect")
                .attr("width", scaleBarWidth)
                .attr("height", scaleBarHeight)
                .style("fill", "url(#gradient)");

            // Append text labels for the scale bar
            scaleBar.append("text")
                .attr("class", "scale-bar-text")
                .attr("x", 0)
                .attr("y", -5)
                .attr("text-anchor", "middle")
                .text(0);

            scaleBar.append("text")
                .attr("class", "scale-bar-text")
                .attr("x", scaleBarWidth)
                .attr("y", -5)
                .attr("text-anchor", "middle")
                .text(10000); // Default max value, will be updated
        }

        addScaleBar();

        function highlightCounty() {
            svg.selectAll(".subunit").style("fill", d => {
                return d.properties.fullName === selectedCounty ? "orange" : "steelblue";
            });
        }

        function updateHeatMap(year) {
            const yearInt = parseInt(year, 10); // Ensure year is treated as an integer

            const yearData = data.filter(d => d.Year === yearInt);

            // Check if data exists for the selected year
            if (yearData.length === 0) {
                console.warn(`No data available for the year ${yearInt}`);
                // Handle this case, e.g., set a default color or notify the user
                svg.selectAll(".subunit").style("fill", "gray"); // Example: Set default color to gray
                return;
            }

            // Update the color scale domain based on the year data
            const maxCrimeCount = d3.max(yearData, d => d.Crime_Count);
            colorScale.domain([0, maxCrimeCount]);

            svg.selectAll(".subunit").style("fill", d => {
                const countyData = yearData.find(c => c.County === d.properties.name);
                const fillColor = countyData ? colorScale(countyData.Crime_Count) : "gray";
                return fillColor;
            });

            // Update the scale bar for the current year
            updateScaleBar(svg, maxCrimeCount);
        }

        // Event listener for dropdown change
        document.getElementById("countyDropdown").addEventListener("change", function(event) {
            selectedCounty = event.target.value;
            highlightCounty();
        });

        function updateSelectedYear() {
            const slider = document.getElementById('yearSlider');
            const selectedYear = document.getElementById('selectedYear');

            selectedYear.textContent = slider.value;

            slider.addEventListener('input', function() {
                const year = parseInt(this.value, 10); // Ensure the year is treated as an integer
                selectedYear.textContent = year;
                updateHeatMap(year);
            });

            // Initial update
            const initialYear = "Please use the slider to select a year";
            selectedYear.textContent = initialYear;
            // updateHeatMap(initialYear);
        }

        // Call updateSelectedYear function directly in onMount
        updateSelectedYear();

        const countiesData = feature(cal, cal.objects.subunits).features.map(d => d.properties.fullName);
        const dropdown = document.getElementById("countyDropdown");
        countiesData.sort();
        countiesData.forEach(county => {
            const option = document.createElement("option");
            option.value = county;
            option.textContent = county;
            dropdown.appendChild(option);
        });
    });
</script>

<select id="countyDropdown">
    <option value="">Select a County</option>
</select>
<div id="map"></div>
<input type="range" min="2013" max="2022" value="2013" class="slider" id="yearSlider">
<p>Selected Year: <span id="selectedYear">2013</span></p>
