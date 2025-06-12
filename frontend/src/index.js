import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {store} from "./API/store"
import { Provider } from 'react-redux';
import { UserContextProvider } from './ContextState/contextState'
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <UserContextProvider>
  <Provider store={store}>
<App/>
  </Provider>
  </UserContextProvider>
);




