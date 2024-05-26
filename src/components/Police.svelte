<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";

  let data = []; //store the whole csv
  let inputCounty = "San Diego"; //store the input county name for the user
  let selectedData = []; //extract the county value from the whole csv
  let countyMap = new Map();

  onMount(async () => {
    data = await d3.csv("./police_poplulation1.csv", (d) => ({
      county_name: d.county_name,
      data: Object.fromEntries(
        Object.entries(d)
          .filter(([key, _]) => key !== "county_name")
          .map(([key, value]) => [key, +value])
      ),
    }));

    console.log("load csv success");


    highlightChartData();  // Ensure initial data is loaded for default county

    // allChart();
  });

  function allChart() {
    // init all county data
    data.forEach(d => {
      const yearlyData = Object.entries(d)
        .filter(([key, _]) => key !== 'county_name')
        .map(([year, value]) => {
        //   console.log(`Year: ${year}, Value: ${value}`); // Log each year and its corresponding value
          return {
            year,
            value // Convert value to number
          };
        });

      console.log(`hhhhh County: ${d.county_name}, Yearly Data: `, yearlyData); // Log the county name and its processed data
      countyMap.set(d.county_name, yearlyData);
    });

    // console.log("Data for chart:", countyMap);

    // drawAllCounty();
  }

  function drawAllCounty() {
    //draw all county line
    const svg = d3.select("svg");
    const margin = { top: 20, right: 20, bottom: 30, left: 50 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    svg.attr(
      "viewBox",
      `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`
    );

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define scales
    const x = d3
      .scaleBand()
      .domain(
        countyMap
          .values()
          .next()
          .value.map((d) => d.year)
      )
      .range([0, width])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(
          Array.from(countyMap.values()).flatMap((data) =>
            data.map((d) => d.value)
          )
        ),
      ])
      .range([height, 0]);

    // Draw axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));
    g.append("g").call(d3.axisLeft(y));

    // Plot lines for each county
    const line = d3
      .line()
      .x((d) => x(d.year) + x.bandwidth() / 2)
      .y((d) => y(d.value));

    countyMap.forEach((data, name) => {
      g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-width", 1)
        .attr("d", line);
    });
  }

  function highlightChartData() {
    const match = data.find((d) => d.county_name === inputCounty);
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
</script>

<input type="text" bind:value={inputCounty} placeholder="Enter county name" />
<button on:click={highlightChartData}>Show Data</button>

<svg id="PoliceChart" width="750" height="500"></svg>



<style>
  input {
    margin: 10px;
    padding: 8px;
    width: 200px;
  }
  button {
    padding: 8px 16px;
  }
  svg {
    margin-top: 20px;
    background-color: #f4f4f4;
    border: 1px solid #ddd;
  }
</style>
