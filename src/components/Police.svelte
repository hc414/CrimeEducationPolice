<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";
  import { each } from "svelte/internal";

  let data = []; //store the csv for single plot
  // let wholedata = []; // store whole data for allchart
  let inputCounty = ""; //store the input county name for the user
  let selectedData = []; //extract the county value from the whole csv
  let countyData = new Map();


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

    //   highlightChartData();  // Ensure initial data is loaded for default county
    allChart();
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
    const margin = { top: 20, right: 30, bottom: 50, left: 60 }; // Adjusted for label space
    const width = 990 - margin.left - margin.right;
    const height = 551 - margin.top - margin.bottom;

    const svgCountainer = d3.select("#PoliceChart");
    svgCountainer.selectAll("*").remove();

    const svg = svgCountainer
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
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
        .attr("fill", color(name))
        .attr("stroke-width", 1.5)
        .attr("d", line);
    });

    // Add the x-axis
    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d"))); // Formatting years as integers

    // Add the y-axis
    const yAxis = svg.append("g").call(d3.axisLeft(y));

  }

  function highlightChartData() {
    const match = data.find((d) => d.county_name.toLowerCase() === inputCounty);
    if (match) {
      selectedData = Object.entries(match.data).map(([year, value]) => ({
        year,
        value,
      }));
      drawChart(); // Draw chart whenever data is updated
      //   console.log('Data for', inputCounty, selectedData);
    }
  }

  //draw the line chart for this county
  function drawChart() {
    const svg = d3.select("#PoliceChart");
    svg.selectAll("*").remove(); // Clear previous drawings

    const margin = { top: 20, right: 100, bottom: 30, left: 50 },
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    const x = d3
      .scaleBand()
      .domain(selectedData.map((d) => d.year))
      .range([0, width])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(selectedData, (d) => d.value)])
      .range([height, 0]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append("g").call(d3.axisLeft(y));

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
  }

  $: highlightChartData();
</script>

<div class="input-button">
  <input type="text" bind:value={inputCounty} placeholder="Ex:San Diego" />
  <button on:click={buttonDectect}>Show Data</button>
</div>


<svg id="PoliceChart" width="750" height="500"></svg>
<p>Hello police data is below11</p>

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
    background-color: #f4f4f4;
    border: 1px solid #d1c5c5;
  }
</style>
