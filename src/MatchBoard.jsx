import React, { useEffect, useRef, useState } from 'react';
// Импортируем компонент эффектов
import Debris from './Effects'; 

function MatchBoard({ myTeam, enemyTeam, myId, turn, score, onServe, gameLog, phase, ballTarget, lastAction, onSet, onBlock, triggerShake, myTeamIndex }) {
    
    const isMyTurn = turn === myId;
    const scrollRef = useRef(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    // --- 1. ЛОГИКА СЧЕТА (КТО Я?) ---
    // Если myTeamIndex не передан (баг), считаем себя Team 1
    const myScore = (myTeamIndex === 2) ? (score?.team2 || 0) : (score?.team1 || 0);
    const enemyScore = (myTeamIndex === 2) ? (score?.team1 || 0) : (score?.team2 || 0);
    
    // --- 2. СОСТОЯНИЕ МЯЧА ---
    const [ballState, setBallState] = useState({
        top: '50%',
        left: '50%',
        opacity: 0,
        transform: 'scale(1)',
        transition: 'none'
    });

    const [isAnimating, setIsAnimating] = useState(false);

    // Автоскролл лога
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, [gameLog]);

    // --- 3. КООРДИНАТЫ (СИСТЕМА СЕТКИ) ---
    // Эти проценты должны совпадать с визуальным положением карточек в CSS
    const getCoords = (posId, isMySide) => {
        const map = {
            // МОЯ СТОРОНА (НИЗ)
            my: {
                1: { x: 80, y: 88 }, // Подача (Правый нижний)
                2: { x: 80, y: 64 }, // Сетка Право
                3: { x: 50, y: 64 }, // Сетка Центр
                4: { x: 20, y: 64 }, // Сетка Лево
                5: { x: 20, y: 88 }, // Защита Лево
                6: { x: 50, y: 88 }  // Защита Центр
            },
            // ЧУЖАЯ СТОРОНА (ВЕРХ) - ЗЕРКАЛЬНО
            enemy: {
                1: { x: 20, y: 12 }, // Подача врага (Левый верхний для нас)
                2: { x: 20, y: 36 }, // Их право (наше лево)
                3: { x: 50, y: 36 },
                4: { x: 80, y: 36 }, // Их лево (наше право)
                5: { x: 80, y: 12 },
                6: { x: 50, y: 12 }
            }
        };
        
        const c = isMySide ? map.my[posId] : map.enemy[posId];
        // Защита от ошибок
        if (!c) return { left: '50%', top: '50%' };
        return { left: `${c.x}%`, top: `${c.y}%` };
    };

    // --- 4. СТАТИЧЕСКАЯ ПОЗИЦИЯ МЯЧА ---
    // (Где мяч лежит, когда никто ничего не делает)
    useEffect(() => {
        if (isAnimating) return; // Не мешаем анимации

        let pos = { opacity: 1, transition: 'all 0.5s ease-out' };

        if (phase === 'SERVE') {
            // Мяч у того, чей сейчас ход (на позиции 1)
            const coords = getCoords(1, isMyTurn);
            pos = { ...pos, ...coords, transform: 'scale(1)' };
        } 
        else if (phase === 'SET') {
            // Мяч у связующего (Поз 3) того, чей ход
            const coords = getCoords(3, isMyTurn);
            // Чуть смещаем к центру поля по вертикали
            pos = { 
                ...pos, 
                left: coords.left, 
                top: isMyTurn ? '55%' : '45%', 
                transform: 'scale(1)' 
            };
        }
        else if (phase === 'BLOCK') {
            // Мяч завис над сеткой
            pos = { ...pos, top: '50%', left: '50%', transform: 'scale(1.2)' };
        }

        setBallState(prev => ({ ...prev, ...pos }));
    }, [phase, turn, isAnimating, myId]);


    // --- 5. АНИМАЦИЯ ПОЛЕТА ---
    useEffect(() => {
        if (!lastAction) return;

        const performAnimation = async () => {
            setIsAnimating(true);
            
            const actorIsMe = lastAction.actorId === myId;
            const type = lastAction.type;

            let start = {};
            let end = {};
            
            // Логика траекторий
            if (type === 'SERVE') {
                // От подающего (1) -> К принимающему (5 или 6)
                start = getCoords(1, actorIsMe);
                end = getCoords(5, !actorIsMe); 
            } 
            else if (type === 'SET') {
                // От связующего (3) -> К нападающему (targetPos)
                start = getCoords(3, actorIsMe);
                const target = lastAction.targetPos || 3; 
                end = getCoords(target, actorIsMe);
                
                // Если это сет противника (мы не видим targetPos), пусть летит просто вверх
                if (!actorIsMe) {
                    end = { top: '40%', left: '50%' };
                }
            }
            else if (type === 'SPIKE') {
                // От сетки -> В защиту
                start = { top: '50%', left: '50%' };
                // Летит в сторону того, кто НЕ атаковал (защищающийся / turn)
                // Так как после спайка ход передается защите (если не гол) или остается у атаки (если гол),
                // надежнее просто отправить его в центр поля того, кто сейчас НЕ actorId
                // Но actorId в lastAction (SPIKE) нет, так как мы его там не передали явно в App.
                // Упрощение: летит в центр поля того, чей сейчас ход (или наоборот, если гол).
                // Визуально достаточно отправить в центр стороны защиты.
                
                // Простая логика: если я бил, летит к врагу.
                // Но мы не знаем точно, кто бил, из lastAction (там только type).
                // Используем phase. Если phase сменилась на SERVE (гол), мяч падает.
                // Если phase == SET (сейв), мяч летит к игроку.
                
                // Для простоты анимации: всегда летит в центр принимающей стороны.
                // Принимающий это тот, кто НЕ turn в момент начала анимации (но turn уже сменился).
                // Давайте просто используем isMyTurn. Если ход мой -> мяч летит ко мне.
                end = getCoords(6, isMyTurn); 
            }

            // ШАГ A: ТЕЛЕПОРТ НА СТАРТ
            setBallState({
                ...start,
                opacity: 1,
                transform: 'scale(1)',
                transition: 'none' 
            });

            // Даем браузеру отрисовать
            await new Promise(r => setTimeout(r, 50));

            // ШАГ B: ПОЛЕТ
            setBallState({
                ...end,
                opacity: 1,
                transform: 'scale(1) rotate(720deg)', 
                transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)' 
            });

            // Ждем окончания полета
            await new Promise(r => setTimeout(r, 600));

            setIsAnimating(false);
        };

        performAnimation();

    }, [lastAction]); // Срабатывает только по уникальному lastAction.ts


    // --- 6. РЕНДЕР КАРТОЧКИ ---
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

    // --- 7. РЕНДЕР ЛОГА ---
    const renderLogLine = (line, index) => {
        let className = "log-entry";
        if (line.includes("ЭЙС") || line.includes("ГОЛ") || line.includes("KILL")) className += " log-goal";
        else if (line.includes("Квирк") || line.includes("★") || line.includes("Бонус")) className += " log-quirk";
        return <div key={index} className={className}>{line}</div>;
    };

    // --- 8. ГЛАВНЫЙ RENDER ---
    return (
        <div className={`match-container ${triggerShake ? 'shake-hard' : ''}`} onClick={() => setSelectedPlayer(null)}>
            
            {/* ЭФФЕКТЫ */}
            {triggerShake && (
                <>
                    <div className="impact-flash"></div>
                    <Debris /> 
                </>
            )}

            <div className="score-board">
                <div className="team-score">
                    <span>ВРАГИ</span>
                    <strong>{enemyScore}</strong>
                </div>
                <div className="vs">VS</div>
                <div className="team-score">
                    <strong>{myScore}</strong>
                    <span>МЫ</span>
                </div>
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