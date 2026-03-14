// Open product modal gallery only when clicking on the product-card background/content

const productCards = document.querySelectorAll('.product-card');
const modal = document.querySelector('.product-modal');
const closeBtn = modal.querySelector('.close-modal');
const overlay = modal.querySelector('.overlay');
const prevBtn = modal.querySelector('.prev');
const nextBtn = modal.querySelector('.next');

let currentImageIndex = 0;
let images = [];

productCards.forEach(card => {
    card.addEventListener('click', (event) => {
        if (!event.target.closest('.whatsapp-button')) {
            // Get data-images attribute
            images = JSON.parse(card.getAttribute('data-images'));
            currentImageIndex = 0;
            openModal();
        }
    });
});

function openModal() {
    modal.classList.add('open');
    updateImage();
}

function closeModal() {
    modal.classList.remove('open');
}

function updateImage() {
    const imgElement = modal.querySelector('img');
    imgElement.src = images[currentImageIndex];
}

closeBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

prevBtn.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex > 0) ? currentImageIndex - 1 : images.length - 1;
    updateImage();
});

nextBtn.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex < images.length - 1) ? currentImageIndex + 1 : 0;
    updateImage();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeModal();
    }
});