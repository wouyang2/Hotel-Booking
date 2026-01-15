document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById('login-form');

    form.addEventListener('submit', async(e) => {

        e.preventDefault(); 

        const formData = new FormData(form);

        const response = await fetch("", {
            method: "POST",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
            },
            body: formData,
        });

        const data = await response.json();

        const password = document.getElementById('id_password');

        if (data.success) {
            window.location.href = '/';
        } else {
            showToast (data.message);
            console.log(password.value);
            password.value = "";
        }
    });

    function showToast(message) {
        const toast = document.createElement("div");
        toast.className = "toast error";
        toast.innerText = message;

        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add("show"));
        
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
          }, 4000);
    }
});