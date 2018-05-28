import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware} from "redux";
import createSocketIoMiddleware from 'redux-socket.io';
import { Provider } from 'react-redux';
import App from './containers/App.container';

import appReducer from './redux/App.reducer';
import io from 'socket.io-client';

let socket = io('http://localhost:3010');

let socketIoMiddleware = createSocketIoMiddleware(socket, "server/");

const store = applyMiddleware(socketIoMiddleware)(createStore)(appReducer);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);