const modal = document.getElementById('intro-modal');
const startButton = document.getElementById('intro-start');

function closeModal() {
    modal.classList.add('hide');
}

startButton.addEventListener('click', closeModal);