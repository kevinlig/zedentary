import { observe } from 'mobx';
import GameStore from '../store/gameStore';

const titleEl = document.getElementById('ticket-title');
const progressBar = document.querySelector('#ticket-progress .progress__bar');
const barWidth = 200;
const msToFull = 10000;
let ticketProgress = 0;
let startingProgress = 0;

let startFrame;

observe(GameStore, 'mode', (change) => {
    if (change.type === 'update' && GameStore.mode === 'game') {
        // we're starting a new game
        startTicket();
    }
});

observe(GameStore, 'position', (change) => {
    if (change.type === 'update' && GameStore.mode === 'game') {
        // position changed
        if (GameStore.position === 'sit') {
            resumeTicket();
        }
        else {
            pauseTicket();
        }
    }
});

function makeProgress(currentFrame) {
    if (GameStore.mode !== 'game' || GameStore.position !== 'sit' || GameStore.lives <= 0) {
        // we've ended the game, so stop looping
        return;
    }

    const elapsed = startFrame ? (currentFrame - startFrame) : 0;
    if (!startFrame) {
        startFrame = currentFrame;
    }

    // calculate progress
    ticketProgress = easeOutCubic(elapsed, 0, 1, msToFull) + startingProgress; // add any previously paused status

    // update the progress bar to reflect the value
    let offsetX = 0;
    let scale = 1;
    if (ticketProgress < 1) {
        offsetX = (barWidth / -2) + ((ticketProgress * barWidth) / 2);
        scale = ticketProgress;
    }
    progressBar.style.transform = `translateX(${offsetX}px) scaleX(${scale})`;

    if (ticketProgress < 0.99) {
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
    startFrame = null;
    startingProgress = 0;
    window.requestAnimationFrame(makeProgress);
}

function pauseTicket() {
    // pause easing and record current progress so we can pick up from here later
    startFrame = null;
    startingProgress = ticketProgress;
}

function resumeTicket() {
    // resume progress
    window.requestAnimationFrame(makeProgress);
}

// easing function
function easeOutCubic(t, b, c, d) {
    // t: current time, b: begInnIng value, c: change In value, d: duration
    // source: https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
    return c*((t=t/d-1)*t*t + 1) + b;
}


// FOR DEBUGGING
window.stand = function() {
    GameStore.setPosition('stand');
}

window.sit = function () {
    GameStore.setPosition('sit');
}