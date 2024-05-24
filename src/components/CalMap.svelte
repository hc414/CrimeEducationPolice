
<!-- <script>
    import { onMount } from "svelte";
    import cal from "./caCountiesTopoSimple.json";
    import * as d3 from "d3";
    import { feature, mesh } from "topojson-client";

  
-->


<script>
    import { onMount } from "svelte";
    import { feature, mesh } from "topojson-client";
    import { geoMercator, geoPath } from 'd3-geo';
    import cal from "./caCountiesTopoSimple.json";
    import * as d3 from "d3";

    let width = 650;
    let height = 600;

    let projection = geoMercator()
        .scale(1000 * 2)
        .center([-120, 36])
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
            });

        svg.append("path")
            .datum(mesh(cal, cal.objects.subunits, (a, b) => a === b))
            .attr("class", "exterior-boundary")
            .attr("d", path);
    });
</script>
<h1>California TopoJSON with D3</h1>
<div id="map"></div>


