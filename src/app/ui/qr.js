import QRCode from 'qrcode';
import GameStore from '../store/gameStore';

const button = document.getElementById('barcode');
const modal = document.getElementById('qr-modal');
const canvas = document.getElementById('qr-code');
const closeButton = document.getElementById('qr-close');

let isShowing = false;

button.addEventListener('click', () => {
    if (isShowing) {
        hideModal();
    }
    else {
        showModal();
    }
});

closeButton.addEventListener('click', hideModal);

function hideModal() {
    isShowing = false;
    modal.classList.add('hide');
}

function showModal() {
    isShowing = true;
    modal.classList.remove('hide');

    // generate the URL
    const url = new URL('./controller.html', window.location.href);
    url.searchParams.set('session', GameStore.session);
    
    QRCode.toCanvas(canvas, url.toString(), (err) => {
        if (err) {
            console.log('QR code error:', err);
        }
    });
}