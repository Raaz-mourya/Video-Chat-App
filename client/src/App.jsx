import { Routes, Route } from "react-router-dom";

import './App.css'
import LobbyScreen from "./views/Lobby";
import RoomPage from "./views/Room";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={ <LobbyScreen /> } />
        <Route path="/room/:roomid" element={ <RoomPage /> } />
      </Routes>
   </div>
  )
}

export default App
