<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';

    let stateName = '';
    let selectedYear = '';  // Variable to hold the user-selected year
    let data = [];
    let columns = []; // Initialize columns as an empty array to avoid errors during component initialization

    async function loadData() {
        const response = await d3.csv('/counties_crime.csv');
        if (response && response.columns) {
            columns = response.columns.slice(2); // Assuming the first column is 'County' and second is 'Crimes'
            data = response.flatMap(d => columns.map(year => ({
                County: d.County,
                Year: year,
                Crime_Count: +d[year],
                Crime_Category: d.Crimes
            })));
        }
        if (data.length > 0 && stateName && selectedYear) {
            filterData(); // Call filterData only if there is data and both filters are set
        }
    }

    onMount(loadData);

    function filterData() {
        if (!stateName || !selectedYear) return; // Do not proceed if any filter is not set

        const filteredData = data.filter(d =>
            d.County.toLowerCase().includes(stateName.toLowerCase()) &&
            d.Year === selectedYear
        );
        console.log(filteredData);
        plotCrimeData(filteredData);
    }
    
    export function plotCrimeData(filteredData) {
        if (filteredData.length === 0) return; // Prevent plotting if no data matches

        const svg = d3.select('#chart');
        svg.selectAll('*').remove(); // Clear previous plots

        const width = 800, height = 400;
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };

        const x0 = d3.scaleBand()
            .domain(filteredData.map(d => d.Year))
            .range([margin.left, width - margin.right])
            .padding(0.1);

        const x1 = d3.scaleBand()
            .domain(['Violent Crimes', 'Property Crimes', 'Arson'])
            .rangeRound([0, x0.bandwidth()])
            .padding(0.05);

        const y = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d.Crime_Count)])
            .nice()
            .range([height - margin.bottom, margin.top]);

        svg.attr('width', width)
            .attr('height', height);

        const category = svg.selectAll('.category')
            .data(filteredData)
            .enter().append('g')
                .attr('transform', d => `translate(${x0(d.Year)}, 0)`);

        category.selectAll('rect')
            .data(d => [d])
            .enter().append('rect')
                .attr('x', d => x1(d.Crime_Category))
                .attr('y', d => y(d.Crime_Count))
                .attr('width', x1.bandwidth())
                .attr('height', d => y(0) - y(d.Crime_Count))
                .attr('fill', d => {
                    if (d.Crime_Category === 'Violent Crimes') return 'red';
                    if (d.Crime_Category === 'Property Crimes') return 'blue';
                    if (d.Crime_Category === 'Arson') return 'green';
                });
        
        

        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x0).tickSizeOuter(0));

        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));
    }
</script>

<style>
    .container {
        text-align: center;
        margin-top: 20px;
    }
    #chart {
        margin: auto;
    }
</style>

<div class="container">

</div>
<svg id="chart"></svg>
