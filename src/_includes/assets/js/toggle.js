const themeToggle = document.getElementById('lightmode');

if (localStorage.theme === 'dark') {
  themeToggle.checked = true;
} else {
  themeToggle.checked = false;
}

themeToggle.addEventListener('click', () => {
  if(themeToggle.checked) { // dark theme has been selected
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark'); // save theme selection 
  } else {
    document.documentElement.removeAttribute('data-theme');
    localStorage.removeItem('theme'); // reset theme selection 
  } 
});

