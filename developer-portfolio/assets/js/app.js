// Scroll top functionality
const scrollUp = document.querySelector('#scroll-up');

// Nav Hamburguer selections
const burguer = document.querySelector('#side-menu');
const ul = document.querySelector('nav ul');
const nav = document.querySelector('nav');

// Select nav links
const navLink = document.querySelectorAll('.nav-link');

const toggleButton = document.getElementById('toggle-button');

// Listeners
navLink.forEach((link) => {
    link.addEventListener('click', () => {
        // Toggle items
        ul.classList.toggle('hide');
        if (ul.classList.contains('hide')) nav.style.minHeight = 0;
    });
});

scrollUp.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });
});

toggleButton.addEventListener('change', () => {
    document.body.classList.toggle('dark');

    const isInDarkMode = document.body.classList.contains('dark');
    toggleDarkModeStyles(isInDarkMode);
});

function loadContent() {
    document.querySelector('#loader').style.display = 'none';
    document.querySelector('#container').style.display = 'block';
};

function toggleDarkModeStyles(isDark) {
    const navBackground = isDark ? "#212529" : "f8f9fa";
    const headerBackground = isDark ? "#212529" : "#f8f9fa";
    const hambLineBackground = isDark ? "#f8f9fa" : "#212529";
    const hambLineElements = document.querySelectorAll('.hamb-line');
    const sheet = new CSSStyleSheet();

    nav.style.background = navBackground;
    document.getElementsByClassName('header')[0].style.background = headerBackground;
    [].forEach.call(hambLineElements, (hambLine) => { 
        hambLine.style.setProperty("background", hambLineBackground) });
    sheet.replace(
        `span.hamb-line::after { background: ${hambLineBackground}; } 
        span.hamb-line::before { background: ${hambLineBackground}; }`)
        .then(() => {});
    document.adoptedStyleSheets = [sheet];
};