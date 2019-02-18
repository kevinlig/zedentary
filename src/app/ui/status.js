import { autorun } from 'mobx';
import GameStore from '../store/gameStore';

const status = document.getElementById('status');
const ticketsList = document.getElementById('tickets-list');
const livesList = document.getElementById('lives-list');

const statuses = {
    ticket: {
        host: ticketsList,
        els: [],
        icon: 'checkbox'
    },
    life: {
        host: livesList,
        els: [],
        icon: 'heart'
    }
}

function makeIcon(type) {
    const el = document.createElement('li');
    el.classList.add(`ion-ios-${type}`);
    return el;
}

function populateStatus(type, value) {
    const config = statuses[type];
    const elArr = config.els;
    if (elArr.length > value) {
        elArr.forEach((item) => {
            item.remove();
        });
        config.els = [];
    }

    const toCreate = value - config.els.length;
    if (toCreate > 0) {
        for (let i = 0; i < toCreate; i++) {
            const el = makeIcon(config.icon);
            config.els.push(el);
            config.host.appendChild(el);
        }
    }
}

function populateLives() {
    const lives = GameStore.lives;
    populateStatus('life', lives);
}

function populateTickets() {
    const tickets = GameStore.tickets;
    populateStatus('ticket', tickets);
}

autorun(() => {
    populateTickets();
    populateLives();
});