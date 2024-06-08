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
  let population_data = [];
  let crime;

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
  async function loadCountyPopData() {
      const response = await d3.csv('./county_population.csv');
      console.log(response.columns.slice(4));
      // columns = response.columns.slice(1); // Assuming the first column is 'County' and second is 'Crimes'

      population_data = response.flatMap(d => columns.map(year => ({
          County: d.CTYNAME.replace('County', '').trim(),
          Year: parseInt(year, 10), // Ensure Year is an integer
          Population: +d[year], 
      })));
      console.log(population_data);

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
      //console.log(specific_data);
  }
  onMount(loadTotalCrimeData);
  onMount(loadCountyPopData);
  onMount(loadSpecificData);

  let projection = geoMercator()
      .scale(1000 * 2.4)
      .center([-119, 37.5])
      .translate([width / 2, height / 2]);

  let path = geoPath()
      .projection(projection);

  function updateScaleBar(svg, maxCrimeRate) {
      const scaleBarWidth = 300;
      const minValue = 0;

      svg.select(".scale-bar text:first-of-type")
          .text(minValue);

      svg.select(".scale-bar text:last-of-type")
          .text(maxCrimeRate + "%");
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
              const county = population_data.filter(c => c.County === d.properties.name);
              const countyPopulation = county.filter(c => c.Year === parseInt(selectedYear, 10));

              const crimeRate = ((totalCrimeCount[0].Crime_Count / countyPopulation[0].Population)* 100).toFixed(4);
              div.transition()
                  .duration(200)
                  .style("opacity", .9);
              div.html(`${d.properties.fullName}<br><br>
                      Violent Crime: ${violent[0].Crime_Count}<br>
                      Property Crimes: ${property[0].Crime_Count}<br>
                      Arson: ${arson[0].Crime_Count}<br>
                      Total Crimes: ${totalCrimeCount[0].Crime_Count}<br>
                      Population: ${countyPopulation[0].Population}<br>
                      Crime Rate: ${crimeRate}%`)
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
              const countyData = specific_data.filter(c => c.County === d.properties.name);
              const selectedYear = document.getElementById('selectedYear').textContent;
              const crimeCount = countyData.filter(c => c.Year === parseInt(selectedYear, 10));

              console.log(crimeCount);
              crime = crimeCount;
              highlightCounty();
              plotCrimeData(crimeCount);
              updateSelectedOption(selectedCounty);
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
          const scaleBarWidth = 250;
          const scaleBarHeight = 10;

          const scaleBar = svg.append("g")
              .attr("class", "scale-bar")
              .attr("transform", `translate(${width - scaleBarWidth - 50}, ${height - 500})`);

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
              .text('__%'); // Default max value, will be updated
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
          const yearPopData = population_data.filter(d => d.Year === yearInt);

          // Check if data exists for the selected year
          if (yearPopData.length === 0) {
              console.warn(`No population data available for the year ${yearInt}`);
              svg.selectAll(".subunit").style("fill", "gray"); // Set default color to gray
              return;
          }

          // Calculate crime rates for each county
          const crimeRates = yearData.map(d => {
              const popData = yearPopData.find(c => c.County === d.County);
              return popData ? ((d.Crime_Count / popData.Population) * 100).toFixed(2) : 0;
          });

          // Determine the maximum crime rate
          const maxCrimeRate = d3.max(crimeRates);

          // Update the color scale domain based on the maximum crime rate
          colorScale.domain([0, maxCrimeRate]);

          // Fill the counties based on their crime rate
          svg.selectAll(".subunit").style("fill", d => {
              const countyData = yearData.find(c => c.County === d.properties.name);
              const countyPopData = yearPopData.find(c => c.County === d.properties.name);

              if (countyData && countyPopData) {
                  const crimeRate = ((countyData.Crime_Count / countyPopData.Population) * 100).toFixed(2);
                  return colorScale(crimeRate);
              } else {
                  return "gray"; // Default color for counties without data
              }
          });

          // Update the scale bar for the current year
          updateScaleBar(svg, maxCrimeRate);
      }
      // Event listener for dropdown change
      document.getElementById("countyDropdown").addEventListener("change", function(event) {
          selectedCounty = event.target.value;
          highlightCounty();
          // selectedCounty = d.properties.fullName;
          const countyData = specific_data.filter(c => c.County === selectedCounty.replace(' County',''));
          const selectedYear = document.getElementById('selectedYear').textContent;
          const crimeCount = countyData.filter(c => c.Year === parseInt(selectedYear, 10));
          console.log(crimeCount);
          plotCrimeData(crimeCount);
      });
      
  function plotCrimeData(filteredData) {

      const svg = d3.select('#chart');
      svg.selectAll('*').remove(); // Clear previous plots

      const width = 600, height = 400;
      const margin = { top: 20, right: 120, bottom: 60, left: 80 };

      const x0 = d3.scaleBand()
          .domain(['Violent Crimes', 'Property Crimes', 'Arson'])
          .range([margin.left, width - margin.right])
          .padding(0.1);

      // Scale for years within each crime category
      const x1 = d3.scaleBand()
          .domain([...new Set(filteredData.map(d => d.Year))])
          .range([0, x0.bandwidth()])
          .padding(0.05);

      // Y scale for crime counts
      const y = d3.scaleLinear()
          .domain([0, d3.max(filteredData, d => d.Crime_Count)])
          .nice()
          .range([height - margin.bottom, margin.top]);

      svg.attr('width', width)
          .attr('height', height);

      // Create groups for each crime category
      const category = svg.selectAll('.category')
          .data(d3.group(filteredData, d => d.Crime_Category))
          .enter().append('g')
              .attr('transform', d => `translate(${x0(d[0])}, 0)`);

      category.selectAll('rect')
          .data(d => d[1])
          .enter().append('rect')
              .attr('x', d => x1(d.Year))
              .attr('y', d => y(d.Crime_Count))
              .attr('width', x1.bandwidth())
              .attr('height', d => y(0) - y(d.Crime_Count))
              .attr('fill', d => {
                  if (d.Crime_Category === 'Violent Crimes') return 'red';
                  if (d.Crime_Category === 'Property Crimes') return 'blue';
                  if (d.Crime_Category === 'Arson') return 'green';
              });

      // Add X axis for crime categories
      const xAxisGroup = svg.append('g')
          .attr('transform', `translate(0,${height - margin.bottom})`)
          .call(d3.axisBottom(x0));

      xAxisGroup.append('text')
          .attr('x', width / 2)
          .attr('y', margin.bottom - 10)
          .attr('fill', 'black')
          .style('text-anchor', 'middle')
          .style('font-size', '16px')
          .text('Crime Category');

      // Add Y axis for crime counts
      const yAxisGroup = svg.append('g')
          .attr('transform', `translate(${margin.left},0)`)
          .call(d3.axisLeft(y));

      yAxisGroup.append('text')
          .attr('class', 'axis-label')
          .attr('transform', 'rotate(-90)')
          .attr('x', -height / 2)
          .attr('y', -55)  // Adjusting position closer to the y-axis
          .attr('fill', 'black')
          .style('text-anchor', 'middle')
          .style('font-size', '16px')
          .text('Crime Count');


      // Add chart title
      const selectedYear = document.getElementById('selectedYear').textContent;
      svg.append('text')
          .attr('x', width / 2)
          .attr('y', 15)
          .attr('text-anchor', 'middle')
          .style('font-size', '15px')
          .text(`${selectedCounty} - ${selectedYear} Crime Category Counts`);
      // console.log(selectedYear);
      };
  

  

      function updateSelectedYear() {
          const slider = document.getElementById('yearSlider');
          const selectedYear = document.getElementById('selectedYear');

          selectedYear.textContent = slider.value;

          slider.addEventListener('input', function() {
              const year = parseInt(this.value, 10); // Ensure the year is treated as an integer
              selectedYear.textContent = year;
              updateHeatMap(year);
              if (selectedCounty != "") {
                  const countyData = specific_data.filter(c => c.County === selectedCounty.replace(' County',''));
                  const selectedYear = document.getElementById('selectedYear').textContent;
                  const crimeCount = countyData.filter(c => c.Year === parseInt(selectedYear, 10));
                  plotCrimeData(crimeCount);
              }


          });
          

          // Initial update
          const initialYear = "Please use the slider to select a year";
          selectedYear.textContent = initialYear;
          // updateHeatMap(initialYear);
      }
      function updateSelectedOption(value)
      {
          const dropdown = document.getElementById('countyDropdown');
          dropdown.value = value;
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