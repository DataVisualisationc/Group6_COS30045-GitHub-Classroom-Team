// navigation.js 
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const logoLink = document.getElementById('logo-home');
    
    function scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const navbarHeight = 76;
            const sectionPosition = section.getBoundingClientRect().top + window.pageYOffset;
            
            window.scrollTo({
                top: sectionPosition - navbarHeight,
                behavior: 'smooth'
            });
        }
    }
    
    function switchChart2View(view) {
        const overTimeBtn = document.getElementById('btnOverTime');
        const ageGroupBtn = document.getElementById('btnAgeGroup');
        
        if (view === 'line' && overTimeBtn && !overTimeBtn.classList.contains('active')) {
            overTimeBtn.click();
        } else if (view === 'age' && ageGroupBtn && !ageGroupBtn.classList.contains('active')) {
            ageGroupBtn.click();
        }
    }
    
    function updateActiveNav() {
        const scrollPosition = window.scrollY + 100;
        
        const homeSection = document.getElementById('home-section');
        const chart1Section = document.getElementById('chart1-section');
        const chart2Section = document.getElementById('chart2-section');
        const chart3Section = document.getElementById('chart3-section');
        const chart4Section = document.getElementById('chart4-section');
        
        let activeSection = null;
        let activeSubSection = null;
        
        if (chart4Section && scrollPosition >= chart4Section.offsetTop - 100) {
            activeSection = 'chart4';
        } else if (chart3Section && scrollPosition >= chart3Section.offsetTop - 100) {
            activeSection = 'chart3';
        } else if (chart2Section && scrollPosition >= chart2Section.offsetTop - 100) {
            activeSection = 'chart2';
            
            const overTimeBtn = document.getElementById('btnOverTime');
            const ageGroupBtn = document.getElementById('btnAgeGroup');
            
            if (overTimeBtn && overTimeBtn.classList.contains('active')) {
                activeSubSection = 'line';
            } else if (ageGroupBtn && ageGroupBtn.classList.contains('active')) {
                activeSubSection = 'age';
            }
        } else if (chart1Section && scrollPosition >= chart1Section.offsetTop - 100) {
            activeSection = 'chart1';
        } else if (homeSection && scrollPosition >= homeSection.offsetTop - 100) {
            activeSection = 'home';
        }
        
        navLinks.forEach(link => {
            link.classList.remove('active-underline');
        });
        
        if (activeSection === 'home') {
            const homeLink = document.querySelector('.nav-link[data-section="home"]');
            if (homeLink) homeLink.classList.add('active-underline');
        } else if (activeSection === 'chart1') {
            const chart1Link = document.querySelector('.nav-link[data-section="chart1"]');
            if (chart1Link) chart1Link.classList.add('active-underline');
        } else if (activeSection === 'chart2') {
            if (activeSubSection === 'line') {
                const lineLink = document.querySelector('.nav-link[data-section="chart2-line"]');
                if (lineLink) lineLink.classList.add('active-underline');
            } else if (activeSubSection === 'age') {
                const ageLink = document.querySelector('.nav-link[data-section="chart2-age"]');
                if (ageLink) ageLink.classList.add('active-underline');
            }
        } else if (activeSection === 'chart3') {
            const chart3Link = document.querySelector('.nav-link[data-section="chart3"]');
            if (chart3Link) chart3Link.classList.add('active-underline');
        } else if (activeSection === 'chart4') {
            const chart4Link = document.querySelector('.nav-link[data-section="chart4"]');
            if (chart4Link) chart4Link.classList.add('active-underline');
        }
    }
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            
            if (section === 'home') {
                scrollToSection('home-section');
            } else if (section === 'chart1') {
                scrollToSection('chart1-section');
            } else if (section === 'chart2-line') {
                switchChart2View('line');
                setTimeout(() => {
                    scrollToSection('chart2-section');
                    setTimeout(updateActiveNav, 50);
                }, 100);
            } else if (section === 'chart2-age') {
                switchChart2View('age');
                setTimeout(() => {
                    scrollToSection('chart2-section');
                    setTimeout(updateActiveNav, 50);
                }, 100);
            } else if (section === 'chart3') {
                scrollToSection('chart3-section');
            } else if (section === 'chart4') {
                scrollToSection('chart4-section');
            }
            
            setTimeout(updateActiveNav, 300);
        });
    });
    
    if (logoLink) {
        logoLink.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToSection('home-section');
            setTimeout(updateActiveNav, 300);
        });
    }
    
    const overTimeBtn = document.getElementById('btnOverTime');
    const ageGroupBtn = document.getElementById('btnAgeGroup');
    
    if (overTimeBtn) {
        overTimeBtn.addEventListener('click', function() {
            setTimeout(updateActiveNav, 100);
        });
    }
    
    if (ageGroupBtn) {
        ageGroupBtn.addEventListener('click', function() {
            setTimeout(updateActiveNav, 100);
        });
    }
    
    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav();
});