let CurrentIndex = 0;

document.addEventListener("DOMContentLoaded", () => {

    const slides = document.querySelector(".room-slides");
    const slideCount = document.querySelectorAll('.room-slide').length;
    const leftArrow = document.querySelector('.nav-arrow.left');
    const rightArrow = document.querySelector('.nav-arrow.right');

    function update() {
        slides.style.transform = `translateX(-${CurrentIndex * 100}%)`;

        leftArrow.classList.toggle('hidden', CurrentIndex === 0);
        rightArrow.classList.toggle('hidden', CurrentIndex === slideCount - 1);
    }

    window.Next = function (){
        if (CurrentIndex < slideCount - 1) {
            CurrentIndex++;
            update();
        }
    };

    window.Prev = function (){

        if (CurrentIndex > 0) {
            CurrentIndex--;
            update();
        }
    };

    update();
});