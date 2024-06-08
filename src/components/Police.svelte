<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";
  import { each } from "svelte/internal";

  let data = []; //store the csv for single plot
  // let wholedata = []; // store whole data for allchart
  let inputCounty = ""; //store the input county name for the user
  let selectedData = []; //extract the county value from the whole csv
  let countyData = new Map();
  let countyDropdown = null;
  let currentCounty = "";

  //mouse event
  let tooltipContent = null;
  let tooltipVisible = false;
  let tooltipX = 0;
  let tooltipY = 0;

  onMount(async () => {
    data = await d3.csv("./police_poplulation1.csv", (d) => ({
      county_name: d.county_name,
      data: Object.fromEntries(
        Object.entries(d)
          .filter(([key, _]) => key !== "county_name")
          .map(([key, value]) => [key, +value])
      ),
    }));

    console.log("all data", data);
    console.log("load csv success");

    countyDropdown = document.getElementById("countyDropdown1");
    data.forEach((d) => {
      const option = document.createElement("option");
      option.text = d.county_name;
      // console.log(d.county_name);
      countyDropdown.appendChild(option);
    });
      // highlightChartData();  // Ensure initial data is loaded for default county
    allChart();
    // Add event listener to the dropdown
    countyDropdown.addEventListener('change', () => {
        inputCounty = countyDropdown.value;
        if (inputCounty.length == 0) {
            allChart();
        } else {
            highlightChartData();
        }
    });
  });

  function buttonDectect() {
    if (inputCounty.length == 0) {
      allChart();
    } else {
      highlightChartData();
    }
  }

  function allChart() {
    data.forEach((d) => {
      const yearlyData = Object.entries(d.data).map(([year, value]) => ({
        year: +year,
        value,
      }));
      countyData.set(d.county_name, yearlyData);
    });

    console.log("Processed county data", countyData);
    drawAllCounty(countyData);
  }

  function drawAllCounty(countyData) {
    //draw all county line
    const margin = { top: 90, right: 30, bottom: -20, left: 60 }; // Adjusted for label space
    const width = 990 - margin.left - margin.right;
    const height = 551 - margin.top - margin.bottom;

    const svgCountainer = d3.select("#PoliceChart");
    svgCountainer.selectAll("*").remove();

    const svg = svgCountainer
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom + 100)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const color = d3
      // .scaleSequential(d3.interpolateSpectral)
      .scaleOrdinal(d3.schemeCategory10)
      .domain(countyData.keys());

    // Define scales
    const x = d3.scaleLinear().domain([2013, 2022]).range([0, 900]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max([...countyData.values()].flat(), (d) => d.value)])
      .range([480, 0]);

    // Define the line
    const line = d3
      .line()
      .x((d) => x(d.year))
      .y((d) => y(d.value));

    // Define the area generator
    const area = d3
      .area()
      .x((d) => x(d.year))
      .y0(height) // Always at the bottom
      .y1((d) => y(d.value)); // Data point for the county

    countyData.forEach((values, name) => {
      svg
        .append("path")
        .datum(values)
        .attr("fill", "none")
        .attr("stroke", color(name))
        .attr("stroke-width", 3)
        .attr("d", line)
        //mouse event
        .on("mouseover", (event, d) => {
          tooltipContent = `${name}`;
          tooltipVisible = true;
          tooltipX = event.pageX;
          tooltipY = event.pageY;
        })
        .on("mouseout", () => {
          tooltipVisible = false;
        });
    });

    // Add the x-axis
    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d"))); // Formatting years as integers

    // Add the y-axis
    const yAxis = svg.append("g").call(d3.axisLeft(y));

    // X-axis label
    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.bottom + 60)
      .text("Year");

    // Y-axis label
    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", margin.left - 105)
      .attr("x", -margin.top - height / 2 + 120)
      .text("Population");

    svg
      .append("text")
      .attr("class", "chart title")
      .attr("text-anchor", "middle")
      .attr("x", width / 2 + margin.left)
      .attr("y", margin.top / 2 - 90)
      .text("California Counties Police Population Over the Years (2013-2022)");
  }

  function highlightChartData() {
    const match = data.find(
      (d) => d.county_name.toLowerCase() === inputCounty.toLowerCase()
    );
    if (match) {
      currentCounty = match.county_name;
      selectedData = Object.entries(match.data).map(([year, value]) => ({
        year,
        value,
      }));
      drawChart(); // Draw chart whenever data is updated
      //   console.log('Data for', inputCounty, selectedData);
    }
  }

  // }
  function drawChart() {
    const svg = d3.select("#PoliceChart");
    svg.selectAll("*").remove(); // Clear previous drawings

    // Adjust the top margin to a larger value
    const margin = { top: 100, right: 100, bottom: 50, left: 70 }, // Increased top margin
      svgWidth = 800,
      svgHeight = 500,
      width = svgWidth - margin.left - margin.right,
      height = svgHeight - margin.top - margin.bottom;

    //   const margin = { top: 90, right: 30, bottom: -20, left: 60 }; // Adjusted for label space
    // const width = 990 - margin.left - margin.right;
    // const height = 551 - margin.top - margin.bottom;
    // Apply the increased top margin in the transform of the g element
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(selectedData.map((d) => d.year))
      .range([0, width])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(selectedData, (d) => d.value)])
      .range([height, 0]);

    // Add x-axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // Add y-axis
    g.append("g").call(d3.axisLeft(y));

    // Define and draw the line
    const line = d3
      .line()
      .x((d) => x(d.year) + x.bandwidth() / 2)
      .y((d) => y(d.value));

    g.append("path")
      .datum(selectedData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add x-axis label
    g.append("text")
      .attr("text-anchor", "end")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .text("Year");

    // Add y-axis label
    g.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", (-height / 2) + 80)
      .text("Police Population");

    // Add chart title
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", svgWidth / 2)
      .attr("y", margin.top / 2)
      .text(`Police populaiton in ${currentCounty} County`);
  }

  $: highlightChartData();
</script>

<div class="input-button">
  <!-- <input type="text" bind:value={inputCounty} placeholder="Ex:San Diego" />
  <button on:click={buttonDectect}>Show Data</button> -->
  <select id="countyDropdown1">
    <option value="">Select a County</option>
  </select>
</div>

<main>
  <svg id="PoliceChart" width="750" height="500"></svg>
  {#if tooltipVisible}
    <div
      class="tooltip"
      style="position: absolute; left: {tooltipX}px; top: {tooltipY}px;"
    >
      {tooltipContent}
    </div>
  {/if}
</main>

<style>
  .input-button {
    display: flex;
    align-items: center;
  }

  input {
    margin: 10px;
    padding: 8px;
    width: 200px;
  }
  button {
    padding: 8px 16px;
    margin-left: 5px; /* Space between input and button */
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  button:hover {
    background-color: #0056b3;
  }

  svg {
    margin-top: 20px;
    background-color: #ffffff;
    border: 1px solid #ffffff;
  }

  /* Tooltip styling */
  .tooltip {
    position: absolute;
    text-align: center;
    width: 120px;
    height: 25px;
    padding: 2px;
    font: 16px sans-serif;
    background: rgb(160, 197, 247);
    border: 0px;
    border-radius: 8px;
    pointer-events: none;
  }
</style>
