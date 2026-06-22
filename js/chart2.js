// Chart 2: Positive Drug Tests - Charges and Arrests Analysis (line & bar chart)

/* Current filter selections for Chart 2 */
let currentPeriodChart2 = "2023-2024";
let currentDataTypeChart2 = "charges";
let currentViewChart2 = "overtime";

const colorCharges = "#1f77b4";
const colorArrests = "#ff7f0e";
const ageGroups = ["0-16", "17-25", "26-39", "40-64", "65 and over"];

/* Draw chart */
function drawChart2() {
    const container = document.getElementById("chart2");
    if (!container) return;
    
    const data = window.globalData;
    if (!data || !data.positiveDrugs) {
        container.innerHTML = '<div style="text-align:center; padding:50px;">Loading data...</div>';
        return;
    }
    
    container.innerHTML = "";
    
    if (currentViewChart2 === "overtime") {
        drawTimeSeriesChart();
    } else {
        drawAgeGroupChart();
    }
}

/* Line chart showing charges/arrests over quarterly periods */
function drawTimeSeriesChart() {
    const data = window.globalData;
    const container = document.getElementById("chart2");
    
    const allQuarters = [
        "2023 Q1", "2023 Q2", "2023 Q3", "2023 Q4",
        "2024 Q1", "2024 Q2", "2024 Q3", "2024 Q4"
    ];
    
    // Data for display (filtered by period)
    const quarterlyData = {};
    // Data for y-axis max (ALL data, unfiltered)
    const allQuarterlyData = {};
    
    allQuarters.forEach(q => {
        quarterlyData[q] = { charges: 0, arrests: 0 };
        allQuarterlyData[q] = { charges: 0, arrests: 0 };
    });
    
    // First pass: Collect ALL data (unfiltered) for y-axis max
    data.positiveDrugs.forEach(record => {
        const date = record.DATE;
        if (!date || isNaN(date.getTime())) return;
        
        const year = date.getFullYear();
        if (year !== 2023 && year !== 2024) return;
        
        const month = date.getMonth();
        let quarter = "";
        if (month >= 0 && month <= 2) quarter = "Q1";
        else if (month >= 3 && month <= 5) quarter = "Q2";
        else if (month >= 6 && month <= 8) quarter = "Q3";
        else quarter = "Q4";
        
        const key = `${year} ${quarter}`;
        
        if (allQuarterlyData[key]) {
            allQuarterlyData[key].charges += record.CHARGES || 0;
            allQuarterlyData[key].arrests += record.ARRESTS || 0;
        }
    });
    
    // Second pass: Collect filtered data for display
    data.positiveDrugs.forEach(record => {
        const date = record.DATE;
        if (!date || isNaN(date.getTime())) return;
        
        const year = date.getFullYear();
        if (year !== 2023 && year !== 2024) return;
        
        if (currentPeriodChart2 === "2023" && year !== 2023) return;
        if (currentPeriodChart2 === "2024" && year !== 2024) return;
        
        const month = date.getMonth();
        let quarter = "";
        if (month >= 0 && month <= 2) quarter = "Q1";
        else if (month >= 3 && month <= 5) quarter = "Q2";
        else if (month >= 6 && month <= 8) quarter = "Q3";
        else quarter = "Q4";
        
        const key = `${year} ${quarter}`;
        
        if (quarterlyData[key]) {
            quarterlyData[key].charges += record.CHARGES || 0;
            quarterlyData[key].arrests += record.ARRESTS || 0;
        }
    });
    
    // Filter quarters based on selected period
    let filteredQuarters = allQuarters;
    if (currentPeriodChart2 === "2023") {
        filteredQuarters = allQuarters.filter(q => q.startsWith("2023"));
    } else if (currentPeriodChart2 === "2024") {
        filteredQuarters = allQuarters.filter(q => q.startsWith("2024"));
    }
    
    const values = filteredQuarters.map(q => 
        currentDataTypeChart2 === "charges" ? quarterlyData[q].charges : quarterlyData[q].arrests
    );
    
    if (filteredQuarters.length === 0 || values.every(v => v === 0)) {
        container.innerHTML = '<div style="text-align:center; padding:50px; color:#999;">No data available for selected period</div>';
        return;
    }
    
    const width = Math.min(container.parentElement.clientWidth - 60, 900);
    const height = 450;
    const margin = { top: 50, right: 30, bottom: 80, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    d3.select("#chart2").selectAll("svg").remove();
    
    const leftOffset = -55;
    const leftPadding = 80;
    
    const svgContainer = d3.select("#chart2")
        .append("div")
        .style("position", "relative")
        .style("width", "100%")
        .style("overflow", "visible");
    
    const svg = svgContainer
        .append("svg")
        .attr("width", width - leftOffset + leftPadding)
        .attr("height", height)
        .style("position", "relative")
        .style("left", `-${leftPadding}px`)
        .append("g")
        .attr("transform", `translate(${margin.left + leftOffset + leftPadding}, ${margin.top})`);
    
    const xScale = d3.scalePoint()
        .domain(filteredQuarters)
        .range([0, innerWidth])
        .padding(0.5);
    
    // Calculate yMax from ALL data (unfiltered) to keep y-axis consistent
    const allValues = allQuarters.map(q => 
        currentDataTypeChart2 === "charges" ? allQuarterlyData[q].charges : allQuarterlyData[q].arrests
    );
    const yMax = Math.max(...allValues, 1);
    const yScale = d3.scaleLinear()
        .domain([0, yMax * 1.1])
        .range([innerHeight, 0]);
    
    const color = currentDataTypeChart2 === "charges" ? colorCharges : colorArrests;
    const metricLabel = currentDataTypeChart2 === "charges" ? "Charges" : "Arrests";
    
    const lineData = filteredQuarters.map((q, i) => ({ 
        key: q, 
        value: values[i],
        x: xScale(q),
        y: yScale(values[i])
    }));
    
    const line = d3.line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3.curveMonotoneX);
    
    svg.append("path")
        .datum(lineData)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2.5)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .attr("d", line);
    
    const tooltip = window.utility.getTooltip();
    
    // Interactive circles with tooltips
    lineData.forEach((point, i) => {
        const cx = point.x;
        const cy = point.y;
        
        svg.append("circle")
            .attr("cx", cx)
            .attr("cy", cy)
            .attr("r", 6)
            .attr("fill", color)
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .style("opacity", 0.8)
            .on("mouseover", function(event) {
                tooltip.transition().duration(200).style("opacity", 0.95);
                tooltip.html(`<strong>${filteredQuarters[i]}</strong><br/>${metricLabel}: ${point.value.toLocaleString()}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
                d3.select(this).attr("r", 9).attr("stroke-width", 3);
            })
            .on("mouseout", function() {
                tooltip.transition().duration(500).style("opacity", 0);
                d3.select(this).attr("r", 6).attr("stroke-width", 2);
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            });
    });
    
    svg.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).tickFormat(d => {
            const [year, quarter] = d.split(" ");
            return `${quarter} ${year.slice(-2)}`;
        }))
        .attr("class", "chart-tick")
        .selectAll("text")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold");
    
    svg.append("g")
        .call(d3.axisLeft(yScale).ticks(6).tickFormat(d => d.toLocaleString()))
        .attr("class", "chart-tick");
    
    const periodText = currentPeriodChart2 === "2023-2024" ? "2023-2024" : currentPeriodChart2;
    svg.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "#333")
        .text(`${metricLabel} Over Time (${periodText})`);
    
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", innerWidth)
        .attr("y", innerHeight + 40)
        .text("Year Quarter")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "#555");
    
    svg.append("text")
        .attr("text-anchor", "start")
        .attr("x", -40)
        .attr("y", -15)
        .text(`Number of ${metricLabel}`)
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "#555");
}

// AGE GROUP (bar chart)
function drawAgeGroupChart() {
    const data = window.globalData;
    const container = document.getElementById("chart2");
    
    // Data for display (filtered by period)
    const ageData = {};
    // Data for y-axis max (ALL data, unfiltered)
    const allAgeData = {};
    
    ageGroups.forEach(age => {
        ageData[age] = { charges: 0, arrests: 0 };
        allAgeData[age] = { charges: 0, arrests: 0 };
    });
    
    // First pass: Collect ALL data (unfiltered) for y-axis max
    data.positiveDrugs.forEach(record => {
        const date = record.DATE;
        if (!date || isNaN(date.getTime())) return;
        
        const year = date.getFullYear();
        if (year !== 2023 && year !== 2024) return;
        
        const ageGroup = record.AGE_GROUP;
        if (ageGroup && allAgeData[ageGroup]) {
            allAgeData[ageGroup].charges += record.CHARGES || 0;
            allAgeData[ageGroup].arrests += record.ARRESTS || 0;
        }
    });
    
    // Second pass: Collect filtered data for display
    data.positiveDrugs.forEach(record => {
        const date = record.DATE;
        if (!date || isNaN(date.getTime())) return;
        
        const year = date.getFullYear();
        if (year !== 2023 && year !== 2024) return;
        
        if (currentPeriodChart2 === "2023" && year !== 2023) return;
        if (currentPeriodChart2 === "2024" && year !== 2024) return;
        
        const ageGroup = record.AGE_GROUP;
        if (ageGroup && ageData[ageGroup]) {
            ageData[ageGroup].charges += record.CHARGES || 0;
            ageData[ageGroup].arrests += record.ARRESTS || 0;
        }
    });
    
    const values = ageGroups.map(age => 
        currentDataTypeChart2 === "charges" ? ageData[age].charges : ageData[age].arrests
    );
    
    const width = Math.min(container.parentElement.clientWidth - 60, 900);
    const height = 450;
    const margin = { top: 50, right: 30, bottom: 80, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    d3.select("#chart2").selectAll("svg").remove();
    
    const leftOffset = -55;
    const leftPadding = 80;
    
    const svgContainer = d3.select("#chart2")
        .append("div")
        .style("position", "relative")
        .style("width", "100%")
        .style("overflow", "visible");
    
    const svg = svgContainer
        .append("svg")
        .attr("width", width - leftOffset + leftPadding)
        .attr("height", height)
        .style("position", "relative")
        .style("left", `-${leftPadding}px`)
        .append("g")
        .attr("transform", `translate(${margin.left + leftOffset + leftPadding}, ${margin.top})`);
    
    const xScale = d3.scaleBand()
        .domain(ageGroups)
        .range([0, innerWidth])
        .padding(0.3);
    
    // Calculate yMax from ALL data (unfiltered) to keep y-axis consistent
    const allValues = ageGroups.map(age => 
        currentDataTypeChart2 === "charges" ? allAgeData[age].charges : allAgeData[age].arrests
    );
    const yMax = Math.max(...allValues, 1);
    const yScale = d3.scaleLinear()
        .domain([0, yMax * 1.1])
        .range([innerHeight, 0]);
    
    const color = currentDataTypeChart2 === "charges" ? colorCharges : colorArrests;
    const metricLabel = currentDataTypeChart2 === "charges" ? "Charges" : "Arrests";
    const tooltip = window.utility.getTooltip();
    
    // Age group bars with value labels
    values.forEach((value, i) => {
        const age = ageGroups[i];
        const x = xScale(age);
        
        svg.append("rect")
            .attr("x", x)
            .attr("y", yScale(value))
            .attr("width", xScale.bandwidth())
            .attr("height", innerHeight - yScale(value))
            .attr("fill", color)
            .attr("opacity", 0.8)
            .style("cursor", "pointer")
            .on("mouseover", function(event) {
                tooltip.transition().duration(200).style("opacity", 0.95);
                tooltip.html(`<strong>${age}</strong><br/>${metricLabel}: ${value.toLocaleString()}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
                d3.select(this).attr("opacity", 1);
            })
            .on("mouseout", function() {
                tooltip.transition().duration(500).style("opacity", 0);
                d3.select(this).attr("opacity", 0.8);
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            });
        
        if (value > 0) {
            svg.append("text")
                .attr("x", x + xScale.bandwidth() / 2)
                .attr("y", yScale(value) - 5)
                .attr("text-anchor", "middle")
                .style("font-size", "11px")
                .text(value.toLocaleString());
        }
    });
    
    svg.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("font-size", "11px");
    
    svg.append("g")
        .call(d3.axisLeft(yScale).ticks(6).tickFormat(d => d.toLocaleString()))
        .style("font-size", "11px");
    
    const periodText = currentPeriodChart2 === "2023-2024" ? "2023-2024" : currentPeriodChart2;
    svg.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "#333")
        .text(`${metricLabel} by Age Group (${periodText})`);
    
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", innerWidth)
        .attr("y", innerHeight + 40)
        .text("Age Group")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "#555");
    
    svg.append("text")
        .attr("text-anchor", "start")
        .attr("x", -40)
        .attr("y", -15)
        .text(`Number of ${metricLabel}`)
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "#555");
}

