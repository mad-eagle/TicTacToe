let form = document.querySelector("form");
const formUsername = document.getElementById("username");

form.addEventListener("submit", e =>{
    if (formUsername.value.trim() == "") {
        e.preventDefault();
    } else {
        formUsername.value = formUsername.value.charAt(0).toUpperCase() + formUsername.value.slice(1);
    }
})

var typed = new Typed('#username', {
    strings: ['Enter', 'Username', 'Your name', 'Nickname', 'Minimum 3 character'],
    typeSpeed: 60,
    attr:"placeholder",
    backSpeed: 40,
    loop: true
}); 