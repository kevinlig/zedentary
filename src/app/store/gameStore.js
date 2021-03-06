import uuid from 'uuid/v4';
import { observable, action, decorate } from 'mobx';

class GameStore {
    constructor() {
        this.session = uuid();
        this.position = 'sit';
        this.frame = -1;
        this.loaded = false;
        this.mode = 'joke';
        this.tickets = 0;
        this.lives = 1;
    }

    setPosition(position, frame) {
        this.position = position;
        if (frame) {
            this.frame = frame;
        }
    }

    setLoaded(loaded) {
        this.loaded = loaded;
    }

    addTicket() {
        this.tickets++;
    }

    setLives(lives) {
        this.lives = lives;
    }

    startGame() {
        this.mode = 'game';
        this.tickets = 0;
        this.lives = 1;
    }

    startJoke() {
        this.mode = 'joke';
    }
}

decorate(GameStore, {
    session: observable,
    position: observable,
    frame: observable,
    loaded: observable,
    mode: observable,
    tickets: observable,
    lives: observable,
    setPosition: action,
    setLoaded: action,
    addTicket: action,
    setLives: action,
    startGame: action,
    startJoke: action
});

const instance = new GameStore();
export default instance;