/* Initialize Chart 2 filter event listeners */
function initChart2Controls() {
    const periodFilter = document.getElementById("yearFilterChart2");
    if (periodFilter) {
        periodFilter.addEventListener("change", function(e) {
            currentPeriodChart2 = e.target.value;
            drawChart2();
        });
    }
    
    const btnCharges = document.getElementById("btnCharges");
    const btnArrests = document.getElementById("btnArrests");
    
    if (btnCharges) {
        btnCharges.addEventListener("click", function() {
            currentDataTypeChart2 = "charges";
            document.querySelectorAll("#dataTypeFilterChart2 .btn-toggle").forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");
            drawChart2();
        });
    }
    if (btnArrests) {
        btnArrests.addEventListener("click", function() {
            currentDataTypeChart2 = "arrests";
            document.querySelectorAll("#dataTypeFilterChart2 .btn-toggle").forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");
            drawChart2();
        });
    }
    
    const btnOverTime = document.getElementById("btnOverTime");
    const btnAgeGroup = document.getElementById("btnAgeGroup");
    
    if (btnOverTime) {
        btnOverTime.addEventListener("click", function() {
            currentViewChart2 = "overtime";
            document.querySelectorAll("#viewFilterChart2 .btn-toggle").forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");
            drawChart2();
        });
    }
    if (btnAgeGroup) {
        btnAgeGroup.addEventListener("click", function() {
            currentViewChart2 = "agegroup";
            document.querySelectorAll("#viewFilterChart2 .btn-toggle").forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");
            drawChart2();
        });
    }
}

window.drawChart2 = drawChart2;
window.initChart2Controls = initChart2Controls;

window.addEventListener('dataLoaded', function() {
    setTimeout(() => {
        drawChart2();
        initChart2Controls();
    }, 100);
});