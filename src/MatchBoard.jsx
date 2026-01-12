import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
// ИМПОРТЫ ВИЗУАЛА
import Debris from './Effects';
import SpeedLines from './SpeedLines';
import BallManager from './components/BallManager';
import CheatLayer from './components/CheatLayer';

function MatchBoard({ 
    myTeam, 
    enemyTeam, 
    myId, 
    turn, 
    score, 
    onServe, 
    gameLog, 
    phase, 
    lastAction, 
    onSet, 
    onBlock, 
    triggerShake, 
    myTeamIndex, 
    triggerLegendary,
    isActionPending
}) {

    const isMyTurn = turn === myId;
    const scrollRef = useRef(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    // --- ЛОГИКА СЧЕТА ---
    const myScore = (myTeamIndex === 2) ? (score?.team2 || 0) : (score?.team1 || 0);
    const enemyScore = (myTeamIndex === 2) ? (score?.team1 || 0) : (score?.team2 || 0);

    // Автоскролл лога
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, [gameLog]);

    // --- РЕНДЕР ИГРОКОВ ---
    const togglePlayerInfo = (player, e) => {
        e?.stopPropagation();
        // Если кликнули по тому же, закрываем, иначе открываем нового
        setSelectedPlayer(selectedPlayer?.id === player.id ? null : player);
    };

    const renderPlayer = (player, isEnemy) => {
        const hasImg = player.img && player.img.length > 5;
        const isSelected = selectedPlayer?.id === player.id;
        
        // Логика Z-Index: 
        // Враги (сверху): Передняя линия (ближе к центру) должна перекрывать заднюю.
        // Мы (снизу): Задняя линия (ближе к низу экрана) должна перекрывать переднюю (визуально "ближе" к камере).
        const isFrontRow = player.position >= 2 && player.position <= 4;
        const zIndexVal = isEnemy 
            ? (isFrontRow ? 15 : 10)  // Враги: передние выше
            : (isFrontRow ? 10 : 15); // Мы: задние выше (ближе к зрителю)

        return (
            <motion.div 
                key={player.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                
                // --- ИСПРАВЛЕНИЕ: Все классы и обработчики здесь, без вложенного дубликата ---
                className={`player-card pos-${player.position} ${isEnemy ? 'enemy-card' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={(e) => togglePlayerInfo(player, e)}
                style={{
                    zIndex: zIndexVal
                }}
            >
                <div className="card-photo-container">
                    {hasImg ? (
                        <img 
                            src={player.img} 
                            alt={player.name} 
                            onError={(e) => e.target.style.display = 'none'} 
                        />
                    ) : (
                        <div style={{fontSize:'24px', display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}>
                            {player.img}
                        </div>
                    )}
                </div>
                
                <div className="card-info">
                    <div className="card-name">{player.name.split(' ')[0]}</div>
                </div>

                {isSelected && (
                    <div className="quirk-tooltip mobile-active">
                        <div className="tooltip-header">{player.name}</div>
                        <div className="tooltip-stats">
                            <div className="tooltip-stat">⚔️ {player.stats.power} 🛡️ {player.stats.receive} ✋ {player.stats.block}</div>
                        </div>
                        {player.quirk && (
                            <div className="tooltip-quirk">
                                <div className="quirk-title">★ {player.quirk.name}</div>
                                <div className="quirk-description">{player.quirk.desc}</div>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        );
    };

    const renderLogLine = (line, index) => {
        let className = "log-entry";
        if (line.includes("ЭЙС") || line.includes("ГОЛ") || line.includes("KILL")) className += " log-goal";
        else if (line.includes("Квирк") || line.includes("★") || line.includes("Бонус")) className += " log-quirk";
        return <div key={index} className={className}>{line}</div>;
    };

    const showSpeedLines = triggerShake || triggerLegendary;

    return (
        <div className={`match-container ${triggerShake ? 'shake-hard' : ''} ${triggerLegendary ? 'manga-impact' : ''}`} onClick={() => setSelectedPlayer(null)}>
            <SpeedLines isActive={showSpeedLines} />
            
            {triggerShake && (
                <>
                    <div className="impact-flash"></div>
                    <Debris />
                </>
            )}

            {/* ТАБЛО */}
            <div className="score-board">
                <div className="team-score"><span>ВРАГИ</span><strong>{enemyScore}</strong></div>
                <div className="vs">VS</div>
                <div className="team-score"><strong>{myScore}</strong><span>МЫ</span></div>
            </div>
            
            <div className="status-bar">
                {isMyTurn 
                    ? (phase === 'SERVE' ? "⚡ ТВОЯ ПОДАЧА" : phase === 'SET' ? "🎯 ВЫБЕРИ АТАКУ" : "🛡️ СТАВЬ БЛОК") 
                    : "⏳ ХОД СОПЕРНИКА"
                }
            </div>

            {/* ПОЛЕ */}
            <div className="board-wrapper">
                <CheatLayer 
                    lastAction={lastAction}
                    myTeam={myTeam}
                    enemyTeam={enemyTeam}
                    myId={myId}
                />
                <div className="enemy-team">{enemyTeam.map(p => renderPlayer(p, true))}</div>
                
                <div className="net-separator"></div>
                
                <BallManager 
                    lastAction={lastAction}
                    myTeam={myTeam}
                    enemyTeam={enemyTeam}
                    phase={phase}
                    turn={turn}
                    myId={myId}
                />

                <div className="my-team">{myTeam.map(p => renderPlayer(p, false))}</div>
            </div>

            {/* КНОПКИ */}
            <div className="controls">
                {isMyTurn && phase === 'SERVE' && <button className="action-btn" onClick={onServe} disabled={isActionPending}>ПОДАТЬ 🏐</button>}
                
                {isMyTurn && phase === 'SET' && (
                    <div className="set-controls">
                        <button className="set-btn" onClick={() => onSet(4)} disabled={isActionPending}>⬅️ ЛЕВО</button>
                        <button className="set-btn" onClick={() => onSet(3)} disabled={isActionPending}>⬆️ ПАЙП</button>
                        <button className="set-btn" onClick={() => onSet(2)} disabled={isActionPending}>ПРАВО ➡️</button>
                    </div>
                )}
                
                {isMyTurn && phase === 'BLOCK' && (
                    <div className="set-controls">
                        <button className="set-btn block-btn" onClick={() => onBlock(4)} disabled={isActionPending}>✋ ЛЕВО</button>
                        <button className="set-btn block-btn" onClick={() => onBlock(3)} disabled={isActionPending}>✋ ЦЕНТР</button>
                        <button className="set-btn block-btn" onClick={() => onBlock(2)} disabled={isActionPending}>✋ ПРАВО</button>
                    </div>
                )}
            </div>

            <div className="commentator-box" ref={scrollRef}>
                {gameLog.split('\n').filter(l => l.trim()).reverse().map((line, i) => renderLogLine(line.trim(), i))}
            </div>
        </div>
    );
}

export default MatchBoard;