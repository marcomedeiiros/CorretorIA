import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Correcao from './views/Correcao/index.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Correcao />} />        
      </Routes>
    </BrowserRouter> 
  );
}

export default App;