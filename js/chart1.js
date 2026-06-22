/* Chart dimensions and margins */
let chart1Config = {
    width: 850,
    height: 450,
    margin: { top: 30, right: 80, bottom: 100, left: 70 }
};

/* Current filter selections */
let currentPeriod = "2023-2024";
let currentDataType = "both";

const colorConducted = "#1f77b4";
const colorPositive = "#ff7f0e";
const quarters = ["Q1", "Q2", "Q3", "Q4"];

/* Global max values for Y-axis scaling */
let globalConductedMax = 0;
let globalPositiveMax = 0;

/* Calculate chart width based on container */
function getResponsiveChartWidth() {
    const container = document.getElementById("chart1");
    if (container) {
        const parentWidth = container.clientWidth;
        return Math.min(Math.max(parentWidth - 20, 650), 850);
    }
    return 800;
}

/* Aggregate monthly drug tests into quarterly totals */
function processQuarterlyData(drugTests) {
    const monthlyData = {};
    
    drugTests.forEach(item => {
        const date = item.DATE;
        if (!date || isNaN(date.getTime())) return;
        
        const year = date.getFullYear();
        const month = date.getMonth();
        
        if (year !== 2023 && year !== 2024) return;
        
        const monthKey = `${year}-${month}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                year: year,
                month: month,
                conducted: 0
            };
        }
        
        monthlyData[monthKey].conducted += item.COUNT || 0;
    });
    
    const quarterlyData = {};
    
    Object.values(monthlyData).forEach(month => {
        const year = month.year;
        const monthNum = month.month;
        
        let quarter = "";
        if (monthNum <= 2) quarter = "Q1";
        else if (monthNum <= 5) quarter = "Q2";
        else if (monthNum <= 8) quarter = "Q3";
        else quarter = "Q4";
        
        const quarterKey = `${year}-${quarter}`;
        
        if (!quarterlyData[quarterKey]) {
            quarterlyData[quarterKey] = {
                year: year,
                quarter: quarter,
                quarterNum: quarters.indexOf(quarter),
                conducted: 0
            };
        }
        
        quarterlyData[quarterKey].conducted += month.conducted;
    });
    
    return Object.values(quarterlyData).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.quarterNum - b.quarterNum;
    });
}

/* Aggregate monthly positive tests into quarterly totals */
function processPositiveQuarterlyData(positiveDrugs) {
    const monthlyData = {};
    
    positiveDrugs.forEach(item => {
        const date = item.DATE;
        if (!date || isNaN(date.getTime())) return;
        
        const year = date.getFullYear();
        const month = date.getMonth();
        
        if (year !== 2023 && year !== 2024) return;
        
        const monthKey = `${year}-${month}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                year: year,
                month: month,
                positive: 0
            };
        }
        
        monthlyData[monthKey].positive += item.COUNT || 0;
    });
    
    const quarterlyData = {};
    
    Object.values(monthlyData).forEach(month => {
        const year = month.year;
        const monthNum = month.month;
        
        let quarter = "";
        if (monthNum <= 2) quarter = "Q1";
        else if (monthNum <= 5) quarter = "Q2";
        else if (monthNum <= 8) quarter = "Q3";
        else quarter = "Q4";
        
        const quarterKey = `${year}-${quarter}`;
        
        if (!quarterlyData[quarterKey]) {
            quarterlyData[quarterKey] = {
                year: year,
                quarter: quarter,
                quarterNum: quarters.indexOf(quarter),
                positive: 0
            };
        }
        
        quarterlyData[quarterKey].positive += month.positive;
    });
    
    return Object.values(quarterlyData).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.quarterNum - b.quarterNum;
    });
}

/* Apply year period filter to quarterly data */
function filterDataByPeriod(quarterlyData, period) {
    if (period === "2023") {
        return quarterlyData.filter(d => d.year === 2023);
    } else if (period === "2024") {
        return quarterlyData.filter(d => d.year === 2024);
    }
    return quarterlyData;
}

