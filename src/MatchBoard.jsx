import React, { useEffect, useRef, useState } from 'react';

function MatchBoard({ myTeam, enemyTeam, myId, turn, score, onServe, gameLog, phase, ballTarget, onSet, onBlock }) {
    
    const isMyTurn = turn === myId;
    const scrollRef = useRef(null);
    const [ballPosition, setBallPosition] = useState({ top: '50%', left: '50%', opacity: 0 });
    const [isAnimating, setIsAnimating] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [ballInFlight, setBallInFlight] = useState(false); // Для анимации полета

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [gameLog]);

    // ⚡ УЛУЧШЕННАЯ АНИМАЦИЯ МЯЧА С ПОЛЕТОМ
    useEffect(() => {
        const animateBall = async () => {
            setIsAnimating(true);
            
            if (phase === 'SERVE') {
                // Мяч у подающего
                await setBallToPosition(isMyTurn ? 'my-serve' : 'enemy-serve');
                await delay(500);
            } 
            else if (phase === 'SET') {
                // Мяч летит к связующему
                setBallInFlight(true);
                await setBallToPosition('center');
                await delay(400);
                setBallInFlight(false);
                
                // ✅ ИСПРАВЛЕНО: Учитываем ballTarget для правильной позиции
                if (ballTarget === 3) {
                    // Пайп - мяч летит на заднюю линию
                    await setBallToPosition(isMyTurn ? 'my-pipe' : 'enemy-pipe');
                } else {
                    await setBallToPosition(isMyTurn ? 'my-set' : 'enemy-set');
                }
                await delay(600);
            }
            else if (phase === 'BLOCK') {
                // Мяч летит через сетку с вращением
                setBallInFlight(true);
                await setBallToPosition('mid-air-attack');
                await delay(300);
                await setBallToPosition('net');
                await delay(300);
                setBallInFlight(false);
            }
            
            setIsAnimating(false);
        };

        animateBall();
    }, [phase, isMyTurn, ballTarget]); // ✅ Добавлена зависимость от ballTarget

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const setBallToPosition = (position) => {
        return new Promise(resolve => {
            const positions = {
                'my-serve': { bottom: '12%', left: '80%', top: 'auto', opacity: 1, transform: 'scale(1)' },
                'enemy-serve': { top: '12%', left: '20%', bottom: 'auto', opacity: 1, transform: 'scale(1)' },
                'my-set': { bottom: '36%', left: '50%', top: 'auto', opacity: 1, transform: 'scale(1)' },
                'enemy-set': { top: '36%', left: '50%', bottom: 'auto', opacity: 1, transform: 'scale(1)' },
                'center': { top: '50%', left: '50%', bottom: 'auto', opacity: 1, transform: 'scale(1.1)' },
                'mid-air-attack': { top: '40%', left: '50%', bottom: 'auto', opacity: 1, transform: 'scale(1.2) rotate(180deg)' },
                'net': { top: '48%', left: '50%', bottom: 'auto', opacity: 1, transform: 'scale(1.4) rotate(360deg)' },
                // ✅ НОВОЕ: Позиции для пайпа
                'my-pipe': { bottom: '12%', left: '50%', top: 'auto', opacity: 1, transform: 'scale(1.1)' },
                'enemy-pipe': { top: '12%', left: '50%', bottom: 'auto', opacity: 1, transform: 'scale(1.1)' }
            };
            
            setBallPosition(positions[position] || { opacity: 0, transform: 'scale(1)' });
            setTimeout(resolve, 100);
        });
    };

    const togglePlayerInfo = (player, e) => {
        e?.stopPropagation();
        if (selectedPlayer?.id === player.id) {
            setSelectedPlayer(null);
        } else {
            setSelectedPlayer(player);
        }
    };

    // Закрыть тултип при клике вне карточки
    useEffect(() => {
        const handleClickOutside = () => {
            if (selectedPlayer) setSelectedPlayer(null);
        };
        
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [selectedPlayer]);

    const renderPlayer = (player, isEnemy) => {
        const hasImg = player.img && player.img.length > 5;
        const isSelected = selectedPlayer?.id === player.id;

        return (
            <div 
                key={player.position} 
                className={`player-card pos-${player.position} ${isEnemy ? 'enemy-card' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={(e) => togglePlayerInfo(player, e)}
            >
                <div className="card-photo-container">
                    {hasImg ? (
                        <img src={player.img} alt={player.name} onError={(e) => e.target.style.display = 'none'} />
                    ) : (
                        <div style={{fontSize:'30px', display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}>
                            {player.img}
                        </div>
                    )}
                </div>
                
                <div className="card-info">
                    <div className="card-name">{player.name.split(' ')[0]}</div>
                </div>

                {/* ТУЛТИП */}
                {(isSelected || window.innerWidth > 768) && (
                    <div className={`quirk-tooltip ${isSelected ? 'mobile-active' : ''}`}>
                        <div className="tooltip-header">{player.name}</div>
                        <div className="tooltip-team">{player.team}</div>
                        <div className="tooltip-stats">
                            <div className="tooltip-stat">
                                <span className="stat-icon">⚔️</span>
                                <span className="stat-label">Атака</span>
                                <span className="stat-value">{player.stats.power}</span>
                            </div>
                            <div className="tooltip-stat">
                                <span className="stat-icon">🛡️</span>
                                <span className="stat-label">Прием</span>
                                <span className="stat-value">{player.stats.receive}</span>
                            </div>
                            <div className="tooltip-stat">
                                <span className="stat-icon">✋</span>
                                <span className="stat-label">Блок</span>
                                <span className="stat-value">{player.stats.block}</span>
                            </div>
                        </div>
                        {player.quirk && (
                            <div className="tooltip-quirk">
                                <div className="quirk-title">★ {player.quirk.name}</div>
                                <div className="quirk-description">{player.quirk.desc}</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderLogLine = (line, index) => {
        let className = "log-entry";
        if (line.includes("ЭЙС") || line.includes("ГОЛ")) className += " log-goal";
        else if (line.includes("Квирк") || line.includes("+") || line.includes("ВЖУХ") || line.includes("★")) className += " log-quirk";
        return <div key={index} className={className}>{line}</div>;
    };

    return (
        <div className="match-container">
            <div className="score-board">
                <div className="team-score">
                    <span>ВРАГИ</span>
                    <strong>{score?.team2 || 0}</strong>
                </div>
                <div className="vs">VS</div>
                <div className="team-score">
                    <strong>{score?.team1 || 0}</strong>
                    <span>МЫ</span>
                </div>
            </div>
            
            <div className="status-bar">
                {isMyTurn 
                    ? (phase === 'SERVE' ? "⚡ ТВОЯ ПОДАЧА" : phase === 'SET' ? "🎯 ВЫБЕРИ АТАКУ" : "🛡️ СТАВЬ БЛОК") 
                    : "⏳ ХОД СОПЕРНИКА"}
            </div>

            <div className="board-wrapper">
                <div className="enemy-team">
                    {enemyTeam.map(p => renderPlayer(p, true))}
                </div>

                <div className="net-separator"></div>

                {/* МЯЧ С УЛУЧШЕННОЙ АНИМАЦИЕЙ */}
                <div 
                    className={`volleyball-ball ${ballInFlight ? 'in-flight' : ''}`}
                    style={{
                        ...ballPosition,
                        transition: ballInFlight 
                            ? 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' 
                            : 'all 0.6s ease-out'
                    }}
                ></div>

                <div className="my-team">
                    {myTeam.map(p => renderPlayer(p, false))}
                </div>
            </div>

            <div className="controls">
               {isMyTurn && phase === 'SERVE' && !isAnimating && (
                   <button className="action-btn" onClick={onServe}>ПОДАТЬ 🏐</button>
               )}
               {isMyTurn && phase === 'SET' && !isAnimating && (
                   <div className="set-controls">
                       <button className="set-btn" onClick={() => onSet(4)}>⬅️ ЛЕВО</button>
                       <button className="set-btn" onClick={() => onSet(3)}>⬆️ ПАЙП</button>
                       <button className="set-btn" onClick={() => onSet(2)}>ПРАВО ➡️</button>
                   </div>
               )}
               {isMyTurn && phase === 'BLOCK' && !isAnimating && (
                   <div className="set-controls">
                       <button className="set-btn block-btn" onClick={() => onBlock(4)}>✋ ЛЕВО</button>
                       <button className="set-btn block-btn" onClick={() => onBlock(3)}>✋ ЦЕНТР</button>
                       <button className="set-btn block-btn" onClick={() => onBlock(2)}>✋ ПРАВО</button>
                   </div>
               )}
               {isAnimating && (
                   <div className="animating-indicator">
                       <div className="ball"></div>
                       <div className="ball"></div>
                       <div className="ball"></div>
                   </div>
               )}
            </div>

            <div className="commentator-box" ref={scrollRef}>
                {gameLog.split(/\||\n/).filter(l => l.trim()).map((line, i) => renderLogLine(line.trim(), i))}
            </div>
        </div>
    );
}

export default MatchBoard;