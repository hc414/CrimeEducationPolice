<script>
    import { onMount } from "svelte";
    import * as d3 from "d3";


    let columns;
    let crimeData = [];
    let countyName = 'Alameda';  // Change this to the desired county
    const years = ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022'];
    let violentCrimes = [];
    let propertyCrimes = [];
    let arson = [];

    async function loadData()
    {
        const response = await d3.csv('/counties_crime.csv');
        crimeData = response;
        columns = response.columns.slice(1); // Assuming first column is 'County'
        console.log("Data loaded:", crimeData);
        console.log("Columns:", columns);
        updateCrimeData(countyName);
    }
    onMount(loadData);


    function updateCrimeData(county) 
    {
        let filteredData = crimeData.filter(d => d.County === county);
        violentCrimes = years.map(year => filteredData.find(d => d.Crimes === 'Violent Crimes')?.[year] || 0);
        propertyCrimes = years.map(year => filteredData.find(d => d.Crimes === 'Property Crimes')?.[year] || 0);
        arson = years.map(year => filteredData.find(d => d.Crimes === 'Arson')?.[year] || 0);
    }
</script>
