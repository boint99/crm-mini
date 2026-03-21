import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from "react-redux";
import './index.css'
import 'react-toastify/dist/ReactToastify.css'
import App from './App.jsx'
import { store } from './redux/store'
import { ToastContainer } from 'react-toastify';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store={store}>
       <ToastContainer position="top-right" autoClose={3000} />
      <App />
    </Provider>
  </BrowserRouter>
)
