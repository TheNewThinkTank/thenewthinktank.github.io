
// open links in new panes
let links = document.querySelectorAll('a[href^="#"]');
links.forEach(link => {
    link.setAttribute('target', '_blank');
});

document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');

    // Apply saved mode on load
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
        header.classList.add('dark-mode');
        footer.classList.add('dark-mode');
    }

    if (toggle) {
        toggle.addEventListener('click', () => {
            const enabled = body.classList.toggle('dark-mode');
            header.classList.toggle('dark-mode');
            footer.classList.toggle('dark-mode');
            if (enabled) {
                localStorage.setItem('darkMode', 'enabled');
            } else {
                localStorage.removeItem('darkMode');
            }
        });
    }
});