import { observe } from 'mobx';
import GameStore from '../store/gameStore';

const icons = {
    game: 'ion-logo-game-controller-b',
    joke: 'ion-ios-body'
};

const button = document.getElementById('switcher');
const status = document.getElementById('status');

// set the button icon based on the current game mode
observe(GameStore, 'mode', (change) => {
    if (change.type === 'update') {
        setIcon();
        toggleStatus();
    }
});

// add a click event to the button
button.addEventListener('click', () => {
    const currentMode = GameStore.mode;
    if (currentMode === 'joke') {
        GameStore.startGame();
    }
    else {
        GameStore.startJoke();
    }
});

function setIcon() {
    const currentMode = GameStore.mode;
    const availableMode = currentMode === 'joke' ? 'game' : 'joke';
    if (button.classList.contains(icons[currentMode])) {
        button.classList.replace(icons[currentMode], icons[availableMode]);
    }
    else {
        button.classList.add(icons[availableMode]);
    }
}

function toggleStatus() {
    const mode = GameStore.mode;
    if (mode === 'joke') {
        status.classList.add('hide');
    }
    else {
        status.classList.remove('hide');
    }
}

setIcon();
toggleStatus();
