import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import Home from "./Home";
import ProfilePage from './pages/ProfilePage';
import GameDetails from './components/GameDetails';


export default function App() {
 
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/game/:gameId" element={<GameDetails />} />
      </Routes>
    </Router>
  )
}


