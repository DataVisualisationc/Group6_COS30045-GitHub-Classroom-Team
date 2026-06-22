const allDrugTypes = [
    "OTHER",
    "CANNABIS", 
    "COCAINE",
    "ECSTASY",
    "METHYLAMPHETAMINE",
    "AMPHETAMINE"
];

/* Currently selected drug types for display */
let selectedDrugTypes = [...allDrugTypes];

const jurisdictions = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"];

const jurisdictionFullNames = {
    "ACT": "Australian Capital Territory",
    "NSW": "New South Wales",
    "NT": "Northern Territory",
    "QLD": "Queensland",
    "SA": "South Australia",
    "TAS": "Tasmania",
    "VIC": "Victoria",
    "WA": "Western Australia"
};

const drugTypeDisplayNames = {
    "AMPHETAMINE": "Amphetamine",
    "CANNABIS": "Cannabis",
    "COCAINE": "Cocaine",
    "ECSTASY": "Ecstasy",
    "METHYLAMPHETAMINE": "Methamphetamine",
    "OTHER": "Other Drugs"
};

const heatmapColors = ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c"];

/* Count "Yes" responses aggregated by jurisdiction and drug type */
function getHeatmapData(positiveDrugs) {
    const data = {};
    jurisdictions.forEach(jurisdiction => {
        data[jurisdiction] = {};
        allDrugTypes.forEach(drugType => {
            data[jurisdiction][drugType] = 0;
        });
    });
    
    if (!positiveDrugs || positiveDrugs.length === 0) {
        return { data, maxVal: 0 };
    }
    
    positiveDrugs.forEach((item) => {
        let date = item.DATE;
        if (!date) return;
        
        let year;
        if (date instanceof Date) {
            year = date.getFullYear();
        } else if (typeof date === 'string') {
            year = parseInt(date.substring(0, 4));
        } else {
            return;
        }
        
        if (isNaN(year) || (year !== 2023 && year !== 2024)) return;
        
        const jurisdiction = item.JURISDICTION;
        if (!jurisdictions.includes(jurisdiction)) return;
        
        allDrugTypes.forEach(drugType => {
            if (drugType === "OTHER") {
                let otherValue = item["OTHER"];
                let other2Value = item["OTHER2"];
                
                let isOtherYes = (otherValue === "Yes" || otherValue === "YES" || otherValue === "yes" || 
                                  otherValue === 1 || otherValue === "1" || otherValue === true);
                let isOther2Yes = (other2Value === "Yes" || other2Value === "YES" || other2Value === "yes" || 
                                   other2Value === 1 || other2Value === "1" || other2Value === true);
                
                if (isOtherYes || isOther2Yes) {
                    data[jurisdiction][drugType] += 1;
                }
            } else {
                let value = item[drugType];
                if (value === "Yes" || value === "YES" || value === "yes" || 
                    value === 1 || value === "1" || value === true) {
                    data[jurisdiction][drugType] += 1;
                }
            }
        });
    });
    
    let maxVal = 0;
    jurisdictions.forEach(jurisdiction => {
        selectedDrugTypes.forEach(drugType => {
            if (data[jurisdiction][drugType] > maxVal) {
                maxVal = data[jurisdiction][drugType];
            }
        });
    });
    
    return { data, maxVal };
}

/* Map value to heatmap color using interpolation */
function getColorForValue(value, maxVal) {
    if (maxVal === 0) return "#e0e0e0";
    const intensity = value / maxVal;
    const clampedIntensity = Math.min(1, Math.max(0, intensity));
    
    if (clampedIntensity === 0) return "#f0f0f0";
    
    const colorCount = heatmapColors.length;
    const index = Math.floor(clampedIntensity * (colorCount - 1));
    const remainder = (clampedIntensity * (colorCount - 1)) - index;
    
    if (index >= colorCount - 1) return heatmapColors[colorCount - 1];
    
    const c1 = heatmapColors[index];
    const c2 = heatmapColors[index + 1];
    
    const r1 = parseInt(c1.slice(1, 3), 16);
    const g1 = parseInt(c1.slice(3, 5), 16);
    const b1 = parseInt(c1.slice(5, 7), 16);
    const r2 = parseInt(c2.slice(1, 3), 16);
    const g2 = parseInt(c2.slice(3, 5), 16);
    const b2 = parseInt(c2.slice(5, 7), 16);
    
    const r = Math.round(r1 + (r2 - r1) * remainder);
    const g = Math.round(g1 + (g2 - g1) * remainder);
    const b = Math.round(b1 + (b2 - b1) * remainder);
    
    return `rgb(${r}, ${g}, ${b})`;
}

