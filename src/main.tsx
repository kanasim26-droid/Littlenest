import {createRoot} from 'react-dom/client';
import './services/shopify-bridge';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
