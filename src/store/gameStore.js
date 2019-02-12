import { observable, action, decorate } from 'mobx';

class GameStore {
    constructor() {
        this.position = 'sit';
        this.frame = -1;
        this.loaded = false;
        this.mode = 'joke';
        this.tickets = 0;
        this.lives = 1;
    }

    setPosition(position, frame) {
        this.position = position;
        this.frame = frame;
    }

    setLoaded(loaded) {
        this.loaded = loaded;
    }

    setTickets(tickets) {
        this.tickets = tickets;
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
    position: observable,
    frame: observable,
    loaded: observable,
    mode: observable,
    tickets: observable,
    setPosition: action,
    setLoaded: action,
    setTickets: action,
    setLives: action,
    startGame: action,
    startJoke: action

});

const instance = new GameStore();
export default instance;
