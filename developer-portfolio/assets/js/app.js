// Scroll top functionality
const scrollUp = document.querySelector('#scroll-up');

// Nav Hamburguer selections
const burguer = document.querySelector('#burguer-menu');
const ul = document.querySelector('nav ul');
const nav = document.querySelector('nav');

// Select nav links
const navLink = document.querySelectorAll('.nav-link');

// Listeners
navLink.forEach((link) => {
    link.addEventListener('click', () => {
        ul.classList.remove('show');
    })
})
burguer.addEventListener('click', () => {
    ul.classList.toggle('show');
})

scrollUp.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });
});