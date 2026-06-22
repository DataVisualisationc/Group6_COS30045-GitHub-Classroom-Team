(function() {
    'use strict';
    
    /* Ensure animate.css is loaded */
    if (!document.querySelector('link[href*="animate.css"]')) {
        const animateCSS = document.createElement('link');
        animateCSS.rel = 'stylesheet';
        animateCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
        document.head.appendChild(animateCSS);
    }
    
    /* Load WOW.js and initialize with custom settings */
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/wow/1.1.2/wow.min.js';
    script.onload = function() {
        window.wow = new WOW({
            boxClass: 'wow',
            animateClass: 'animated',
            offset: 120,
            mobile: true,
            live: true
        });
        window.wow.init();
        observeDynamicContent();
    };
    document.head.appendChild(script);
    
    /* Watch for dynamically added chart content */
    function observeDynamicContent() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) {
                            if (node.id === 'chart1' || node.id === 'chart2' || 
                                node.id === 'chart3' || node.id === 'chart4') {
                                if (node.querySelectorAll) {
                                    const newWowElements = node.querySelectorAll('.wow-init');
                                    newWowElements.forEach(function(el) {
                                        el.classList.add('wow');
                                    });
                                    if (window.wow) window.wow.sync();
                                }
                            }
                        }
                    });
                }
            });
        });
        
        const chartContainers = ['chart1', 'chart2', 'chart3', 'chart4'];
        chartContainers.forEach(function(id) {
            const container = document.getElementById(id);
            if (container) {
                observer.observe(container, { childList: true, subtree: true });
            }
        });
    }
    
    /* Apply WOW animation to an element */
    function applyWowAnimation(element, animationClass, duration, delay) {
        if (element) {
            element.classList.add('wow', animationClass);
            element.style.animationDuration = duration;
            if (delay) element.style.animationDelay = delay;
        }
    }
    
    /* Apply WOW classes to all sections */
    function addWowClasses() {
        /* Section 1 - Chart fades up, description static */
        const chart1Section = document.getElementById('chart1-section');
        if (chart1Section) {
            applyWowAnimation(document.getElementById('chart1'), 'animate__fadeInUp', '0.9s', '0.1s');
            applyWowAnimation(chart1Section.querySelector('.chart-note'), 'animate__fadeIn', '0.8s', '0.4s');
        }
        
        /* Section 2 - Chart fades from right, description static */
        const chart2Section = document.getElementById('chart2-section');
        if (chart2Section) {
            applyWowAnimation(document.getElementById('chart2'), 'animate__fadeInRight', '1s', '0.1s');
            
            const filters = chart2Section.querySelectorAll('.filter-group');
            filters.forEach(function(filter, i) {
                applyWowAnimation(filter, 'animate__fadeInUp', '0.7s', (0.2 + i * 0.15) + 's');
            });
            
            applyWowAnimation(chart2Section.querySelector('.chart-note'), 'animate__fadeIn', '0.7s', '0.6s');
        }
        
        /* Section 3 - Map zooms in on reveal */
        const chart3Section = document.getElementById('chart3-section');
        if (chart3Section) {
            applyWowAnimation(document.getElementById('chart3'), 'animate__zoomIn', '1.1s', '0.1s');
            applyWowAnimation(chart3Section.querySelector('.chart-description p'), 'animate__fadeInRight', '0.8s', '0.3s');
            applyWowAnimation(chart3Section.querySelector('.chart-note'), 'animate__fadeIn', '0.7s', '0.5s');
        }
        
        /* Section 4 - Chart fades from right, slower animation */
        const chart4Section = document.getElementById('chart4-section');
        if (chart4Section) {
            applyWowAnimation(document.getElementById('chart4'), 'animate__fadeInRight', '1.3s', '0.1s');
        }
        
        /* Home Section Animations */
        const homeSection = document.getElementById('home-section');
        if (homeSection) {
            applyWowAnimation(homeSection.querySelector('.intro-headline'), 'animate__fadeInDown', '1s', '0.1s');
            
            const leadTexts = homeSection.querySelectorAll('.intro-lead');
            leadTexts.forEach(function(text, i) {
                applyWowAnimation(text, 'animate__fadeInLeft', '0.9s', (0.2 + i * 0.15) + 's');
            });
            
            const listItems = homeSection.querySelectorAll('.intro-list li');
            listItems.forEach(function(item, i) {
                applyWowAnimation(item, 'animate__fadeInLeft', '0.8s', (0.3 + i * 0.1) + 's');
            });
            
            const aimParagraph = homeSection.querySelector('.intro-lead.mt-3');
            if (aimParagraph) {
                const lastBulletDelay = 0.3 + (listItems.length - 1) * 0.1;
                applyWowAnimation(aimParagraph, 'animate__fadeInLeft', '0.8s', lastBulletDelay + 's');
            }
            
            applyWowAnimation(homeSection.querySelector('.img-fluid'), 'animate__fadeInRight', '1s', '0.2s');
        }
        
        const logo = document.querySelector('.navbar-brand');
        if (logo) {
            logo.classList.add('wow', 'animate__pulse');
            logo.style.animationDuration = '1.2s';
            logo.style.animationIterationCount = '1';
        }
    }
    
    /* Custom CSS overrides for animation behavior */
    const customStyle = document.createElement('style');
    customStyle.textContent = `
        .wow {
            visibility: hidden;
            will-change: transform, opacity;
            animation-fill-mode: both !important;
        }
        
        /* Chart-specific durations */
        #chart4.wow {
            --animate-duration: 1.3s !important;
        }
        
        #chart4.animate__fadeInRight {
            animation-duration: 1.3s !important;
        }
        
        /* Static Elements - Title text remains visible without animation */
        .chart-description h2,
        #chart1-section .chart-description h2,
        #chart2-section .chart-description h2,
        #chart3-section .chart-description h2,
        #chart4-section .chart-description h2,
        #chart4-section .chart-description h6,
        #chart4-section .chart-description p,
        #chart2-section .chart-description h6,
        #chart2-section .chart-description p,
        #chart4-section .multi-select-dropdown,
        #chart4-section .chart-filters,
        #chart4-section .filter-group,
        #chart4-section .chart-note,
        .intro-headline {
            visibility: visible !important;
            animation: none !important;
        }
        
        /* Interactions - Hover effects for interactive elements */
        .btn-toggle, .filter-select, .nav-link {
            transition: all 0.25s ease;
        }
        
        .btn-toggle:hover, .filter-select:hover {
            transform: translateY(-2px);
            transition: all 0.25s ease;
        }
        
        #chart1, #chart2, #chart3, #chart4 {
            transition: all 0.3s ease;
        }
        
        #chart1 svg, #chart2 svg, #chart3 svg, #chart4 svg {
            width: 100%;
            height: auto;
        }
    `;
    document.head.appendChild(customStyle);
    
    /* Apply animations after DOM ready */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(addWowClasses, 100);
        });
    } else {
        setTimeout(addWowClasses, 100);
    }
    
    /* Sync animations when chart data is loaded */
    window.addEventListener('dataLoaded', function() {
        setTimeout(function() {
            if (window.wow) {
                window.wow.sync();
            }
        }, 500);
    });
    
    /* Wrap chart draw functions with animation sync */
    function wrapChartDraw(originalFn, chartId, animationClass, duration) {
        if (!originalFn) return null;
        return function() {
            const result = originalFn.apply(this, arguments);
            setTimeout(function() {
                if (window.wow) {
                    window.wow.sync();
                }
                const chart = document.getElementById(chartId);
                if (chart && !chart.classList.contains('wow')) {
                    chart.classList.add('wow', animationClass);
                    chart.style.animationDuration = duration;
                    if (window.wow) window.wow.sync();
                }
            }, 300);
            return result;
        };
    }
    
    /* Chart draw functions to reapply animations */
    const originalDrawChart1 = window.drawChart1;
    if (originalDrawChart1) {
        window.drawChart1 = wrapChartDraw(originalDrawChart1, 'chart1', 'animate__fadeInUp', '0.9s');
    }
    
    const originalDrawChart2 = window.drawChart2;
    if (originalDrawChart2) {
        window.drawChart2 = wrapChartDraw(originalDrawChart2, 'chart2', 'animate__fadeInRight', '1s');
    }
    
    const originalDrawChart3 = window.drawChart3;
    if (originalDrawChart3) {
        window.drawChart3 = wrapChartDraw(originalDrawChart3, 'chart3', 'animate__zoomIn', '1.1s');
    }
    
    const originalDrawChart4 = window.drawChart4;
    if (originalDrawChart4) {
        window.drawChart4 = wrapChartDraw(originalDrawChart4, 'chart4', 'animate__fadeInRight', '1.3s');
    }
})();