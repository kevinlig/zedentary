import { observe } from 'mobx';
import GameStore from '../store/gameStore';

const progressBar = document.querySelector('#life-progress .progress__bar');
const barWidth = 200;
const msToDeath = 30000;
let lifeRemaining = 1;

let lastFrame;

observe(GameStore, 'mode', (change) => {
    if (change.type === 'update' && GameStore.mode === 'game') {
        // we're starting a new game
        startLife();
    }
});

observe(GameStore, 'position', (change) => {
    if (change.type === 'update' && GameStore.mode === 'game') {
        // position changed
        if (GameStore.position === 'sit' && GameStore.lives > 0) {
            // resume life consumption
            resumeLife();
        }
    }
});

function consumeLife(currentFrame) {
    if (GameStore.mode !== 'game' || GameStore.position !== 'sit') {
        // we've ended the game, so stop looping
        return;
    }

    const sinceLastFrame = lastFrame ? (currentFrame - lastFrame) : 0;
    lastFrame = currentFrame;

    // calculate life consumed
    lifeRemaining = lifeRemaining - (sinceLastFrame / msToDeath);
    if (lifeRemaining <= 0) {
        lifeRemaining = 0;
    }

    // update the progress bar to reflect the value
    let offsetX = 0;
    let scale = 1;
    if (lifeRemaining >= 0) {
        scale = lifeRemaining;
        offsetX = ((lifeRemaining * barWidth) / 2) + ((0.5 - lifeRemaining) * barWidth);
    }
    progressBar.style.transform = `translateX(${offsetX}px) scaleX(${scale})`;

    if (lifeRemaining > 0) {
        // register the next update
        window.requestAnimationFrame(consumeLife);
    }
    else {
        endLife();
    }
}

function startLife() {
    lifeRemaining = 1;
    lastFrame = null;
    window.requestAnimationFrame(consumeLife);
}

function resumeLife() {
    lastFrame = null;
    window.requestAnimationFrame(consumeLife);
}

function endLife() {
    GameStore.setLives(0);
}
