import Game from './game/index';
import './ui/index';
import './css/style.css';

const canvas = document.getElementById('render');
Game.start(canvas);
