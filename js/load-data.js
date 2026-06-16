// load-data.js 

// function to parse DD/MM/YYYY dates
function parseDate(dateStr) {
    if (!dateStr) return null;
    
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
    }
    return new Date(dateStr);
}

Promise.all([
    d3.csv("dataset/Drug_Test_Conducted.csv", d => ({
        DATE: parseDate(d.DATE),
        JURISDICTION: d.JURISDICTION,
        METRIC: d.METRIC,
        COUNT: +d.COUNT
    })),
    d3.csv("dataset/Positive_Drug.csv", d => ({
        DATE: parseDate(d.DATE),
        JURISDICTION: d.JURISDICTION,
        LOCATION: d.LOCATION,
        AGE_GROUP: d.AGE_GROUP,
        METRIC: d.METRIC,
        FINES: d.FINES ? parseInt(d.FINES) : 0,
        ARRESTS: d.ARRESTS ? parseInt(d.ARRESTS) : 0,
        CHARGES: d.CHARGES ? parseInt(d.CHARGES) : 0,
        COUNT: d.COUNT ? parseInt(d.COUNT) : 0,
        AMPHETAMINE: d.AMPHETAMINE,
        CANNABIS: d.CANNABIS,
        COCAINE: d.COCAINE,
        ECSTASY: d.ECSTASY,
        METHYLAMPHETAMINE: d.METHYLAMPHETAMINE,
        OTHER: d.OTHER,
        OTHER2: d.OTHER2
    }))
]).then(([drugTests, positiveDrugs]) => {
    
    window.globalData = { 
        drugTests: drugTests, 
        positiveDrugs: positiveDrugs
    };
    
    const event = new CustomEvent('dataLoaded', { detail: window.globalData });
    window.dispatchEvent(event);
    
}).catch(err => {
    console.error("Error loading CSV files:", err);
});