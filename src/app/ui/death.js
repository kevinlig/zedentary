import { observe } from 'mobx';
import GameStore from '../store/gameStore';

const modal = document.querySelector('#death-modal');
const summary = document.querySelector('#death-summary');
const button = document.querySelector('#death-restart');

observe(GameStore, 'lives', (change) => {
    if (change.type === 'update') {
        if (GameStore.lives === 0) {
            modal.classList.remove('hide');
            writeSummary();
        }
        else {
            modal.classList.add('hide');
        }
    }
});

observe(GameStore, 'mode', (change) => {
    if (change.type === 'update' && GameStore.mode !== 'game') {
        modal.classList.add('hide');
    }
});

button.addEventListener('click', () => {
    modal.classList.add('hide');
    GameStore.startJoke();
    GameStore.startGame();
});

function writeSummary() {
    const ticketCount = GameStore.tickets;
    let text = `You completed ${ticketCount} ticket`;
    if (ticketCount !== 1) {
        text += 's'
    }
    text += ' before you died.';
    summary.textContent = text;
}