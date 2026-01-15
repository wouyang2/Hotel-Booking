// Password Check
document.addEventListener('DOMContentLoaded', () => {

    const passwordInput = document.querySelector("#id_password1");

    if (!passwordInput) return;

    const rules = {
        length : value => value.length >= 8,
        uppercase: value => /[A-Z]/.test(value),
        number: value => /\d/.test(value),
        special: value => /[^A-Za-z0-9]/.test(value),
    };

    const ruleItems = document.querySelectorAll('.password-rules li');

    passwordInput.addEventListener('input', () => {

        const value = passwordInput.value;

        ruleItems.forEach(item => {
            const ruleName = item.dataset.rule;
            const passed = rules[ruleName](value);

            item.classList.toggle("valid-password", passed);
            item.classList.toggle("invalid-password", !passed);
        });
    });
});

// Check if two password is match

document.addEventListener("DOMContentLoaded", () => {

    const password1 = document.getElementById("id_password1");
    const password2 = document.getElementById("id_password2");
    const matched = document.getElementById("pw2-help-text");
    

    function isMatch(){

        if (!password2.value){
            matched.classList.remove('valid', 'invalid');
            return;
        }

        if (password1.value === password2.value){
            matched.classList.remove('invalid');
            matched.classList.add('valid');
        }else{
            matched.classList.remove('invalid');
            matched.classList.add('invalid');
        }
    }

    const submitButton = document.querySelector('form-button');

    function toggleSubmit() {
        submitButton.disabled = password1.value !== password2.value;
    }

    password1.addEventListener("input", isMatch);
    password2.addEventListener("input", isMatch);
    password1.addEventListener("input", toggleSubmit);
    password2.addEventListener("input", toggleSubmit);
});