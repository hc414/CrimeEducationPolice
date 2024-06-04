export function filterData(stateName, selectedYear, data, callback) {
    if (!stateName || !selectedYear) return; // Do not proceed if any filter is not set

    const filteredData = data.filter(d =>
        d.County.toLowerCase().includes(stateName.toLowerCase()) &&
        d.Year === selectedYear
    );
    callback(filteredData);
}
