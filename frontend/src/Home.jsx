import { useEffect, useState, useCallback, useContext } from "react";
import Container from "@mui/material/Container";
import Game from "./Game";
import InitGame from "./InitGame";
import CustomDialog from "./components/CustomDialog";
import socket from "./socket";
import { UserContext } from './context/UserContext';

const Home = () => {
    const { user, setUser } = useContext(UserContext);

    const [room, setRoom] = useState("");
    const [orientation, setOrientation] = useState("");
    const [players, setPlayers] = useState([]);

    // resets the states responsible for initializing a game
    const cleanup = useCallback(() => {
        setRoom("");
        setOrientation("");
        setPlayers("");
    }, []);

    useEffect(() => {
        // const username = prompt("Username");
        // setUsername(username);
        // socket.emit("username", username);


        socket.on("opponentJoined", (roomData) => {
            console.log("roomData", roomData)
            setPlayers(roomData.players);
        });
    }, []);

    return (
        <Container>
            
            {room ? (
                <Game
                    room={room}
                    orientation={orientation}
                    username={user ? user : "Guest"}
                    players={players}
                    // the cleanup function will be used by Game to reset the state when a game is over
                    cleanup={cleanup}
                />
            ) : (
                <InitGame
                    setRoom={setRoom}
                    setOrientation={setOrientation}
                    setPlayers={setPlayers}
                />
            )}
        </Container>
    )
}

export default Home
