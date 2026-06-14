// chart3.js australia map 

window.addEventListener('dataLoaded', function(e) {
    const data = e.detail;
    if (!data || !data.positiveDrugs) {
        console.error("chart3.js: No positiveDrugs data found");
        return;
    }
    
    const container = document.getElementById("chart3");
    if (!container) {
        console.error("chart3.js: #chart3 container not found");
        return;
    }
    
    container.innerHTML = "";
    
    // Get container width 
    const containerWidth = container.clientWidth;
    const width = Math.max(containerWidth, 800);  
    const height = width * 0.85; 
    
    const svg = d3.select("#chart3")
        .append("svg")
        .attr("width", "100%")
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("border-radius", "12px")
        .style("cursor", "pointer");
    
    // Calculate scale based on width - larger width = larger map
    const scale = Math.min(width * 1.2, 1400);
    
    const projection = d3.geoMercator()
        .center([133, -27])
        .scale(scale)
        .translate([width / 2 + 30, height / 2 - 10]); 
    
    const pathGenerator = d3.geoPath().projection(projection);
    
    const jurisdictionMap = {
        "ACT": "Australian Capital Territory",
        "NSW": "New South Wales",
        "NT": "Northern Territory",
        "QLD": "Queensland",
        "SA": "South Australia",
        "TAS": "Tasmania",
        "VIC": "Victoria",
        "WA": "Western Australia"
    };
    
    function getTotalFines(jurisdictionName, positiveDrugs) {
        let csvJurisdiction = null;
        for (const [code, name] of Object.entries(jurisdictionMap)) {
            if (name === jurisdictionName) {
                csvJurisdiction = code;
                break;
            }
        }
        if (!csvJurisdiction) return 0;
        
        let total = 0;
        positiveDrugs.forEach(d => {
            if (d.JURISDICTION === csvJurisdiction) {
                let val = d.FINES;
                if (typeof val === 'string') val = parseInt(val, 10);
                if (isNaN(val)) val = 0;
                total += val;
            }
        });
        return total;
    }
    
    function getColor(value, minVal, maxVal) {
        if (value === 0) return "#e8e8e8";
        
        const t = Math.pow((value - minVal) / (maxVal - minVal), 0.45);
        
        const lightBlue = [222, 235, 247];
        const midBlue = [66, 146, 198];
        const darkBlue = [8, 48, 107];
        
        let r, g, b;
        if (t < 0.5) {
            const t2 = t / 0.5;
            r = lightBlue[0] + (midBlue[0] - lightBlue[0]) * t2;
            g = lightBlue[1] + (midBlue[1] - lightBlue[1]) * t2;
            b = lightBlue[2] + (midBlue[2] - lightBlue[2]) * t2;
        } else {
            const t2 = (t - 0.5) / 0.5;
            r = midBlue[0] + (darkBlue[0] - midBlue[0]) * t2;
            g = midBlue[1] + (darkBlue[1] - midBlue[1]) * t2;
            b = midBlue[2] + (darkBlue[2] - midBlue[2]) * t2;
        }
        
        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }
    
    d3.json("dataset/australia.json").then(geoData => {
        function renderMap() {
            svg.selectAll(".state-path").remove();
            svg.selectAll(".legend-group").remove();
            
            const stateData = [];
            geoData.features.forEach(feature => {
                const stateName = feature.properties.STATE_NAME;
                let value = getTotalFines(stateName, data.positiveDrugs);  
                stateData.push({ name: stateName, value: value, feature: feature });
            });
            
            const values = stateData.map(d => d.value).filter(v => v > 0);
            const maxVal = Math.max(...values, 1);
            const minVal = Math.min(...values, 1);
            
            svg.selectAll(".state-path")
                .data(stateData)
                .enter()
                .append("path")
                .attr("class", "state-path")
                .attr("d", d => pathGenerator(d.feature))
                .attr("fill", d => d.value === 0 ? "#e0e0e0" : getColor(d.value, minVal, maxVal))
                .attr("stroke", "#333")
                .attr("stroke-width", 1.2)
                .attr("stroke-linejoin", "round")
                .on("mouseover", function(event, d) {
                    d3.select(this).attr("stroke-width", 2.5).attr("stroke", "#000");
                    const tooltip = window.utility.getTooltip();
                    tooltip.transition().duration(200).style("opacity", 0.95);
                    tooltip.html(`<strong>${d.name}</strong><br/>Fines: ${d.value.toLocaleString()}`)  
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    d3.select(this).attr("stroke-width", 1.2).attr("stroke", "#333");
                    const tooltip = window.utility.getTooltip();
                    tooltip.transition().duration(500).style("opacity", 0);
                })
                .on("mousemove", function(event) {
                    const tooltip = window.utility.getTooltip();
                    tooltip.style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                });
            
            if (maxVal > 0) {
                const legendWidth = Math.min(350, width * 0.4);
                const legendHeight = 14;
                const legendX = (width - legendWidth) / 2;
                const legendY = height - 50;
                
                const legendGroup = svg.append("g")
                    .attr("class", "legend-group")
                    .attr("transform", `translate(${legendX}, ${legendY})`);
                
                let defs = svg.select("defs");
                if (defs.empty()) {
                    defs = svg.append("defs");
                }
                
                const gradientId = "legend-gradient";
                let gradient = defs.select(`#${gradientId}`);
                if (gradient.empty()) {
                    gradient = defs.append("linearGradient")
                        .attr("id", gradientId)
                        .attr("x1", "0%").attr("x2", "100%").attr("y1", "0%").attr("y2", "0%");
                    
                    for (let i = 0; i <= 5; i++) {
                        const t = i / 5;
                        const valueT = minVal * Math.pow(maxVal / minVal, t);
                        gradient.append("stop")
                            .attr("offset", `${t * 100}%`)
                            .attr("stop-color", getColor(valueT, minVal, maxVal));
                    }
                }
                
                legendGroup.append("rect")
                    .attr("width", legendWidth)
                    .attr("height", legendHeight)
                    .style("fill", `url(#${gradientId})`)
                    .attr("rx", 4);
                
                legendGroup.append("text")
                    .attr("x", 0)
                    .attr("y", -8)
                    .attr("dy", "0.35em")
                    .style("font-size", "12px")
                    .style("fill", "#666")
                    .text("Lower Fines");  
                
                legendGroup.append("text")
                    .attr("x", legendWidth)
                    .attr("y", -8)
                    .attr("dy", "0.35em")
                    .attr("text-anchor", "end")
                    .style("font-size", "12px")
                    .style("fill", "#666")
                    .text("Higher Fines");  
                
                legendGroup.append("text")
                    .attr("x", 0)
                    .attr("y", legendHeight + 18)
                    .style("font-size", "11px")
                    .style("fill", "#999")
                    .text(`0`);
                
                legendGroup.append("text")
                    .attr("x", legendWidth)
                    .attr("y", legendHeight + 18)
                    .attr("text-anchor", "end")
                    .style("font-size", "11px")
                    .style("fill", "#999")
                    .text(`${maxVal.toLocaleString()}`);
            }
        }
        
        renderMap();
        
        window.addEventListener('resize', function() {
            const newWidth = container.clientWidth;
            if (newWidth !== width) {
                location.reload();
            }
        });
        
    }).catch(error => {
        console.error("chart3.js: Error loading map data:", error);
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .attr("fill", "red")
            .style("font-size", "16px")
            .text(`Error loading map: ${error.message}`);
    });
});

if (window.globalData) {
    const event = new CustomEvent('dataLoaded', { detail: window.globalData });
    window.dispatchEvent(event);
}