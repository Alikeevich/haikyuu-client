// src/components/BallManager.jsx
import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { getCoordinates, getDistance } from '../utils/BoardUtils';

const BallManager = ({ lastAction, myTeam, enemyTeam, phase, turn }) => {
    const positionControls = useAnimation();
    const heightControls = useAnimation();
    
    const posRef = useRef({ x: 50, y: 50 });
    const [isMoving, setIsMoving] = useState(false);

    // --- ТЕЛЕПОРТ (СБРОС) ---
    const teleportTo = (target) => {
        if (!target) return;
        posRef.current = target;
        positionControls.set({ left: `${target.x}%`, top: `${target.y}%` });
        heightControls.set({ y: 0, scale: 1, rotate: 0 });
    };

    // --- ДВИЖЕНИЕ МЯЧА ---
    const moveBall = async (target, type = 'NORMAL') => {
        const start = posRef.current;
        const dist = getDistance(start, target);
        
        // 1. НАСТРОЙКИ СКОРОСТИ И ДУГИ
        let speedMultiplier = 0.020; 
        let arcHeightPixels = 50;
        let rotations = 2;
        
        switch (type) {
            case 'SPIKE':       
                speedMultiplier = 0.009; // Пуля
                arcHeightPixels = 10;    
                rotations = 12;          
                break;
            case 'SET':         
                speedMultiplier = 0.022; // Медленно и высоко
                arcHeightPixels = 120;   
                rotations = 2; 
                break;
            case 'SERVE':       
                speedMultiplier = 0.010; // << УСКОРИЛИ ПОДАЧУ (было 0.015)
                arcHeightPixels = 60;    
                rotations = 8; 
                break;
            case 'RECEIVE':     
                speedMultiplier = 0.016; // Доводка до связки чуть быстрее обычного
                arcHeightPixels = 90;    
                rotations = 3; 
                break;
            case 'BLOCK_DROP':  
                speedMultiplier = 0.025; 
                arcHeightPixels = 30;    
                break;
            default:            
                speedMultiplier = 0.020;
        }

        const duration = Math.max(0.3, dist * speedMultiplier);
        setIsMoving(true);

        // Запуск анимаций
        const movePromise = positionControls.start({
            left: `${target.x}%`,
            top: `${target.y}%`,
            transition: { duration: duration, ease: "linear" }
        });

        const arcPromise = heightControls.start({
            y: [0, -arcHeightPixels, 0],
            scale: [1, 1.3, 1],         
            rotate: `+${360 * rotations}deg`,
            transition: { duration: duration, ease: "easeInOut", times: [0, 0.5, 1] }
        });

        await Promise.all([movePromise, arcPromise]);

        // Squash эффект при ударе
        if (type === 'SPIKE' || type === 'SERVE') {
            heightControls.start({
                scaleX: [1, 1.25, 1],
                scaleY: [1, 0.75, 1],
                transition: { duration: 0.1 }
            });
        }

        posRef.current = target;
        setIsMoving(false);
    };

    // --- ГЛАВНАЯ ЛОГИКА ---
    useEffect(() => {
        if (!lastAction) return;

        const processAction = async () => {
            const { type, actorId, data = {} } = lastAction;

            // === 1. ПОДАЧА ===
            if (type === 'SERVE') {
                // Сначала убедимся, что мяч вылетает от подающего
                const startPos = getCoordinates('SERVE_START_AT_PLAYER', { playerId: actorId }, { myTeam, enemyTeam });
                teleportTo(startPos);

                const receiverPos = getCoordinates('PLAYER', { id: data.receiverId }, { myTeam, enemyTeam });

                // Эйс или ошибка
                if (data.winSide === 'ATTACK') {
                    // Просто летит в пол (или аут)
                    const missPos = { x: receiverPos.x, y: receiverPos.y }; 
                    await moveBall(missPos, 'SERVE');
                } 
                // Успешный прием
                else {
                    // А. Полет к принимающему
                    await moveBall(receiverPos, 'SERVE');
                    
                    // Б. АВТОМАТИЧЕСКАЯ ДОВОДКА К СВЯЗУЮЩЕМУ (СЕТТЕРУ)
                    // Определяем, чья команда принимала
                    const isMyReceiver = myTeam.some(p => p.id === data.receiverId);
                    
                    // Находим координаты "позиции связующего" для этой команды
                    // BoardUtils сам решит, где стоит связка (обычно зона 3 или 2)
                    const setterPos = getCoordinates('SETTER_POS', { isMySide: isMyReceiver }, { myTeam, enemyTeam });
                    
                    // Мяч летит от принимающего к связке
                    await moveBall(setterPos, 'RECEIVE');
                }
            }

            // === 2. ПАС (SET) ===
            else if (type === 'SET') {
                // Пас обычно идет от связки к нападающему
                // Можно добавить небольшую задержку или телепорт, если рассинхрон,
                // но обычно мяч уже там после 'RECEIVE'
                const isActorMyTeam = myTeam.some(p => p.id === actorId);
                let targetPos = { x: 50, y: 50 };
                
                if (lastAction.targetPos) {
                    targetPos = getCoordinates('ZONE', { zoneId: lastAction.targetPos, isMySide: isActorMyTeam }, { myTeam, enemyTeam });
                } else {
                    targetPos = getCoordinates('ZONE', { zoneId: 4, isMySide: isActorMyTeam }, { myTeam, enemyTeam });
                }
                await moveBall(targetPos, 'SET');
            }

            // === 3. АТАКА (SPIKE) ===
            else if (type === 'SPIKE') {
                const attackerPos = getCoordinates('PLAYER', { id: lastAction.attackerId }, { myTeam, enemyTeam });
                
                // Если был БЛОК
                if (data.winSide === 'DEFENSE') {
                     // Летит в блок (сетка напротив атакующего)
                     await moveBall({ x: attackerPos.x, y: 50 }, 'SPIKE');
                     // Отскакивает вниз
                     await moveBall({ x: attackerPos.x, y: attackerPos.y + (attackerPos.y > 50 ? 10 : -10) }, 'BLOCK_DROP');
                }
                // Успешная атака или Сейв
                else {
                    let endPos = { x: 50, y: 50 };
                    if (data.trajectory?.endId) {
                         endPos = getCoordinates('PLAYER', { id: data.trajectory.endId }, { myTeam, enemyTeam });
                    } else {
                        // Рандом в поле
                        const isMyAttack = myTeam.some(p => p.id === lastAction.attackerId);
                        endPos = { 
                            x: attackerPos.x + (Math.random() * 20 - 10),
                            y: isMyAttack ? 15 : 85 
                        };
                    }
                    await moveBall(endPos, 'SPIKE');

                    // Если это Сейв (DIG), мяч должен подскочить вверх
                    if (data.winSide !== 'ATTACK') {
                         // Небольшой подброс вверх после приема атаки
                         const digPopUp = { ...endPos, y: endPos.y + (endPos.y > 50 ? -5 : 5) };
                         await moveBall(digPopUp, 'RECEIVE'); 
                    }
                }
            }
        };

        processAction();
    }, [lastAction]);

    // --- ПРИВЯЗКА МЯЧА К ПОДАЮЩЕМУ ПРИ РОТАЦИИ ---
    // Это решает проблему "мяч не знает айди". 
    // Мы следим за turn (ID подающего) и myTeam/enemyTeam (позициями).
    // Если фаза подачи и мяч не летит - он всегда телепортируется в руки подающему.
    useEffect(() => {
        if (phase === 'SERVE' && !isMoving && !lastAction) {
            const coords = getCoordinates('SERVE_START_AT_PLAYER', { playerId: turn }, { myTeam, enemyTeam });
            if (coords) teleportTo(coords);
        }
    }, [phase, turn, myTeam, enemyTeam, isMoving, lastAction]);

    return (
        <motion.div
            animate={positionControls}
            initial={{ left: '50%', top: '50%' }}
            style={{ position: 'absolute', width: 0, height: 0, zIndex: 100, pointerEvents: 'none' }}
        >
            {/* Тень */}
            <motion.div
                animate={heightControls}
                style={{
                    position: 'absolute', width: '24px', height: '6px',
                    left: '-12px', top: '10px', borderRadius: '50%',
                    background: 'rgba(0,0,0,0.4)', filter: 'blur(3px)',
                }}
            />
            {/* Мяч */}
            <motion.div
                animate={heightControls}
                initial={{ y: 0, scale: 1 }}
                style={{
                    position: 'absolute', width: '20px', height: '20px',
                    left: '-10px', top: '-10px',
                }}
            >
                {/* SVG мяча (тот же что и раньше) */}
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                    <defs>
                        <radialGradient id="grad1" cx="35%" cy="35%" r="60%">
                            <stop offset="0%" style={{stopColor: '#fff', stopOpacity: 1}} />
                            <stop offset="100%" style={{stopColor: '#ddd', stopOpacity: 1}} />
                        </radialGradient>
                    </defs>
                    <circle cx="50" cy="50" r="48" fill="url(#grad1)" stroke="#333" strokeWidth="2"/>
                    <path d="M50 2 C 80 25, 80 75, 50 98" fill="none" stroke="#FFC107" strokeWidth="26" strokeLinecap="round" opacity="0.9" />
                    <path d="M50 2 C 20 25, 20 75, 50 98" fill="none" stroke="#003c8f" strokeWidth="26" strokeLinecap="round" opacity="0.9" />
                </svg>
            </motion.div>
        </motion.div>
    );
};

export default BallManager;