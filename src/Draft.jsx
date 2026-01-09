import React, { useState, useEffect } from 'react';

const POSITIONS = [
    { id: 1, name: "ПОДАЧА (Pos 1)", role: "SERVE" },
    { id: 2, name: "СЕТКА ПРАВО (Pos 2)", role: "BLOCK" },
    { id: 3, name: "СЕТКА ЦЕНТР (Pos 3)", role: "BLOCK" },
    { id: 4, name: "СЕТКА ЛЕВО (Pos 4)", role: "SPIKE" },
    { id: 5, name: "ЗАЩИТА ЛЕВО (Pos 5)", role: "DEF" },
    { id: 6, name: "ЗАЩИТА ЦЕНТР (Pos 6)", role: "DEF" },
];

function Draft({ socket, roomId, allCharacters }) {
    const [currentSlot, setCurrentSlot] = useState(0); 
    const [myTeam, setMyTeam] = useState([]); 
    const [options, setOptions] = useState([]); 
    const [waiting, setWaiting] = useState(false);
    const [bannedIds, setBannedIds] = useState([]);
    const [hoveredChar, setHoveredChar] = useState(null); // Для показа статов

    useEffect(() => {
        const handleBannedChars = (ids) => {
            setBannedIds(ids);
        };

        socket.on('banned_characters', handleBannedChars);

        return () => {
            socket.off('banned_characters', handleBannedChars);
        };
    }, [socket]);

    const generateOptions = () => {
        const chosenIds = myTeam.map(p => p.id);
        const excludedIds = [...chosenIds, ...bannedIds];
        const pool = allCharacters.filter(c => !excludedIds.includes(c.id));
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    };

    useEffect(() => {
        if (currentSlot < 6) {
            setOptions(generateOptions());
        } else {
            finishDraft();
        }
    }, [currentSlot, bannedIds]);

    const selectPlayer = (char) => {
        const newPlayer = { ...char, position: POSITIONS[currentSlot].id };
        const updatedTeam = [...myTeam, newPlayer];
        setMyTeam(updatedTeam);
        
        socket.emit('character_picked', { roomId, charId: char.id });
        
        setCurrentSlot(currentSlot + 1); 
        setHoveredChar(null); // Убираем подсветку
    };

    const finishDraft = () => {
        setWaiting(true);
        socket.emit('team_ready', { roomId, team: myTeam });
    };

    const renderImg = (char) => {
        if (char.img && char.img.length > 5) {
            return <img src={char.img} alt={char.name} onError={(e) => e.target.style.display = 'none'} />;
        }
        return <div className="emoji-draft">{char.img}</div>;
    };

    if (waiting) {
        return (
            <div className="draft-container waiting-mode">
                <h2>КОМАНДА СОБРАНА!</h2>
                <div className="loader">
                    <div className="ball"></div>
                    <div className="ball"></div>
                    <div className="ball"></div>
                </div>
                <p>Ожидание соперника...</p>
                <div className="roster-preview">
                    {myTeam.map((p) => (
                        <div key={p.position} className="roster-item">
                            <span className="pos-num">#{p.position}</span>
                            <span className="p-name">{p.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="draft-container">
            <div className="draft-header">
                <h2>ВЫБОР ИГРОКА</h2>
                <div className="draft-subtitle">
                    Слот {currentSlot + 1}/6: <span className="highlight">{POSITIONS[currentSlot]?.name}</span>
                </div>
            </div>

            {/* Карточки на выбор */}
            <div className="draft-cards-wrapper">
                {options.map((char) => {
                    const isBanned = bannedIds.includes(char.id);
                    return (
                        <div 
                            key={char.id} 
                            className={`draft-card-big ${hoveredChar?.id === char.id ? 'hovered' : ''} ${isBanned ? 'banned' : ''}`}
                            onClick={() => !isBanned && selectPlayer(char)}
                            onMouseEnter={() => !isBanned && setHoveredChar(char)}
                            onMouseLeave={() => setHoveredChar(null)}
                            style={{ cursor: isBanned ? 'not-allowed' : 'pointer' }}
                        >
                            {isBanned && <div className="banned-overlay">ЗАНЯТ</div>}
                            <div className="draft-photo">
                                {renderImg(char)}
                            </div>
                            <div className="draft-info">
                                <div className="draft-name">{char.name}</div>
                                <div className="draft-team">{char.team}</div>
                                
                                <div className="draft-stats-full">
                                    <div className="stat-item">
                                        <span className="stat-icon">⚔️</span>
                                        <span className="stat-value">{char.stats.power}</span>
                                        <span className="stat-label">PWR</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-icon">🛡️</span>
                                        <span className="stat-value">{char.stats.receive}</span>
                                        <span className="stat-label">RCV</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-icon">✋</span>
                                        <span className="stat-value">{char.stats.block}</span>
                                        <span className="stat-label">BLK</span>
                                    </div>
                                </div>
                                
                                {char.quirk && (
                                    <div className="draft-quirk-box">
                                        <div className="quirk-name">★ {char.quirk.name}</div>
                                        <div className="quirk-desc">{char.quirk.desc}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Список уже выбранных */}
            <div className="draft-footer">
                <h3>ВАШ СОСТАВ:</h3>
                <div className="mini-roster">
                    {myTeam.map((p) => (
                        <div key={p.position} className="mini-token" title={p.name}>
                            {renderImg(p)}
                        </div>
                    ))}
                    {[...Array(6 - myTeam.length)].map((_, i) => (
                        <div key={i} className="mini-token empty">?</div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Draft;