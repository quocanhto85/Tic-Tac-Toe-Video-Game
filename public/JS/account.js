var x = 1;
document.querySelector('.account').addEventListener('click', function() {
    document.querySelector('.account-click').classList.toggle('account-toggle')
    x = ++x % 2;
})