import React, { useEffect, useRef, useState } from 'react';
// Импортируем эффекты
import Debris from './Effects'; 
import CutIn from './CutIn'; // <--- НОВЫЙ ИМПОРТ

function MatchBoard({ myTeam, enemyTeam, myId, turn, score, onServe, gameLog, phase, ballTarget, lastAction, onSet, onBlock, triggerShake, myTeamIndex }) {
    
    const isMyTurn = turn === myId;
    const scrollRef = useRef(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    // --- ЛОГИКА СЧЕТА ---
    const myScore = (myTeamIndex === 2) ? (score?.team2 || 0) : (score?.team1 || 0);
    const enemyScore = (myTeamIndex === 2) ? (score?.team1 || 0) : (score?.team2 || 0);
    
    // --- СОСТОЯНИЕ МЯЧА ---
    const [ballState, setBallState] = useState({
        top: '50%', left: '50%', opacity: 0, transform: 'scale(1)', transition: 'none'
    });
    const [isAnimating, setIsAnimating] = useState(false);

    // --- СОСТОЯНИЕ КАТ-ИНОВ (CUT-INS) ---
    const [cutInMod, setCutInMod] = useState(null); // { character, skill }

    // Автоскролл лога
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, [gameLog]);

    // --- ЛОГИКА ЗАПУСКА КАТ-ИНОВ ---
    useEffect(() => {
        if (!gameLog || !lastAction) return;

        // Берем последнюю строку лога
        const lines = gameLog.split('\n').filter(l => l.trim());
        const lastMsg = lines[lines.length - 1] || "";

        // Ключевые слова для активации кат-сцены
        const isSpecialEvent = lastMsg.includes("★") || lastMsg.includes("ЭЙС") || lastMsg.includes("KILL BLOCK") || lastMsg.includes("ВЖУХ");

        if (isSpecialEvent) {
            // Ищем игрока, который совершил действие (actorId из lastAction)
            const allPlayers = [...myTeam, ...enemyTeam];
            const actor = allPlayers.find(p => p.id === lastAction.actorId);

            if (actor) {
                let skillName = "NICE PLAY!";
                
                // Определяем название скилла для отображения
                if (actor.quirk && lastMsg.includes("★")) {
                    skillName = actor.quirk.name; // Имя квирка
                } else if (lastMsg.includes("ЭЙС")) {
                    skillName = "SERVICE ACE";
                } else if (lastMsg.includes("KILL BLOCK")) {
                    skillName = "KILL BLOCK";
                }

                // Запускаем кат-ин
                setCutInMod({ character: actor, skill: skillName });

                // Убираем через 2.5 секунды
                const timer = setTimeout(() => setCutInMod(null), 2500);
                return () => clearTimeout(timer);
            }
        }
    }, [gameLog, lastAction, myTeam, enemyTeam]);


    // --- 1. КООРДИНАТЫ ---
    const getCoords = (posId, isMySide) => {
        const map = {
            my: {
                1: { x: 80, y: 88 }, 2: { x: 80, y: 64 }, 3: { x: 50, y: 64 },
                4: { x: 20, y: 64 }, 5: { x: 20, y: 88 }, 6: { x: 50, y: 88 }
            },
            enemy: {
                1: { x: 20, y: 12 }, 2: { x: 20, y: 36 }, 3: { x: 50, y: 36 },
                4: { x: 80, y: 36 }, 5: { x: 80, y: 12 }, 6: { x: 50, y: 12 }
            }
        };
        const c = isMySide ? map.my[posId] : map.enemy[posId];
        if (!c) return { left: '50%', top: '50%' };
        return { left: `${c.x}%`, top: `${c.y}%` };
    };

    // --- 2. СТАТИКА МЯЧА ---
    useEffect(() => {
        if (isAnimating) return;
        let pos = { opacity: 1, transition: 'all 0.5s ease-out' };

        if (phase === 'SERVE') {
            const coords = getCoords(1, isMyTurn);
            pos = { ...pos, ...coords, transform: 'scale(1)' };
        } 
        else if (phase === 'SET') {
            const coords = getCoords(3, isMyTurn);
            pos = { ...pos, left: coords.left, top: isMyTurn ? '55%' : '45%', transform: 'scale(1)' };
        }
        else if (phase === 'BLOCK') {
            pos = { ...pos, top: '50%', left: '50%', transform: 'scale(1.2)' };
        }
        setBallState(prev => ({ ...prev, ...pos }));
    }, [phase, turn, isAnimating, myId]);

    // --- 3. АНИМАЦИЯ МЯЧА ---
    useEffect(() => {
        if (!lastAction) return;
        const performAnimation = async () => {
            setIsAnimating(true);
            const actorIsMe = lastAction.actorId === myId;
            const type = lastAction.type;
            let start = {}, end = {};
            
            if (type === 'SERVE') {
                start = getCoords(1, actorIsMe);
                end = getCoords(5, !actorIsMe); 
            } 
            else if (type === 'SET') {
                start = getCoords(3, actorIsMe);
                const target = lastAction.targetPos || 3; 
                end = getCoords(target, actorIsMe);
                if (!actorIsMe) end = { top: '40%', left: '50%' };
            }
            else if (type === 'SPIKE') {
                start = { top: '50%', left: '50%' };
                end = getCoords(6, isMyTurn); 
            }

            setBallState({ ...start, opacity: 1, transform: 'scale(1)', transition: 'none' });
            await new Promise(r => setTimeout(r, 50));
            setBallState({ ...end, opacity: 1, transform: 'scale(1) rotate(720deg)', transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)' });
            await new Promise(r => setTimeout(r, 600));
            setIsAnimating(false);
        };
        performAnimation();
    }, [lastAction]); 

    // --- РЕНДЕР КАРТОЧКИ ---
    const togglePlayerInfo = (player, e) => {
        e?.stopPropagation();
        setSelectedPlayer(selectedPlayer?.id === player.id ? null : player);
    };

    const renderPlayer = (player, isEnemy) => {
        const hasImg = player.img && player.img.length > 5;
        const isSelected = selectedPlayer?.id === player.id;

        return (
            <div key={player.position} className={`player-card pos-${player.position} ${isEnemy ? 'enemy-card' : ''} ${isSelected ? 'selected' : ''}`} onClick={(e) => togglePlayerInfo(player, e)}>
                <div className="card-photo-container">
                    {hasImg ? <img src={player.img} alt={player.name} onError={(e) => e.target.style.display = 'none'} /> 
                            : <div style={{fontSize:'30px', display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}>{player.img}</div>}
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
            </div>
        );
    };

    const renderLogLine = (line, index) => {
        let className = "log-entry";
        if (line.includes("ЭЙС") || line.includes("ГОЛ") || line.includes("KILL")) className += " log-goal";
        else if (line.includes("Квирк") || line.includes("★") || line.includes("Бонус")) className += " log-quirk";
        return <div key={index} className={className}>{line}</div>;
    };

    return (
        <div className={`match-container ${triggerShake ? 'shake-hard' : ''}`} onClick={() => setSelectedPlayer(null)}>
            
            {/* --- ВИЗУАЛЬНЫЕ ЭФФЕКТЫ --- */}
            
            {/* 1. КАТ-ИН (ВСПЛЫВАЮЩАЯ ПОЛОСКА ПРИ УЛЬТЕ) */}
            {cutInMod && <CutIn character={cutInMod.character} skillName={cutInMod.skill} />}

            {/* 2. ТРЯСКА И ШТУКАТУРКА */}
            {triggerShake && (
                <>
                    <div className="impact-flash"></div>
                    <Debris />
                </>
            )}

            <div className="score-board">
                <div className="team-score"><span>ВРАГИ</span><strong>{enemyScore}</strong></div>
                <div className="vs">VS</div>
                <div className="team-score"><strong>{myScore}</strong><span>МЫ</span></div>
            </div>
            
            <div className="status-bar">
                {isMyTurn ? (phase === 'SERVE' ? "⚡ ТВОЯ ПОДАЧА" : phase === 'SET' ? "🎯 ВЫБЕРИ АТАКУ" : "🛡️ СТАВЬ БЛОК") : "⏳ ХОД СОПЕРНИКА"}
            </div>

            <div className="board-wrapper">
                <div className="enemy-team">{enemyTeam.map(p => renderPlayer(p, true))}</div>
                <div className="net-separator"></div>
                <div className="volleyball-ball" style={ballState}></div>
                <div className="my-team">{myTeam.map(p => renderPlayer(p, false))}</div>
            </div>

            <div className="controls">
               {isMyTurn && phase === 'SERVE' && !isAnimating && <button className="action-btn" onClick={onServe}>ПОДАТЬ 🏐</button>}
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
            </div>

            <div className="commentator-box" ref={scrollRef}>
                {gameLog.split('\n').filter(l => l.trim()).reverse().map((line, i) => renderLogLine(line.trim(), i))}
            </div>
        </div>
    );
}

export default MatchBoard;