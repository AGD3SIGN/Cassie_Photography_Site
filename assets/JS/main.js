// Hamburger menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
   hamburger.classList.toggle('active');
   navMenu.classList.toggle('active');
   document.body.style.overflow = hamburger.classList.contains('active') ? 'hidden' : 'auto';
});

// Close menu when clicking a nav link
document.querySelectorAll('.nav-links li a').forEach(link => {
   link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = 'auto';
   });
});

// Header background change on scroll
window.addEventListener('scroll', () => {
   const header = document.querySelector('header');
   if (window.scrollY > 100) {
      header.classList.add('scroll-active');
   } else {
      header.classList.remove('scroll-active');
   }
});

// Initial check for scroll position (on page refresh)
if (window.scrollY > 100) {
   document.querySelector('header').classList.add('scroll-active');
}