/* Calculate global max values for both data series */
function calculateGlobalMaxValues(drugTests, positiveDrugs) {
    const allConducted = processQuarterlyData(drugTests);
    const allPositive = processPositiveQuarterlyData(positiveDrugs);
    
    globalConductedMax = allConducted.length > 0 ? Math.max(...allConducted.map(d => d.conducted)) : 0;
    globalPositiveMax = allPositive.length > 0 ? Math.max(...allPositive.map(d => d.positive)) : 0;
}

/* Determine max value based on current data type view */
function getYAxisMaxValue() {
    if (currentDataType === "conducted") {
        // For "Test Conducted" view, use a fixed max of 200,000
        return 200000;
    } else if (currentDataType === "positive") {
        return 12000;
    } else {
        // For "both" view, use a fixed max of 200,000
        return 200000;
    }
}

/* Draw the chart */
function drawChart1() {
    const data = window.globalData;
    if (!data || !data.drugTests || !data.positiveDrugs) return;
    
    chart1Config.width = getResponsiveChartWidth();
    
    if (globalConductedMax === 0 && globalPositiveMax === 0) {
        calculateGlobalMaxValues(data.drugTests, data.positiveDrugs);
    }
    
    let conductedQuarterly = processQuarterlyData(data.drugTests);
    let positiveQuarterly = processPositiveQuarterlyData(data.positiveDrugs);
    
    let conductedQuarterlyFiltered = filterDataByPeriod(conductedQuarterly, currentPeriod);
    let positiveQuarterlyFiltered = filterDataByPeriod(positiveQuarterly, currentPeriod);
    
    if (conductedQuarterlyFiltered.length === 0 && positiveQuarterlyFiltered.length === 0) return;
    
    let allQuarters = [...conductedQuarterlyFiltered];
    positiveQuarterlyFiltered.forEach(p => {
        if (!allQuarters.some(q => q.year === p.year && q.quarter === p.quarter)) {
            allQuarters.push(p);
        }
    });
    allQuarters.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.quarterNum - b.quarterNum;
    });
    
    const quarterKeys = allQuarters.map(q => `${q.year} ${q.quarter}`);
    
    let chartData = [];
    
    if (currentDataType === "conducted" || currentDataType === "both") {
        const conductedMap = new Map();
        conductedQuarterlyFiltered.forEach(d => {
            conductedMap.set(`${d.year} ${d.quarter}`, d.conducted);
        });
        
        chartData.push({
            name: "Tests Conducted",
            values: allQuarters.map((q) => ({
                value: conductedMap.get(`${q.year} ${q.quarter}`) || 0,
                key: `${q.year} ${q.quarter}`
            })),
            color: colorConducted
        });
    }
    
    if (currentDataType === "positive" || currentDataType === "both") {
        const positiveMap = new Map();
        positiveQuarterlyFiltered.forEach(d => {
            positiveMap.set(`${d.year} ${d.quarter}`, d.positive);
        });
        
        chartData.push({
            name: "Positive Tests",
            values: allQuarters.map((q) => ({
                value: positiveMap.get(`${q.year} ${q.quarter}`) || 0,
                key: `${q.year} ${q.quarter}`
            })),
            color: colorPositive
        });
    }
    
    if (chartData.length === 0) return;
    
    const yAxisMax = getYAxisMaxValue();
    const container = d3.select("#chart1");
    container.html("");
    
    const innerWidth = chart1Config.width - chart1Config.margin.left - chart1Config.margin.right;
    const innerHeight = chart1Config.height - chart1Config.margin.top - chart1Config.margin.bottom;
    
    const rightOffset = 70;
    const bottomOffset = 30;
    
    const svg = container
        .append("svg")
        .attr("width", chart1Config.width + rightOffset)
        .attr("height", chart1Config.height + bottomOffset)
        .append("g")
        .attr("transform", `translate(${chart1Config.margin.left + rightOffset}, ${chart1Config.margin.top + bottomOffset})`);
    
    const xScale = d3.scalePoint()
        .domain(quarterKeys)
        .range([0, innerWidth])
        .padding(0.5);
    
    const yScale = d3.scaleLinear()
        .domain([0, yAxisMax])
        .range([innerHeight, 0]);
    
    const lineGenerator = d3.line()
        .x(d => xScale(d.key))
        .y(d => yScale(d.value))
        .curve(d3.curveMonotoneX);
    
    const tooltip = window.utility.getTooltip();
    
    chartData.forEach(series => {
        svg.append("path")
            .datum(series.values)
            .attr("fill", "none")
            .attr("stroke", series.color)
            .attr("stroke-width", 2.5)
            .attr("d", lineGenerator);
        
        series.values.forEach((point, index) => {
            const cx = xScale(point.key);
            const cy = yScale(point.value);
            
            const circle = svg.append("circle")
                .attr("cx", cx)
                .attr("cy", cy)
                .attr("r", 6)
                .attr("fill", series.color)
                .attr("stroke", "white")
                .attr("stroke-width", 2)
                .style("cursor", "pointer")
                .style("opacity", 0.8);
            
            const tooltipContent = `${point.key}<br/>${series.name}: ${window.utility.formatNumber(point.value)}`;
            
            window.utility.setupTooltipHandlers(
                circle,
                tooltip,
                tooltipContent,
                function() { d3.select(this).attr("r", 9).attr("stroke-width", 3); },
                function() { d3.select(this).attr("r", 6).attr("stroke-width", 2); }
            );
        });
    });
    
    svg.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).tickFormat(d => {
            const [year, quarter] = d.split(" ");
            const yearShort = year.slice(-2);
            return `${quarter} ${yearShort}`;
        }))
        .attr("class", "chart-tick")
        .selectAll("text")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold");
    
    svg.append("g")
        .call(d3.axisLeft(yScale).ticks(6).tickFormat(d => window.utility.formatNumber(d)))
        .attr("class", "chart-tick");
    
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
        .attr("x", -20)
        .attr("y", -15)
        .text("Number of Drug Tests")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "#555");
    
    const legendGroup = svg.append("g").attr("transform", `translate(${innerWidth - 140}, -20)`);
    let legendY = 0;
    chartData.forEach(series => {
        legendGroup.append("line")
            .attr("x1", 0)
            .attr("y1", legendY)
            .attr("x2", 20)
            .attr("y2", legendY)
            .attr("stroke", series.color)
            .attr("stroke-width", 2.5);
        legendGroup.append("circle")
            .attr("cx", 10)
            .attr("cy", legendY)
            .attr("r", 4)
            .attr("fill", series.color);
        legendGroup.append("text")
            .attr("x", 28)
            .attr("y", legendY + 4)
            .text(series.name)
            .style("font-size", "11px")
            .style("fill", "#555");
        legendY += 18;
    });
}

