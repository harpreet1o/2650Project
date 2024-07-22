import React from 'react';

export default function ChessBoard({ board }) {
 

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