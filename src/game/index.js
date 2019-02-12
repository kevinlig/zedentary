import GameEngine from './engine';
import OfficeScene from './scene';
import GameStore from '../store/gameStore';

const endpoint = process.env.APP_ENDPOINT;

class Game {
    constructor() {
        this._canvas = null;
        this.scene = null;
    }

    start(canvas) {
        this._canvas = canvas;
         // start the game engine
        GameEngine.start(canvas);
        // build out the first scene
        this.store = GameStore;
        this.scene = new OfficeScene(this.store);

        // setup websockets
        this.setupWebsocket();

        window.addEventListener('resize', function() {
            GameEngine.engine.resize();
        });

        this.run();
    }

    setupWebsocket() {
        if (!endpoint) {
            return;
        }

        this.socket = new WebSocket(endpoint);
        this.socket.onopen = (e) => {
            console.log('Connected to server');
        };

        this.socket.onmessage = (e) => {
            const data = e && e.data && e.data.split('|');
            const action = data && data.length === 2 && data[0];
            const frame = data && data.length === 2 && parseInt(data[1], 10);

            const lastFrame = this.store.frame;
            const lastAction = this.store.position;

            if (action && frame && frame > lastFrame && action !== lastAction) {
                this.store.setPosition(action, frame);
            }
        };

        this.socket.onclose = (e) => {
            console.log('Connection closed');
        };
    }

    run() {
        GameEngine.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }
}

const instance = new Game();
export default instance;
