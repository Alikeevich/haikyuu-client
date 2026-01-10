import React, { useEffect, useRef, useState } from 'react';

function MatchBoard({ myTeam, enemyTeam, myId, turn, score, onServe, gameLog, phase, ballTarget, lastAction, onSet, onBlock }) {
    
    const isMyTurn = turn === myId;
    const scrollRef = useRef(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    
    // --- СОСТОЯНИЕ МЯЧА ---
    const [ballState, setBallState] = useState({
        top: '50%',
        left: '50%',
        opacity: 0, // Скрыт при инициализации
        transform: 'scale(1)',
        transition: 'none' // Отключаем плавность для телепортации
    });

    const [isAnimating, setIsAnimating] = useState(false);

    // Автоскролл лога
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, [gameLog]);

    // --- 1. КООРДИНАТЫ (СИСТЕМА СЕТКИ) ---
    const getCoords = (posId, isMySide) => {
        // Координаты в % (Left, Top)
        const map = {
            // МОЯ СТОРОНА (НИЗ)
            my: {
                1: { x: 85, y: 90 }, // Подача (Правый нижний угол)
                2: { x: 80, y: 60 }, // Сетка Право
                3: { x: 50, y: 60 }, // Сетка Центр
                4: { x: 20, y: 60 }, // Сетка Лево
                5: { x: 20, y: 85 }, // Защита Лево
                6: { x: 50, y: 85 }  // Защита Центр
            },
            // ЧУЖАЯ СТОРОНА (ВЕРХ) - ЗЕРКАЛЬНО ПО ВЕРТИКАЛИ И ГОРИЗОНТАЛИ
            enemy: {
                1: { x: 15, y: 10 }, // Подача врага (Левый верхний для нас)
                2: { x: 20, y: 40 }, // Их право (наше лево)
                3: { x: 50, y: 40 },
                4: { x: 80, y: 40 }, // Их лево (наше право)
                5: { x: 80, y: 15 },
                6: { x: 50, y: 15 }
            }
        };
        const c = isMySide ? map.my[posId] : map.enemy[posId];
        return { left: `${c.x}%`, top: `${c.y}%` };
    };

    // --- 2. СТАТИЧЕСКАЯ ПОЗИЦИЯ (МЯЧ В РУКАХ) ---
    // Вызывается, когда анимация закончилась или при загрузке
    const updateStaticBallPos = () => {
        if (isAnimating) return; // Не трогаем мяч, если он летит

        let pos = { opacity: 1, transition: 'all 0.5s ease-out' };

        if (phase === 'SERVE') {
            // Мяч у того, чей сейчас ход (на позиции 1)
            const coords = getCoords(1, isMyTurn);
            pos = { ...pos, ...coords, transform: 'scale(1)' };
        } 
        else if (phase === 'SET') {
            // Мяч у связующего (Поз 3) или принимающего
            // Для красоты ставим над центром поля того, чей ход
            const coords = getCoords(3, isMyTurn);
            // Чуть выше головы
            pos = { ...pos, left: coords.left, top: isMyTurn ? '55%' : '45%', transform: 'scale(1)' };
        }
        else if (phase === 'BLOCK') {
            // Мяч завис над сеткой
            pos = { ...pos, top: '50%', left: '50%', transform: 'scale(1.2)' };
        }

        setBallState(prev => ({ ...prev, ...pos }));
    };

    // Обновляем статику при смене фазы или хода (если нет анимации)
    useEffect(() => {
        if (!isAnimating) updateStaticBallPos();
    }, [phase, turn, isAnimating, myId]);


    // --- 3. АНИМАЦИЯ ПОЛЕТА (ПО СОБЫТИЮ) ---
    useEffect(() => {
        if (!lastAction) return;

        const performAnimation = async () => {
            setIsAnimating(true);
            
            const actorIsMe = lastAction.actorId === myId;
            const type = lastAction.type;

            // 1. СТАРТОВАЯ ТОЧКА (Мгновенный перенос без анимации)
            let start = {};
            let end = {};
            
            if (type === 'SERVE') {
                // От подающего (1) -> К принимающему (5 или 6)
                start = getCoords(1, actorIsMe);
                end = getCoords(5, !actorIsMe); // По умолчанию летит в защиту
            } 
            else if (type === 'SET') {
                // От связующего (3) -> К нападающему
                start = getCoords(3, actorIsMe);
                // lastAction.targetPos - куда пасанули (например 4)
                // Если targetPos нет, значит это уведомление для врага (мяч просто летит вверх)
                const target = lastAction.targetPos || 3; 
                end = getCoords(target, actorIsMe);
            }
            else if (type === 'SPIKE' || type === 'BLOCK') {
                // От нападающего -> В блок/пол
                // Тут сложнее, упростим: от сетки к защите
                start = { top: '50%', left: '50%' };
                end = getCoords(6, !actorIsMe);
            }

            // ШАГ 1: Телепорт в начало
            setBallState({
                ...start,
                opacity: 1,
                transform: 'scale(1)',
                transition: 'none' // Мгновенно
            });

            // Ждем рендера
            await new Promise(r => setTimeout(r, 50));

            // ШАГ 2: Полет в конец
            setBallState({
                ...end,
                opacity: 1,
                transform: 'scale(1) rotate(720deg)', // Крутим мяч
                transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)' // Дуга
            });

            // Ждем окончания полета
            await new Promise(r => setTimeout(r, 800));

            setIsAnimating(false);
        };

        performAnimation();

    }, [lastAction]); // Запускаем ТОЛЬКО когда меняется lastAction


    // --- РЕНДЕР ИГРОКОВ ---
    const togglePlayerInfo = (player, e) => {
        e?.stopPropagation();
        setSelectedPlayer(selectedPlayer?.id === player.id ? null : player);
    };

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

                {/* Тултип */}
                {(isSelected) && (
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
            </div>
        );
    };

    const renderLogLine = (line, index) => {
        let className = "log-entry";
        if (line.includes("ЭЙС") || line.includes("ГОЛ")) className += " log-goal";
        else if (line.includes("Квирк") || line.includes("★")) className += " log-quirk";
        return <div key={index} className={className}>{line}</div>;
    };

    return (
        <div className="match-container" onClick={() => setSelectedPlayer(null)}>
            <div className="score-board">
                <div className="team-score"><span>ВРАГИ</span><strong>{score?.team2 || 0}</strong></div>
                <div className="vs">VS</div>
                <div className="team-score"><strong>{score?.team1 || 0}</strong><span>МЫ</span></div>
            </div>
            
            <div className="status-bar">
                {isMyTurn 
                    ? (phase === 'SERVE' ? "⚡ ТВОЯ ПОДАЧА" : phase === 'SET' ? "🎯 ВЫБЕРИ АТАКУ" : "🛡️ СТАВЬ БЛОК") 
                    : "⏳ ХОД СОПЕРНИКА"}
            </div>

            <div className="board-wrapper">
                <div className="enemy-team">{enemyTeam.map(p => renderPlayer(p, true))}</div>
                <div className="net-separator"></div>
                
                {/* МЯЧ */}
                <div className="volleyball-ball" style={ballState}></div>

                <div className="my-team">{myTeam.map(p => renderPlayer(p, false))}</div>
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
            </div>

            <div className="commentator-box" ref={scrollRef}>
                {gameLog.split('\n').filter(l => l.trim()).reverse().map((line, i) => renderLogLine(line.trim(), i))}
            </div>
        </div>
    );
}

export default MatchBoard;