/* Draw heatmap chart */
function drawHeatmapChart() {
    const container = document.getElementById("chart4");
    if (!container) return;
    
    if (!window.globalData || !window.globalData.positiveDrugs) {
        container.innerHTML = '<div style="text-align:center; padding:50px; color:#999;">Loading data...</div>';
        return;
    }
    
    const result = getHeatmapData(window.globalData.positiveDrugs);
    const heatmapData = result.data;
    const maxVal = result.maxVal;
    
    const displayDrugTypes = allDrugTypes.filter(dt => selectedDrugTypes.includes(dt));
    
    if (displayDrugTypes.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:50px; color:#999;">Please select at least one drug type to display.</div>';
        return;
    }
    
    container.innerHTML = "";
    
    const chartWidth = 1100;
    const chartHeight = 600;
    
    const margin = { top: 60, right: 40, bottom: 140, left: 180 };
    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;
    
    const cellWidth = innerWidth / jurisdictions.length;
    const cellHeight = innerHeight / displayDrugTypes.length;
    
    const svg = d3.select("#chart4")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("viewBox", `0 0 ${chartWidth} ${chartHeight}`)
        .style("background", "white")
        .style("border-radius", "12px")
        .style("display", "block")
        .style("margin", "0 auto")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "chart-tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "white")
        .style("color", "#333")
        .style("padding", "8px 12px")
        .style("border-radius", "6px")
        .style("font-size", "12px")
        .style("font-family", "'Quicksand', sans-serif")
        .style("pointer-events", "none")
        .style("z-index", "1000")
        .style("box-shadow", "0 2px 8px rgba(0,0,0,0.15)")
        .style("border", "1px solid #e0e0e0");
    
    displayDrugTypes.forEach((drugType, rowIndex) => {
        jurisdictions.forEach((jurisdiction, colIndex) => {
            const value = heatmapData[jurisdiction][drugType];
            const color = getColorForValue(value, maxVal);
            
            const cell = svg.append("rect")
                .attr("x", colIndex * cellWidth)
                .attr("y", rowIndex * cellHeight)
                .attr("width", cellWidth)
                .attr("height", cellHeight)
                .attr("fill", color)
                .attr("stroke", "#ddd")
                .attr("stroke-width", 0.5)
                .attr("class", "heatmap-cell")
                .style("cursor", "pointer");
            
            cell.on("mouseover", function(event) {
                tooltip.transition().duration(200).style("opacity", 0.95);
                tooltip.html(`
                    <strong>${jurisdictionFullNames[jurisdiction]}</strong><br/>
                    <strong>${drugTypeDisplayNames[drugType]}</strong><br/>
                    Number: ${value.toLocaleString()}
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
                d3.select(this).attr("opacity", 0.8);
            })
            .on("mouseout", function() {
                tooltip.transition().duration(500).style("opacity", 0);
                d3.select(this).attr("opacity", 1);
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            });
        });
    });

    /* x-axis - Jurisdiction labels */
    const xAxisGroup = svg.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .attr("class", "x-axis");
    
    const xAxis = d3.axisBottom(d3.scaleBand()
        .domain(jurisdictions)
        .range([0, innerWidth]))
        .tickFormat(d => d);
    
    xAxisGroup.call(xAxis);
    
    xAxisGroup.selectAll("text")
        .style("font-size", "13px")
        .style("font-family", "'Quicksand', sans-serif")
        .style("font-weight", "bold")
        .style("fill", "#333")
        .attr("dx", "0em")
        .attr("dy", "0.8em")
        .style("text-anchor", "middle");
    
    // y-axis - Drug type label
    const yAxisGroup = svg.append("g")
        .attr("class", "y-axis");
    
    const yAxis = d3.axisLeft(d3.scaleBand()
        .domain(displayDrugTypes)
        .range([0, innerHeight]))
        .tickFormat(d => drugTypeDisplayNames[d]);
    
    yAxisGroup.call(yAxis);
    
    yAxisGroup.selectAll("text")
        .style("font-size", "12px")
        .style("font-family", "'Quicksand', sans-serif")
        .style("fill", "#333");
    
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", innerWidth)
        .attr("y", innerHeight + 60)
        .text("Jurisdiction")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "#555");
    
    svg.append("text")
        .attr("text-anchor", "start")
        .attr("x", -20)
        .attr("y", -15)
        .text("Drug Types")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "#555");
    
    if (maxVal > 0) {
        const legendWidth = 300;
        const legendHeight = 12;
        const legendX = (innerWidth - legendWidth) / 2;
        const legendY = innerHeight + 95;
        
        const legendGroup = svg.append("g")
            .attr("transform", `translate(${legendX}, ${legendY})`);
        
        const defs = svg.append("defs");
        const gradientId = "heatmap-gradient-" + Date.now();
        const gradient = defs.append("linearGradient")
            .attr("id", gradientId)
            .attr("x1", "0%").attr("x2", "100%").attr("y1", "0%").attr("y2", "0%");
        
        for (let i = 0; i <= 7; i++) {
            const t = i / 7;
            const color = getColorForValue(t * maxVal, maxVal);
            gradient.append("stop")
                .attr("offset", `${t * 100}%`)
                .attr("stop-color", color);
        }
        
        legendGroup.append("rect")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", `url(#${gradientId})`)
            .attr("rx", 3);
        
        legendGroup.append("text")
            .attr("x", 0)
            .attr("y", -8)
            .style("font-size", "11px")
            .style("fill", "#666")
            .text("Lower");
        
        legendGroup.append("text")
            .attr("x", legendWidth)
            .attr("y", -8)
            .attr("text-anchor", "end")
            .style("font-size", "11px")
            .style("fill", "#666")
            .text("Higher");
    }
}

function drawChart4() {
    drawHeatmapChart();
}

/* Initialize dropdown filter and checkbox */
function initChart4Controls() {
    const toggleBtn = document.getElementById("dropdownToggleBtn");
    const optionsPanel = document.getElementById("dropdownOptionsPanel");
    const checkboxes = document.querySelectorAll("#drugTypeCheckboxes input[type='checkbox']");
    const selectAllBtn = document.getElementById("selectAllBtn");
    const deselectAllBtn = document.getElementById("deselectAllBtn");
    const selectedCountDisplay = document.getElementById("selectedCountDisplay");
    
    if (selectAllBtn) {
        selectAllBtn.style.transition = "color 0.2s ease";
        selectAllBtn.style.backgroundColor = "transparent";
        selectAllBtn.style.color = "#000000";
        selectAllBtn.addEventListener("mouseenter", function() {
            this.style.color = "#1f77b4";
        });
        selectAllBtn.addEventListener("mouseleave", function() {
            this.style.color = "#000000";
        });
    }
    
    if (deselectAllBtn) {
        deselectAllBtn.style.transition = "color 0.2s ease";
        deselectAllBtn.style.backgroundColor = "transparent";
        deselectAllBtn.style.color = "#000000";
        deselectAllBtn.addEventListener("mouseenter", function() {
            this.style.color = "#1f77b4";
        });
        deselectAllBtn.addEventListener("mouseleave", function() {
            this.style.color = "#000000";
        });
    }
    
    if (toggleBtn) {
        toggleBtn.addEventListener("click", function(e) {
            e.stopPropagation();
            const isVisible = optionsPanel.style.display === "block";
            optionsPanel.style.display = isVisible ? "none" : "block";
        });
    }
    
    /* Close dropdown when clicking other place */
    document.addEventListener("click", function(e) {
        if (toggleBtn && !toggleBtn.contains(e.target) && optionsPanel && !optionsPanel.contains(e.target)) {
            optionsPanel.style.display = "none";
        }
    });
    
    function updateSelection() {
        selectedDrugTypes = [];
        checkboxes.forEach(cb => {
            if (cb.checked) {
                selectedDrugTypes.push(cb.value);
            }
        });
        
        const count = selectedDrugTypes.length;
        if (count === allDrugTypes.length) {
            selectedCountDisplay.textContent = `All Drug Types (${count} selected)`;
        } else {
            selectedCountDisplay.textContent = `${count} drug type${count !== 1 ? 's' : ''} selected`;
        }
        
        drawChart4();
    }
    
    checkboxes.forEach(cb => {
        cb.addEventListener("change", updateSelection);
    });
    
    if (selectAllBtn) {
        selectAllBtn.addEventListener("click", function() {
            checkboxes.forEach(cb => {
                cb.checked = true;
            });
            updateSelection();
        });
    }
    
    if (deselectAllBtn) {
        deselectAllBtn.addEventListener("click", function() {
            checkboxes.forEach(cb => {
                cb.checked = false;
            });
            updateSelection();
        });
    }
    
    updateSelection();
}

window.drawChart4 = drawChart4;
window.initChart4Controls = initChart4Controls;

if (window.globalData) {
    setTimeout(() => {
        drawChart4();
        initChart4Controls();
    }, 100);
}

window.addEventListener('dataLoaded', function(e) {
    if (e.detail) {
        window.globalData = e.detail;
    }
    setTimeout(() => {
        drawChart4();
        initChart4Controls();
    }, 100);
});