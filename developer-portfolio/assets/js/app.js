// Scroll top functionality
const scrollUp = document.querySelector('#scroll-up');

// Nav Hamburguer selections
const menu = document.querySelector('#menu');
const modeTheme = document.querySelector('.mode-type-theme');
const nav = document.querySelector('nav');

scrollUp.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });
});

window.addEventListener('scroll', handleScroll);

function openMenu() {
    menu.classList.contains('hidden') ? menu.classList.remove('hidden') : menu.classList.add('hidden');
}

function loadContent() {
    document.querySelector('#loader').style.display = 'none';
    document.querySelector('#container').style.display = 'block';
};

function toggleDarkModeStyles() {
    document.body.classList.toggle('dark');

    const isInDarkMode = document.body.classList.contains('dark');
    const navBackground = isInDarkMode ? "bg-dark-2" : "bg-light-0";
    const theme = isInDarkMode ? './icons/sun-white.png' : './icons/moon.png';

    nav.classList.add(navBackground);
    modeTheme.src = theme;
};

function handleScroll() {
    const scrollPosition = window.scrollY;
    
    if (scrollPosition > 0) {
        nav.classList.add('scroll-down');
        nav.classList.remove('scroll-top');
    } else {
        nav.classList.remove('scroll-down');
        nav.classList.add('scroll-top');
    }
}