const themeToggle = document.getElementById('lightmode');
const themeToggleButton = document.querySelector('.light-toggle__button');


// Set toggle state on pageload.
if (localStorage.theme === 'dark') {
  themeToggle.checked = true;
} else {
  themeToggle.checked = false;
}


themeToggle.addEventListener('click', () => {
  // if I set this initially, the toggle transitions on pageload.
  // This way, the transition style gets set *after* first render.
  themeToggleButton.style.transition = "all 0.1s ease-in-out";

  if(themeToggle.checked) { // dark theme has been selected
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark'); // save theme selection 
  } else {
    document.documentElement.removeAttribute('data-theme');
    localStorage.removeItem('theme'); // reset theme selection 
  } 
});



