import Game from './game/index';
import './ui/index';
import '../css/app/app.css';

const canvas = document.getElementById('render');
Game.start(canvas);
