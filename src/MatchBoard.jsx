import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// ИМПОРТЫ КОМПОНЕНТОВ ВИЗУАЛА
import Debris from './Effects';
import CutIn from './CutIn';
import SpeedLines from './SpeedLines';
import BallManager from './components/BallManager'; // <-- ОБНОВЛЕННЫЙ КОМПОНЕНТ

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
    triggerLegendary 
}) {

    const isMyTurn = turn === myId;
    const scrollRef = useRef(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [cutInMod, setCutInMod] = useState(null); // Для кат-сцен

    // --- ЛОГИКА СЧЕТА ---
    const myScore = (myTeamIndex === 2) ? (score?.team2 || 0) : (score?.team1 || 0);
    const enemyScore = (myTeamIndex === 2) ? (score?.team1 || 0) : (score?.team2 || 0);

    // Автоскролл лога
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, [gameLog]);

    // --- ЛОГИКА КАТ-ИНОВ (Вставки как в аниме) ---
    useEffect(() => {
        if (!gameLog || !lastAction) return;
        const lines = gameLog.split('\n').filter(l => l.trim());
        const lastMsg = lines[lines.length - 1] || "";

        // Если это крутое событие
        const isSpecialEvent = lastMsg.includes("★") || lastMsg.includes("ЭЙС") || lastMsg.includes("KILL BLOCK") || lastMsg.includes("ВЖУХ") || lastMsg.includes("НИНДЗЯ");

        if (isSpecialEvent) {
            const allPlayers = [...myTeam, ...enemyTeam];
            const actor = allPlayers.find(p => p.id === lastAction.actorId || p.id === lastAction.attackerId || p.id === lastAction.setterId);

            if (actor) {
                let skillName = "NICE PLAY!";
                if (actor.quirk && (lastMsg.includes("★") || lastMsg.includes(actor.quirk.name))) {
                    skillName = actor.quirk.name;
                } else if (lastMsg.includes("ЭЙС")) skillName = "SERVICE ACE";
                else if (lastMsg.includes("KILL BLOCK")) skillName = "KILL BLOCK";
                else if (lastMsg.includes("НИНДЗЯ")) skillName = "NINJA WIPE";

                setCutInMod({ character: actor, skill: skillName });
                setTimeout(() => setCutInMod(null), 2500);
            }
        }
    }, [gameLog, lastAction, myTeam, enemyTeam]);


    // --- РЕНДЕР ИГРОКОВ (С АНИМАЦИЕЙ РОТАЦИИ) ---
    const togglePlayerInfo = (player, e) => {
        e?.stopPropagation();
        setSelectedPlayer(selectedPlayer?.id === player.id ? null : player);
    };

    const renderPlayer = (player, isEnemy) => {
        const hasImg = player.img && player.img.length > 5;
        const isSelected = selectedPlayer?.id === player.id;
        const initialY = isEnemy ? -20 : 20;

        return (
            <motion.div 
                key={player.id} // ВАЖНО: Используем ID, чтобы React знал, что это тот же игрок
                initial={{ opacity: 0, y: initialY }} // Анимация появления при входе в матч
                animate={{ opacity: 1, y: 0 }}
                style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}
            >
                {/* Внутренний контейнер с layout для плавной ротации */}
                <motion.div 
                    layout // <-- МАГИЯ: Автоматически анимирует изменение позиции (top/left из CSS)
                    transition={{ type: "spring", stiffness: 300, damping: 30 }} // Плавная пружина
                    className={`player-card pos-${player.position} ${isEnemy ? 'enemy-card' : ''} ${isSelected ? 'selected' : ''}`}
                    style={{ pointerEvents: 'auto' }}
                    onClick={(e) => togglePlayerInfo(player, e)}
                >
                    <div className="card-photo-container">
                        {hasImg ? <img src={player.img} alt={player.name} onError={(e) => e.target.style.display = 'none'} /> 
                                : <div style={{fontSize:'24px', display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}>{player.img}</div>}
                    </div>
                    <div className="card-info"><div className="card-name">{player.name.split(' ')[0]}</div></div>
                    
                    {isSelected && (
                        <div className="quirk-tooltip mobile-active">
                            <div className="tooltip-header">{player.name}</div>
                            <div className="tooltip-stats">
                                <div className="tooltip-stat">⚔️ {player.stats.power} 🛡️ {player.stats.receive} ✋ {player.stats.block}</div>
                            </div>
                            {player.quirk && (<div className="tooltip-quirk"><div className="quirk-title">★ {player.quirk.name}</div><div className="quirk-description">{player.quirk.desc}</div></div>)}
                        </div>
                    )}
                </motion.div>
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

            {/* --- ВИЗУАЛЬНЫЕ ЭФФЕКТЫ --- */}
            <SpeedLines isActive={showSpeedLines} />
            {cutInMod && <CutIn character={cutInMod.character} skillName={cutInMod.skill} />}
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
                {isMyTurn ? (phase === 'SERVE' ? "⚡ ТВОЯ ПОДАЧА" : phase === 'SET' ? "🎯 ВЫБЕРИ АТАКУ" : "🛡️ СТАВЬ БЛОК") : "⏳ ХОД СОПЕРНИКА"}
            </div>

            {/* ПОЛЕ */}
            <div className="board-wrapper">
                <div className="enemy-team">{enemyTeam.map(p => renderPlayer(p, true))}</div>
                
                <div className="net-separator"></div>
                
                {/* --- НОВАЯ СИСТЕМА МЯЧА --- */}
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
            {isMyTurn && phase === 'SERVE' && <button className="action-btn" onClick={onServe}>ПОДАТЬ 🏐</button>}
            
            {isMyTurn && phase === 'SET' && (
                <div className="set-controls">
                    <button className="set-btn" onClick={() => onSet(4)}>⬅️ ЛЕВО</button>
                    <button className="set-btn" onClick={() => onSet(3)}>⬆️ ПАЙП</button>
                    <button className="set-btn" onClick={() => onSet(2)}>ПРАВО ➡️</button>
                </div>
            )}
            
            {isMyTurn && phase === 'BLOCK' && (
                <div className="set-controls">
                    <button className="set-btn block-btn" onClick={() => onBlock(4)}>✋ ЛЕВО</button>
                    <button className="set-btn block-btn" onClick={() => onBlock(3)}>✋ ЦЕНТР</button>
                    <button className="set-btn block-btn" onClick={() => onBlock(2)}>✋ ПРАВО</button>
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