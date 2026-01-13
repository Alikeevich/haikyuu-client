import React, { useState } from 'react';
import AISelector from './AISelector';
import TournamentSelector from './TournamentSelector';

function Lobby({ socket, roomId, setRoomId }) {
    const [inputCode, setInputCode] = useState("");
    const [isCopied, setIsCopied] = useState(false);
    const [showAISelector, setShowAISelector] = useState(false);
    const [showTournamentSelector, setShowTournamentSelector] = useState(false);

    const createGame = () => {
        socket.emit('create_game');
    };

    const createAIGame = (aiType) => {
        socket.emit('create_ai_game', { aiType });
    };

    const createTournament = () => {
        socket.emit('create_tournament', {});
        setShowTournamentSelector(false);
    };

    const joinGame = () => {
        if (inputCode) {
            socket.emit('join_game', inputCode);
            setRoomId(inputCode);
        }
    };

    const copyToClipboard = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(roomId);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = roomId;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    // --- СЕЛЕКТОР ТУРНИРА ---
    if (showTournamentSelector) {
        return (
            <TournamentSelector 
                onStart={createTournament}
                onBack={() => setShowTournamentSelector(false)}
            />
        );
    }

    // --- СЕЛЕКТОР ИИ ---
    if (showAISelector) {
        return (
            <AISelector 
                onSelect={(aiType) => {
                    createAIGame(aiType);
                    setShowAISelector(false);
                }}
                onBack={() => setShowAISelector(false)}
            />
        );
    }

    // --- ЭКРАН ОЖИДАНИЯ (Room Created) ---
    if (roomId && !roomId.startsWith('AI-') && !roomId.startsWith('TOUR-')) {
        return (
            <div className="lobby-container lobby-waiting">
                <div className="lobby-header">
                    <h2>ОЖИДАНИЕ...</h2>
                    <p className="subtitle">Отправь код другу</p>
                </div>
                
                <div className="code-box">
                    <div className="room-code-display" onClick={copyToClipboard}>
                        {roomId}
                    </div>
                    <button className={`btn-copy ${isCopied ? 'copied' : ''}`} onClick={copyToClipboard}>
                        {isCopied ? "СКОПИРОВАНО! ✅" : "КОПИРОВАТЬ"}
                    </button>
                </div>

                <div className="loader-container">
                    <div className="loader">
                        <div className="ball"></div>
                        <div className="ball"></div>
                        <div className="ball"></div>
                    </div>
                    <p className="hint">Игра начнется автоматически, когда соперник введет код.</p>
                </div>
            </div>
        );
    }

    // --- ГЛАВНОЕ МЕНЮ ---
    return (
        <div className="lobby-container">
            <div className="lobby-header">
                <h1>HAIKYUU TACTICS</h1>
                <p className="subtitle">Волейбольная битва</p>
            </div>
            
            <div className="lobby-menu">
                {/* 1. ТУРНИР */}
                <div className="lobby-card featured tournament-card">
                    <div className="card-content">
                        <h3>ТУРНИР</h3>
                        <p>Вызовите всех ИИ подряд</p>
                    </div>
                    <button className="btn-tournament" onClick={() => setShowTournamentSelector(true)}>
                        ТУРНИР 🏆
                    </button>
                </div>

                {/* 2. ТРЕНИРОВКА */}
                <div className="lobby-card featured">
                    <div className="card-content">
                        <h3>ТРЕНИРОВКА</h3>
                        <p>Выбери ИИ противника</p>
                    </div>
                    <button className="btn-ai" onClick={() => setShowAISelector(true)}>
                        ИГРАТЬ VS AI 🤖
                    </button>
                </div>

                <div className="divider"><span>PvP РЕЖИМ</span></div>

                {/* 3. СОЗДАТЬ ИГРУ */}
                <div className="lobby-card">
                    <button className="btn-primary full-width" onClick={createGame}>
                        СОЗДАТЬ КОМНАТУ 🏠
                    </button>
                </div>

                {/* 4. ВОЙТИ ПО КОДУ */}
                <div className="lobby-card join-card">
                    <input 
                        type="text" 
                        placeholder="ВВЕДИ КОД КОМНАТЫ" 
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                        className="input-code"
                    />
                    <button className="btn-secondary full-width" onClick={joinGame} disabled={!inputCode}>
                        ВОЙТИ ▶
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Lobby;