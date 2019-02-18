import { observe } from 'mobx';
import GameStore from '../store/gameStore';

const icons = {
    game: 'ion-logo-game-controller-b',
    joke: 'ion-ios-body'
};

const button = document.getElementById('switcher');
const gameElements = document.querySelectorAll('.game');

// set the button icon based on the current game mode
observe(GameStore, 'mode', (change) => {
    if (change.type === 'update') {
        setIcon();
        gameElements.forEach(toggleStatus);
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

function toggleStatus(el) {
    const mode = GameStore.mode;
    if (mode === 'joke') {
        el.classList.add('hide');
    }
    else {
        el.classList.remove('hide');
    }
}

setIcon();
gameElements.forEach(toggleStatus);
