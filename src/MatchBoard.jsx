import React, { useEffect, useRef, useState } from 'react';
import Debris from './Effects';

function MatchBoard({ myTeam, enemyTeam, myId, turn, score, onServe, gameLog, phase, lastAction, onSet, onBlock, triggerShake, myTeamIndex, triggerLegendary }) {
    const isMyTurn = turn === myId;
    const scrollRef = useRef(null);
    const ballRef = useRef(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    
    const myScore = (myTeamIndex === 2) ? (score?.team2 || 0) : (score?.team1 || 0);
    const enemyScore = (myTeamIndex === 2) ? (score?.team1 || 0) : (score?.team2 || 0);

    // --- КООРДИНАТЫ ---
    const getZoneCoords = (posId, isMySide) => {
        const map = {
            // Моя сторона (Низ)
            my: {
                1: { x: 90, y: 90 }, 2: { x: 90, y: 60 }, 3: { x: 50, y: 60 },
                4: { x: 10, y: 60 }, 5: { x: 10, y: 90 }, 6: { x: 50, y: 80 }
            },
            // Сторона врага (Верх)
            enemy: {
                1: { x: 10, y: 10 }, 2: { x: 10, y: 40 }, 3: { x: 50, y: 40 },
                4: { x: 90, y: 40 }, 5: { x: 90, y: 10 }, 6: { x: 50, y: 20 }
            }
        };
        const c = isMySide ? map.my[posId] : map.enemy[posId];
        return c ? { left: `${c.x}%`, top: `${c.y}%` } : { left: '50%', top: '50%' };
    };

    const getPlayerCoordsById = (playerId) => {
        const myPlayer = myTeam.find(p => p.id === playerId);
        if (myPlayer) return getZoneCoords(myPlayer.position, true);
        const enemyPlayer = enemyTeam.find(p => p.id === playerId);
        if (enemyPlayer) return getZoneCoords(enemyPlayer.position, false);

        if (playerId === 'AI') return { left: '50%', top: '10%' };
        return { left: '50%', top: '50%' };
    };

    // --- РАСЧЕТ ПОЗИЦИИ МЯЧА (Синхронный) ---
    const getInitialBallStyle = () => {
        if (phase === 'SERVE') {
            // Полная проверка: Я, Мой тиммейт, Враг или ИИ?
            const isMyServe = turn === myId || myTeam.some(p => p.id === turn);
            const isEnemyServe = enemyTeam.some(p => p.id === turn) || turn === 'AI';

            let pos = { left: '50%', top: '50%' };
            if (isMyServe) pos = getZoneCoords(1, true); // Моя зона 1
            else if (isEnemyServe) pos = getZoneCoords(1, false); // Вражеская зона 1

            return {
                ...pos,
                transform: 'scale(1)',
                transition: 'none',
                opacity: 1, 
                zIndex: 50
            };
        }
        return { top: '50%', left: '50%', transform: 'scale(1)', transition: 'none', opacity: 0, zIndex: 50 };
    };

    const [ballStyle, setBallStyle] = useState(getInitialBallStyle());
    
    // Refs
    const lastProcessedActionString = useRef("");
    const isAnimatingRef = useRef(false);

    // Автоскролл
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, [gameLog]);

    // --- АНИМАЦИИ ---
    const snapBall = (to) => {
        return new Promise(resolve => {
            setBallStyle({
                ...to,
                transform: 'scale(1)',
                transition: 'none',
                opacity: 1,
                zIndex: 50
            });
            requestAnimationFrame(() => requestAnimationFrame(resolve));
        });
    };

    const moveBall = (to, duration, timing, transform = '') => {
        return new Promise((resolve) => {
            let isResolved = false;
            const listener = (e) => {
                if (e.target !== ballRef.current) return;
                if (isResolved) return;
                isResolved = true;
                ballRef.current.removeEventListener('transitionend', listener);
                resolve();
            };
            
            if (ballRef.current) {
                ballRef.current.addEventListener('transitionend', listener);
            } else {
                resolve(); return;
            }

            setBallStyle(prev => ({
                ...prev,
                ...to,
                transform: `scale(1) ${transform}`,
                transition: `top ${duration} ${timing}, left ${duration} ${timing}, transform ${duration} linear`,
                opacity: 1,
                zIndex: 50
            }));

            const ms = parseFloat(duration) * 1000;
            setTimeout(() => {
                if (!isResolved) {
                    isResolved = true;
                    if (ballRef.current) ballRef.current.removeEventListener('transitionend', listener);
                    resolve();
                }
            }, ms + 100);
        });
    };

    const fadeBall = () => {
        return new Promise(resolve => {
            setBallStyle(prev => ({ ...prev, opacity: 0, transition: 'opacity 0.5s' }));
            setTimeout(resolve, 600);
        });
    };

    // --- 1. ГЛАВНАЯ ЛОГИКА АНИМАЦИИ (ДЕЙСТВИЯ) ---
    useEffect(() => {
        if (!lastAction) return;
        const currentActionString = JSON.stringify(lastAction);
        if (currentActionString === lastProcessedActionString.current) return;

        lastProcessedActionString.current = currentActionString;
        isAnimatingRef.current = true;

        const runSequence = async () => {
            const type = lastAction.type;
            const data = lastAction.data || {};

            // SERVE
            if (type === 'SERVE') {
                const startPos = getPlayerCoordsById(lastAction.attackerId);
                const receiverPos = getPlayerCoordsById(data.receiverId);
                
                await snapBall(startPos);
                await moveBall(receiverPos, '0.6s', 'ease-in', 'rotate(720deg)');

                if (data.winSide === 'ATTACK') {
                    // Эйс -> Пол
                    const floorPos = { left: receiverPos.left, top: `calc(${receiverPos.top} + 10%)` };
                    await moveBall(floorPos, '0.3s', 'ease-in', 'rotate(180deg)');
                    await fadeBall();
                } else {
                    // Прием -> Пас связующему
                    const isMyTeamReceiver = myTeam.some(p => p.id === data.receiverId);
                    let setterPos = data.isBadReception ? { left: '50%', top: '50%' } : getZoneCoords(3, isMyTeamReceiver);
                    await moveBall(setterPos, '0.7s', 'ease-out', 'rotate(360deg)');
                }
            } 
            // SET
            else if (type === 'SET') {
                const setterPos = getPlayerCoordsById(lastAction.setterId);
                const isMySet = lastAction.targetPos !== undefined;
                
                if (isMySet) {
                    const targetZone = lastAction.targetPos || 3;
                    const attackZone = targetZone === 3 ? 6 : targetZone; 
                    const attackPos = getZoneCoords(attackZone, true);
                    await snapBall(setterPos);
                    await moveBall(attackPos, '0.6s', 'ease-in-out', 'rotate(360deg)');
                } else {
                    // Враг пасует (скрытый) - легкий подброс
                    const hiddenPos = { ...setterPos, top: '35%' }; 
                    await snapBall(setterPos);
                    await moveBall(hiddenPos, '0.6s', 'ease-in-out', 'rotate(360deg)');
                }
            } 
            // SPIKE
            else if (type === 'SPIKE') {
                const traj = data.trajectory || {};
                let startPos = getPlayerCoordsById(traj.startId) || getPlayerCoordsById(lastAction.attackerId);
                const endPos = getPlayerCoordsById(traj.endId);
                
                let speed = '0.35s';
                let easing = 'linear';
                let rot = 'rotate(1080deg)';
                if (traj.type === 'BOUNCE') {
                    speed = '0.25s'; easing = 'cubic-bezier(0.1, 0.9, 0.2, 1)'; rot = 'rotate(-720deg)';
                } else if (traj.type === 'SOFT') {
                    speed = '0.9s'; easing = 'ease-out';
                }
                
                await snapBall(startPos);
                await moveBall(endPos, speed, easing, rot);

                if (lastAction.winSide) {
                    // ГОЛ -> Пол
                    const floorPos = { left: endPos.left, top: `calc(${endPos.top} + 10%)` };
                    await moveBall(floorPos, '0.3s', 'ease-in', 'rotate(180deg)');
                    await fadeBall();
                } else {
                    // МЯЧ ПОДНЯТ (ПЕРЕЛЕТ ИЛИ СЕЙВ) -> СВЯЗУЮЩИЙ
                    
                    // !!! ИСПРАВЛЕНИЕ: Чей следующий ход? !!!
                    const nextTurnId = lastAction.nextTurn;
                    
                    // Проверяем: следующий ход МОЙ или моей команды?
                    const isNextMyTurn = (nextTurnId === myId) || myTeam.some(p => p.id === nextTurnId);
                    
                    // Если ход перешел КО МНЕ -> Мяч летит к МОЕМУ связующему (Pos 3, isMySide=true)
                    // Если ход у ВРАГА -> Мяч летит к ЕГО связующему (Pos 3, isMySide=false)
                    const nextTargetPos = getZoneCoords(3, isNextMyTurn); 

                    // Анимация полета
                    await moveBall(nextTargetPos, '0.8s', 'ease-out', 'rotate(360deg)');
                }
            }

            isAnimatingRef.current = false;
        };

        runSequence();

        return () => {};
    }, [lastAction]);

    // --- 2. ЛОГИКА ПОЗИЦИОНИРОВАНИЯ (SERVE IDLE) ---
    // Чиним прилипание мяча к подающему
    useEffect(() => {
        if (phase === 'SERVE' && !isAnimatingRef.current) {
            
            // Используем ту же логику, что и в getInitialBallStyle
            const isMyServe = turn === myId || myTeam.some(p => p.id === turn);
            const isEnemyServe = enemyTeam.some(p => p.id === turn) || turn === 'AI';

            let serverPos = { left: '50%', top: '50%' };
            if (isMyServe) serverPos = getZoneCoords(1, true);
            else if (isEnemyServe) serverPos = getZoneCoords(1, false);

            const timer = setTimeout(() => {
                if (isAnimatingRef.current) return;
                
                setBallStyle(prev => ({
                    ...prev,
                    ...serverPos,
                    transform: 'scale(1)',
                    transition: 'all 0.5s ease-out',
                    opacity: 1, // Принудительно показываем
                    zIndex: 50
                }));
            }, 50);
            
            return () => clearTimeout(timer);
        }
    }, [phase, turn, myTeam, enemyTeam]); 

    // Рендер игроков (Без изменений)
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
        <div className={`match-container ${triggerShake ? 'shake-hard' : ''} ${triggerLegendary ? 'manga-impact' : ''} `} onClick={() => setSelectedPlayer(null)}>
            
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
                
                {/* МЯЧ */}
                <div ref={ballRef} className="volleyball-ball" style={ballStyle}></div>
                
                <div className="my-team">{myTeam.map(p => renderPlayer(p, false))}</div>
            </div>
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