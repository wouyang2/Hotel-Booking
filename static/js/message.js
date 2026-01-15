document.addEventListener('DOMContentLoaded', function() {

    const toasts = document.querySelectorAll('.toast');

    toasts.forEach((toast) => {
        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 400);
        
        }, 3000);
    });
});