import React, { useContext } from 'react';
import axios from 'axios';
import { UserContext } from './context/UserContext';

export default function ChessBoard({ board }) {
  const { user, setUser } = useContext(UserContext);

  const logout = async () => {
    try {
      await axios.get('http://localhost:3000/logout', { withCredentials: true });
      setUser(null);
      window.location.href = 'http://localhost:5173';
    } catch (err) {
      console.error(err.response.data);
    }
  };


  console.log(board);

  const getPieceUnicode = (piece) => {
    const unicodePieces = {
      p: '♙',
      r: '♜',
      n: '♞',
      b: '♝',
      q: '♛',
      k: '♚',
      P: '♙',
      R: '♖',
      N: '♘',
      B: '♗',
      Q: '♕',
      K: '♔',
    };

    return piece ? unicodePieces[piece.type] : '';

  };


  return (
    <div>
       {user ? (
        <div>
          <p>Welcome, {user.name}</p>
          {user.picture && <img src={user.picture} alt={user.name} />}
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <p>Guest User</p>
      )}
      <div className="grid grid-cols-8 grid-rows-8 gap-0 border-2 border-gray-800 w-80 h-80">
        {board.map((row, rowIndex) =>
          row.map((square, squareIndex) => {
            console.log(square)
            return (

              <div
                key={(rowIndex + 1) + (squareIndex + 1)}
                className={`w-full h-full flex items-center justify-center ${(rowIndex + squareIndex) % 2 === 0 ? "bg-green-400" : "bg-green-800"}`}
              >
                <span className={`text-2xl ${square && square.color === "w" ? "text-white" : "text-black"}`}>
                  {/* here if we have a piece then square has property color,square and type if no piece we send null and get null */}
                  {getPieceUnicode(square)}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
}