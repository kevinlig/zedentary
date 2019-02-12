import { Engine, Animation } from 'babylonjs';
import './initLoaders';

class GameEngine {
    constructor() {
        this.engine = null;
        this._canvas = null;
    }

    start(canvas) {
        this._canvas = canvas;
        this.engine = new Engine(canvas, true);

        // enable retina
        const devicePixelRatio = window.devicePixelRatio || 1.0;
        this.engine.setHardwareScalingLevel(1 / devicePixelRatio);
    }
}

const instance = new GameEngine();
export default instance;
