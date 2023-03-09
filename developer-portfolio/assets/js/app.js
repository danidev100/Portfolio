// Scroll top functionality
const scrollUp = document.querySelector('#scroll-up');

// Nav Hamburguer selections
const burguer = document.querySelector('.hamburger');
const liOptions = document.querySelector('.list-options');
const svgMenu = document.querySelector('.menu');
const svgMenuClose = document.querySelector('.close');
const btnMenu = document.querySelector('.button-toggle');
const modeTheme = document.querySelector('.mode-type-theme');
const ul = document.querySelector('nav ul');
const nav = document.querySelector('nav');

// Select nav links
const navLink = document.querySelectorAll('.nav-link');

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

burguer.addEventListener('click', () => {
    if (liOptions.classList.contains('block')) {
        // The options are displayed
        liOptions.classList.remove('block');
        liOptions.classList.add('hidden');
        svgMenu.classList.remove('hidden');
        svgMenuClose.classList.add('hidden');
    } else {
        // The options are closed
        liOptions.classList.remove('hidden');
        liOptions.classList.add('block');
        svgMenu.classList.add('hidden');
        svgMenuClose.classList.remove('hidden');
    }
});

// toggleButton.addEventListener('change', () => {
//     document.body.classList.toggle('dark');

//     const isInDarkMode = document.body.classList.contains('dark');
//     toggleDarkModeStyles(isInDarkMode);
// });

function loadContent() {
    document.querySelector('#loader').style.display = 'none';
    document.querySelector('#container').style.display = 'block';
};

function toggleDarkModeStyles() {
    document.body.classList.toggle('dark');

    const isInDarkMode = document.body.classList.contains('dark');
    const navBackground = isInDarkMode ? "bg-dark-2" : "bg-light-0";
    const theme = isInDarkMode ? './icons/sun.png' : './icons/moon.png';

    nav.classList.add(navBackground);
    modeTheme.src = theme;
};