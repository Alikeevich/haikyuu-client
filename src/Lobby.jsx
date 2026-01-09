import React, { useState } from 'react';

function Lobby({ socket, roomId, setRoomId }) {
    const [inputCode, setInputCode] = useState("");
    const [isCopied, setIsCopied] = useState(false);

    const createGame = () => {
        socket.emit('create_game');
    };

    const joinGame = () => {
        if (inputCode) {
            socket.emit('join_game', inputCode);
            setRoomId(inputCode);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(roomId);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    // --- ЕСЛИ КОМНАТА СОЗДАНА, ПОКАЗЫВАЕМ ЭКРАН ОЖИДАНИЯ ---
    if (roomId) {
        return (
            <div className="lobby-container">
                <h2>ОЖИДАНИЕ СОПЕРНИКА...</h2>
                <p>Сообщи этот код другу:</p>
                
                <div className="room-code-display" onClick={copyToClipboard}>
                    {roomId}
                </div>
                
                <button className="btn-secondary" onClick={copyToClipboard}>
                    {isCopied ? "СКОПИРОВАНО! ✅" : "КОПИРОВАТЬ КОД 📋"}
                </button>

                <div className="loader">
                    <div className="ball"></div>
                    <div className="ball"></div>
                    <div className="ball"></div>
                </div>
                <p style={{fontSize: '12px', color: '#888', marginTop: '20px'}}>
                    Как только второй игрок введет код, игра начнется автоматически.
                </p>
            </div>
        );
    }

    // --- ОБЫЧНЫЙ ЭКРАН ЛОББИ ---
    return (
        <div className="lobby-container">
            <h2>Haikyuu Tactics Online</h2>
            
            <div className="lobby-card">
                <h3>Создать новую игру</h3>
                <button className="btn-primary" onClick={createGame}>
                    СОЗДАТЬ КОМНАТУ
                </button>
            </div>

            <div className="divider">ИЛИ</div>

            <div className="lobby-card">
                <h3>Войти по коду</h3>
                <input 
                    type="text" 
                    placeholder="КОД КОМНАТЫ" 
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                />
                <button className="btn-secondary" onClick={joinGame}>
                    ПРИСОЕДИНИТЬСЯ
                </button>
            </div>
        </div>
    );
}

export default Lobby;