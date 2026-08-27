document.addEventListener('DOMContentLoaded', function() {
    const burger = document.getElementById('burgerBtn');
    const nav = document.getElementById('mainNav');
    
    if (burger && nav) {
        burger.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
    }
});