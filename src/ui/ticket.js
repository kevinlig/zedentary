import { observe } from 'mobx';
import GameStore from '../store/gameStore';

const titleEl = document.getElementById('ticket-title');
const progressBar = document.querySelector('#ticket-progress .progress__bar');
const barWidth = 200;
let ticketProgress = 0;

observe(GameStore, 'mode', (change) => {
    if (change.type === 'update' && GameStore.mode === 'game') {
        // we're starting a new game
        startTicket();
    }
});

function makeProgress() {
    ticketProgress += 0.01;

    // update the progress bar to reflect the value
    let offsetX = 0;
    let scale = 1;
    if (ticketProgress < 1) {
        offsetX = (barWidth / -2) + ((ticketProgress * barWidth) / 2);
        scale = ticketProgress;
    }
    progressBar.style.transform = `translateX(${offsetX}px) scaleX(${scale})`;

    if (ticketProgress < 1) {
        // register the next update
        window.requestAnimationFrame(makeProgress);
    }
    else {
        GameStore.addTicket();
        startTicket();
    }
}

function startTicket() {
    ticketProgress = 0;
    const formattedCount = `${GameStore.tickets + 1}`.padStart(3, 0);
    titleEl.textContent = `TIX-${formattedCount}`;
    window.requestAnimationFrame(makeProgress);
}