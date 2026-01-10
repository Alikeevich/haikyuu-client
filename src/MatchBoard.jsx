import React, { useEffect, useRef, useState } from 'react';

function MatchBoard({ myTeam, enemyTeam, myId, turn, score, onServe, gameLog, phase, ballTarget, onSet, onBlock }) {
    
    const isMyTurn = turn === myId;
    const scrollRef = useRef(null);
    const animationRef = useRef(null);
    
    const [ballPosition, setBallPosition] = useState({ 
        top: '50%', 
        left: '50%', 
        opacity: 0,
        transform: 'scale(1) rotate(0deg)'
    });
    
    const [isAnimating, setIsAnimating] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [ballInFlight, setBallInFlight] = useState(false);
    const [ballPath, setBallPath] = useState([]);
    const [currentPathIndex, setCurrentPathIndex] = useState(0);

    // Автоскролл лога
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [gameLog]);

    // Определение координат позиций для анимации
    const getPositionCoords = (position, isEnemy) => {
        const positions = {
            // Моя команда (нижняя половина)
            my: {
                1: { x: 80, y: 88 },  // bottom: 12%
                2: { x: 20, y: 64 },  // bottom: 36%
                3: { x: 50, y: 64 },  // bottom: 36%
                4: { x: 80, y: 64 },  // bottom: 36%
                5: { x: 20, y: 88 },  // bottom: 12%
                6: { x: 50, y: 88 }   // bottom: 12%
            },
            // Вражеская команда (верхняя половина)
            enemy: {
                1: { x: 20, y: 12 },
                2: { x: 20, y: 36 },
                3: { x: 50, y: 36 },
                4: { x: 80, y: 36 },
                5: { x: 80, y: 12 },
                6: { x: 50, y: 12 }
            }
        };
        
        const coords = isEnemy ? positions.enemy[position] : positions.my[position];
        return {
            left: `${coords.x}%`,
            top: `${coords.y}%`
        };
    };

    // Создание траектории полета мяча
    const createBallPath = (fromPos, toPos, curvePoints = []) => {
        const path = [];
        
        // Начальная точка
        path.push({ 
            ...fromPos, 
            opacity: 1,
            transform: 'scale(1) rotate(0deg)',
            duration: 0
        });
        
        // Кривые точки (для дугообразной траектории)
        if (curvePoints.length > 0) {
            curvePoints.forEach(point => {
                path.push({
                    ...point,
                    opacity: 1,
                    transform: 'scale(1.1) rotate(90deg)',
                    duration: 300
                });
            });
        }
        
        // Конечная точка
        path.push({
            ...toPos,
            opacity: 1,
            transform: 'scale(1) rotate(360deg)',
            duration: 400
        });
        
        return path;
    };

    // Основная анимация мяча
    useEffect(() => {
        if (animationRef.current) {
            clearInterval(animationRef.current);
        }

        setIsAnimating(true);
        setBallInFlight(false);
        setBallPath([]);
        setCurrentPathIndex(0);

        const animateBall = async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (phase === 'SERVE') {
                // Анимация подачи
                const serverPos = getPositionCoords(1, !isMyTurn);
                const targetPos = getPositionCoords(1, isMyTurn);
                
                // Траектория с дугой
                const curvePoint = {
                    left: '50%',
                    top: isMyTurn ? '40%' : '60%'
                };
                
                const path = createBallPath(serverPos, targetPos, [curvePoint]);
                setBallPath(path);
                
            } else if (phase === 'SET') {
                // Анимация паса
                const setterPos = getPositionCoords(3, !isMyTurn);
                let targetPos;
                
                if (ballTarget === 3) {
                    // Пайп - летит на заднюю линию
                    targetPos = getPositionCoords(6, !isMyTurn);
                } else {
                    // Обычная атака
                    targetPos = getPositionCoords(ballTarget, !isMyTurn);
                }
                
                // Высокая дуга для паса
                const curvePoint = {
                    left: `${(parseFloat(setterPos.left) + parseFloat(targetPos.left)) / 2}%`,
                    top: isMyTurn ? '30%' : '70%'
                };
                
                const path = createBallPath(setterPos, targetPos, [curvePoint]);
                setBallPath(path);
                
            } else if (phase === 'BLOCK') {
                // Анимация атаки и блока
                const attackerPos = getPositionCoords(ballTarget || 4, !isMyTurn);
                const netPos = { left: '50%', top: '50%' };
                const defenderPos = getPositionCoords(ballTarget || 4, isMyTurn);
                
                // Прямая атака через сетку
                const path = [
                    { ...attackerPos, opacity: 1, transform: 'scale(1) rotate(0deg)', duration: 0 },
                    { ...netPos, opacity: 1, transform: 'scale(1.2) rotate(180deg)', duration: 200 },
                    { ...defenderPos, opacity: 1, transform: 'scale(1) rotate(360deg)', duration: 300 }
                ];
                
                setBallPath(path);
            }
        };

        animateBall();
    }, [phase, isMyTurn, ballTarget]);

    // Анимация по точкам траектории
    useEffect(() => {
        if (ballPath.length === 0 || currentPathIndex >= ballPath.length) {
            if (ballPath.length > 0 && currentPathIndex >= ballPath.length) {
                setIsAnimating(false);
                setBallInFlight(false);
            }
            return;
        }

        setBallInFlight(true);
        const currentPoint = ballPath[currentPathIndex];
        
        setBallPosition({
            ...currentPoint,
            transition: `all ${currentPoint.duration || 300}ms cubic-bezier(0.4, 0, 0.2, 1)`
        });

        const timer = setTimeout(() => {
            setCurrentPathIndex(prev => prev + 1);
        }, currentPoint.duration || 300);

        return () => clearTimeout(timer);
    }, [ballPath, currentPathIndex]);

    // Эффект вращения мяча в полете
    useEffect(() => {
        if (ballInFlight) {
            const rotateInterval = setInterval(() => {
                setBallPosition(prev => ({
                    ...prev,
                    transform: `scale(1.1) rotate(${parseInt(prev.transform.match(/rotate\((\d+)deg\)/)?.[1] || 0) + 90}deg)`
                }));
            }, 100);

            return () => clearInterval(rotateInterval);
        }
    }, [ballInFlight]);

    // Тултипы игроков
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
                        position: 'absolute',
                        top: ballPosition.top,
                        left: ballPosition.left,
                        opacity: ballPosition.opacity,
                        transform: ballPosition.transform,
                        transition: ballPosition.transition || 'all 0.3s ease-out'
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