/*=============== SHOW MENU ===============*/
const navMenu = document.getElementById('nav-menu'),
      navToggle = document.getElementById('nav-toggle'),
      navClose = document.getElementById('nav-close')

/* Menu show */
if(navToggle){
   navToggle.addEventListener('click', () =>{
      navMenu.classList.add('show-menu')
   })
}

/* Menu hidden */
if(navClose){
   navClose.addEventListener('click', () =>{
      navMenu.classList.remove('show-menu')
   })
}

/* ========== Toggle portfolio images ========== */
function filterProjects(category) {
   let items = document.querySelectorAll('.gallery-item');
   items.forEach(item => {
       if (category === 'all') {
           item.classList.remove('hidden');
       } else {
           item.classList.toggle('hidden', !item.classList.contains(category));
       }
   });
}