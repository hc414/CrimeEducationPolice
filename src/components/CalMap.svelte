<script>
    import { onMount } from "svelte";
    import { feature, mesh } from "topojson-client";
    import { geoMercator, geoPath } from 'd3-geo';
    import * as d3 from "d3";
    import cal from "./caCountiesTopoSimple.json";

    let width = 650;
    let height = 600;
    let selectedCounty = ""; // Variable to store the selected county

    let projection = geoMercator()
        .scale(1000 * 2.4)
        .center([-119, 37.5])
        .translate([width / 2, height / 2]);

    let path = geoPath()
        .projection(projection);


    onMount(() => {
        const svg = d3.select("#map").append("svg")
            .attr("width", width)
            .attr("height", height);

        svg.append("path")
            .datum(feature(cal, cal.objects.subunits))
            .attr("class", "land")
            .attr("d", path);

        const div = d3.select("#map").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        svg.selectAll(".subunit")

            .data(feature(cal, cal.objects.subunits).features)
            .enter().append("path")
            .attr("class", d => "subunit " + d.properties.name)
            .attr("d", path)
            .on("mouseover", function(event, d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html(d.properties.fullName)
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
            
        function highlightCounty() {
            svg.selectAll(".subunit").style("fill", d => {
                console.log(d.properties.fullName === selectedCounty);
                return d.properties.fullName === selectedCounty ? "orange" : "steelblue";
            });
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
                selectedYear.textContent = this.value;
                console.log(selectedYear.textContent);
            });
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

<!-- <h1>California TopoJSON with D3</h1> -->

<select id="countyDropdown">
    <option value="">Select a County</option>
</select>
<div id="map">
    
</div>
<input type="range" min="2013" max="2022" value="2013" class="slider" id="yearSlider">
<p>Selected Year: <span id="selectedYear">2013</span></p>


