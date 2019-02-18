import React from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react';
import ControllerStore from './store/controllerStore';

import Training from './training/Training.jsx';
import Controller from './controller/Controller.jsx';

const container = document.getElementById('controller-app');

const App = observer(({ store }) => {
    if (store.mode === 'training') {
        return (
            <Training />
        );
    }
    return (
        <Controller store={store} />
    );
});

ReactDOM.render(
    <App store={ControllerStore} />,
    container
);
