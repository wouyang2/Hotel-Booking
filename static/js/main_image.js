function ChangeMainImage(thumbnail){
    const mainImage = document.getElementById('main-hotel-image');
    mainImage.src = thumbnail.src;

    document.querySelectorAll(".thumbnail").forEach(img => {
        img.classList.remove("active");
    });
    thumbnail.classList.add("active");
}