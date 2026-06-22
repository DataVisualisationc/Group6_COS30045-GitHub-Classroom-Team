/* Singlet tooltip shared across all charts (not call in chart4.js) */
let globalTooltip = null;

function getTooltip() {
    if (!globalTooltip) {
        globalTooltip = d3.select("body")
            .append("div")
            .attr("class", "chart-tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background", "white")
            .style("color", "#333")
            .style("padding", "8px 12px")
            .style("border-radius", "6px")
            .style("font-size", "12px")
            .style("font-family", "'Quicksand', 'Trebuchet MS', sans-serif")
            .style("pointer-events", "none")
            .style("z-index", "1000")
            .style("box-shadow", "0 2px 8px rgba(0,0,0,0.15)")
            .style("border", "1px solid #e0e0e0");
    }
    return globalTooltip;
}

/* Attach hover handlers to elements with tooltip support */
function setupTooltipHandlers(element, tooltip, content, onShow, onHide) {
    element.on("mouseover", function(event) {
        tooltip.transition().duration(200).style("opacity", 0.95);
        tooltip.html(content)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        if (onShow) onShow.call(this);
    })
    .on("mouseout", function() {
        tooltip.transition().duration(500).style("opacity", 0);
        if (onHide) onHide.call(this);
    })
    .on("mousemove", function(event) {
        tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
    });
}

function formatNumber(num) {
    return num.toLocaleString();
}

window.utility = {
    getTooltip: getTooltip,
    setupTooltipHandlers: setupTooltipHandlers,
    formatNumber: formatNumber
};