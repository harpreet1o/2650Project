import { Button, Stack, TextField } from "@mui/material";
import { useState } from "react";
import CustomDialog from "./components/CustomDialog";
import socket from './socket';

export default function InitGame({ setRoom, setOrientation, setPlayers }) {
    const [roomDialogOpen, setRoomDialogOpen] = useState(false);
    const [roomInput, setRoomInput] = useState('');
    const [roomError, setRoomError] = useState('');

    const handleCreateRoom = () => {
        socket.emit("createRoom", (response) => {
            console.log(response);
            setRoom(response);
            setOrientation("white");
        });
    };

    const handleJoinRoom = () => {
        if (!roomInput) {
            setRoomError('Room ID cannot be empty.');
            return;
        }
        socket.emit("joinRoom", { roomId: roomInput }, (response) => {
            if (response.error) {
                setRoomError(response.message);
                return;
            }
            console.log("response:", response);
            setRoom(response.roomId);
            setPlayers(response.players);
            setOrientation("black");
            setRoomDialogOpen(false);
        });
    };

    const handleJoinRandomRoom = () => {
        socket.emit("getAvailableRooms", (availableRooms) => {
            if (availableRooms.length === 0) {
                setRoomError('No available rooms found.');
                return;
            }
            const randomRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];
            socket.emit("joinRoom", { roomId: randomRoom }, (response) => {
                if (response.error) {
                    setRoomError(response.message);
                    return;
                }
                console.log("response:", response);
                setRoom(response.roomId);
                setPlayers(response.players);
                setOrientation("black");
            });
        });
    };

    return (
        <Stack
            justifyContent="center"
            alignItems="center"
            sx={{ py: 1, height: "100vh" }}
        >
            <CustomDialog
                open={roomDialogOpen}
                handleClose={() => setRoomDialogOpen(false)}
                title="Select Room to Join"
                contentText="Enter a valid room ID to join the room"
                handleContinue={handleJoinRoom}
            >
                <TextField
                    autoFocus
                    margin="dense"
                    id="room"
                    label="Room ID"
                    name="room"
                    value={roomInput}
                    required
                    onChange={(e) => {
                        setRoomInput(e.target.value);
                        if (roomError) setRoomError('');
                    }}
                    type="text"
                    fullWidth
                    variant="standard"
                    error={Boolean(roomError)}
                    helperText={!roomError ? 'Enter a room ID' : `Invalid room ID: ${roomError}`}
                />
            </CustomDialog>
            <Button
                variant="contained"
                onClick={handleCreateRoom}
            >
                Start a game
            </Button>
            <Button
                onClick={handleJoinRandomRoom}
            >
                Quick Match
            </Button>
            {/* Button for joining a specific game room */}
            <Button
                onClick={() => {
                    setRoomDialogOpen(true)
                }}
            >
                play with friend
            </Button>
        </Stack>
    );
}
