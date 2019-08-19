function change() {
    sessionStorage.setItem('username', document.getElementsByName('username')[0].value);
    sessionStorage.setItem('password', document.getElementsByName('password')[0].value);
	sessionStorage.setItem('name', document.getElementsByName('name')[0].value);
	sessionStorage.setItem('email', document.getElementsByName('email')[0].value);
}