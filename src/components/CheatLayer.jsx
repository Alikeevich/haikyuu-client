import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBallTargetCoordinates, getPlayerCoordinates } from '../utils/BoardUtils';

const CheatLayer = ({ lastAction, myTeam, enemyTeam, myId }) => {
    const [isCheatActive, setCheatActive] = useState(false);
    const [targetPos, setTargetPos] = useState(null);
    const timerRef = useRef(null);

    // === 1. ЛОГИКА АКТИВАЦИИ (LONG PRESS) ===
    const handleStart = () => {
        timerRef.current = setTimeout(() => {
            // Чит активирован!
            setCheatActive(prev => !prev);
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // Вибрация "бзз-бзз"
            console.log("🕵️ CHEAT MODE TOGGLED");
        }, 3000); // 3 секунды удержания
    };

    const handleEnd = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    };

    // === 2. ВЫЧИСЛЕНИЕ БУДУЩЕЙ ПОЗИЦИИ (ПРОСМОТР В БУДУЩЕЕ) ===
    useEffect(() => {
        if (!isCheatActive || !lastAction) return;

        const { type, actorId, data, targetPos: setZone } = lastAction;
        const isEnemyAction = !myTeam.some(p => p.id === actorId);

        // Нас интересуют только действия ВРАГА, которые мы не должны видеть
        if (isEnemyAction) {
            let predictedPos = null;

            // Если враг пасует (SET) - показываем, в какую зону (2, 3, 4) полетит пас
            if (type === 'SET') {
                const zoneId = setZone || 4;
                // Получаем координаты зоны НА СТОРОНЕ ВРАГА
                predictedPos = getBallTargetCoordinates('ZONE', { zoneId, isMySide: false }, { myTeam, enemyTeam });
                
                // Если пайп - сдвигаем
                if (zoneId === 3) predictedPos.y -= 10;
            }
            
            // Если враг бьет (SPIKE) - показываем, куда приземлится мяч
            else if (type === 'SPIKE') {
                if (data.trajectory?.endId) {
                    // Летит в игрока
                    predictedPos = getPlayerCoordinates(data.trajectory.endId, myTeam, enemyTeam);
                } else {
                    // Летит в зону (в пол)
                    predictedPos = getBallTargetCoordinates('ZONE', { zoneId: 6, isMySide: true }, { myTeam, enemyTeam });
                }
            }

            setTargetPos(predictedPos);
        } else {
            setTargetPos(null); // Скрываем, если действие наше
        }

    }, [lastAction, isCheatActive, myTeam, enemyTeam]);

    return (
        <>
            {/* === НЕВИДИМАЯ КНОПКА АКТИВАЦИИ === */}
            {/* Размещаем её поверх "VS" в ScoreBoard */}
            <div 
                style={{
                    position: 'fixed',
                    top: '35px', // Подгони под VS
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60px',
                    height: '40px',
                    zIndex: 10000,
                    // background: 'rgba(255,0,0,0.3)', // РАСКОММЕНТИРУЙ, ЧТОБЫ НАЙТИ ЕЁ, ПОТОМ УБЕРИ
                    cursor: 'pointer'
                }}
                onTouchStart={handleStart}
                onTouchEnd={handleEnd}
                onMouseDown={handleStart} // Для теста на ПК
                onMouseUp={handleEnd}
            />

            {/* === ИНДИКАТОР ВКЛЮЧЕНИЯ === */}
            <AnimatePresence>
                {isCheatActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'absolute', top: '10px', left: '10px',
                            color: 'red', fontSize: '10px', fontFamily: 'monospace',
                            zIndex: 9999, pointerEvents: 'none'
                        }}
                    >
                        [HACK_MODE: ON]
                    </motion.div>
                )}
            </AnimatePresence>

            {/* === ПРИЦЕЛ (TARGET RETICLE) === */}
            <AnimatePresence>
                {isCheatActive && targetPos && (
                    <motion.div
                        initial={{ scale: 2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        style={{
                            position: 'absolute',
                            left: `${targetPos.x}%`,
                            top: `${targetPos.y}%`,
                            transform: 'translate(-50%, -50%)',
                            width: '40px',
                            height: '40px',
                            zIndex: 80, // Под мячом, но над полом
                            pointerEvents: 'none'
                        }}
                    >
                        {/* Анимация вращающегося прицела */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            style={{ width: '100%', height: '100%' }}
                        >
                            <svg viewBox="0 0 100 100" fill="none" stroke="red" strokeWidth="4">
                                <circle cx="50" cy="50" r="40" strokeDasharray="10 15" />
                                <line x1="50" y1="0" x2="50" y2="20" />
                                <line x1="50" y1="80" x2="50" y2="100" />
                                <line x1="0" y1="50" x2="20" y2="50" />
                                <line x1="80" y1="50" x2="100" y2="50" />
                                <circle cx="50" cy="50" r="5" fill="red" />
                            </svg>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default CheatLayer;