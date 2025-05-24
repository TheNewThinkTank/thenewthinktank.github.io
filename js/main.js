
document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.getElementById('dark-mode-toggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
        });
    }
});