/* Initialize chart filter event listeners */
function initChart1Controls() {
    const periodFilter = document.getElementById("yearFilter");
    if (periodFilter) {
        periodFilter.addEventListener("change", function() {
            currentPeriod = this.value;
            drawChart1();
        });
    }
    
    const btnConducted = document.getElementById("btnConducted");
    const btnPositive = document.getElementById("btnPositive");
    const btnBoth = document.getElementById("btnBoth");
    
    if (btnConducted) {
        btnConducted.addEventListener("click", function() {
            currentDataType = "conducted";
            document.querySelectorAll("#dataTypeFilter .btn-toggle").forEach(btn => btn.classList.remove("active"));
            btnConducted.classList.add("active");
            drawChart1();
        });
    }
    if (btnPositive) {
        btnPositive.addEventListener("click", function() {
            currentDataType = "positive";
            document.querySelectorAll("#dataTypeFilter .btn-toggle").forEach(btn => btn.classList.remove("active"));
            btnPositive.classList.add("active");
            drawChart1();
        });
    }
    if (btnBoth) {
        btnBoth.addEventListener("click", function() {
            currentDataType = "both";
            document.querySelectorAll("#dataTypeFilter .btn-toggle").forEach(btn => btn.classList.remove("active"));
            btnBoth.classList.add("active");
            drawChart1();
        });
    }
}

window.addEventListener('dataLoaded', function() {
    drawChart1();
    initChart1Controls();
});