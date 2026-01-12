import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBallTargetCoordinates } from '../utils/BoardUtils';

const CheatLayer = ({ lastAction, myTeam, enemyTeam, myId }) => {
    const [isCheatActive, setCheatActive] = useState(false);
    const [targetPos, setTargetPos] = useState(null);
    const [clickCount, setClickCount] = useState(0);

    // === АКТИВАЦИЯ: 5 КЛИКОВ ПО VS ===
    const handleClick = () => {
        const newCount = clickCount + 1;
        setClickCount(newCount);

        if (newCount >= 5) {
            setCheatActive(prev => !prev);
            setClickCount(0);
            if (navigator.vibrate) navigator.vibrate(200);
        }

        // Сброс счетчика через 2 секунды
        setTimeout(() => setClickCount(0), 2000);
    };

    // === ПОКАЗЫВАЕМ ТОЛЬКО КУДА БЫЛ СДЕЛАН СЕТ (ТОЛЬКО В ЧИТ-РЕЖИМЕ) ===
    useEffect(() => {
        // Без активного чита - НИЧЕГО не показываем (обычная игра)
        if (!isCheatActive || !lastAction) {
            setTargetPos(null);
            return;
        }

        const { type, actorId, targetPos } = lastAction;
        const isEnemyAction = !myTeam.some(p => p.id === actorId);

        // Только вражеский SET с известной позицией
        if (isEnemyAction && type === 'SET' && targetPos) {
            const pos = getBallTargetCoordinates(
                'ZONE', 
                { zoneId: targetPos, isMySide: false }, 
                { myTeam, enemyTeam }
            );
            setTargetPos(pos);
        } else {
            setTargetPos(null);
        }

    }, [lastAction, isCheatActive, myTeam, enemyTeam]);

    return (
        <>
            {/* КНОПКА АКТИВАЦИИ (5 КЛИКОВ) */}
            <div 
                onClick={handleClick}
                style={{
                    position: 'fixed',
                    top: '35px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60px',
                    height: '40px',
                    zIndex: 10000,
                    cursor: 'pointer'
                }}
            />

            {/* ИНДИКАТОР */}
            {isCheatActive && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    color: 'red',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    zIndex: 9999
                }}>
                    [VISION]
                </div>
            )}

            {/* ПРИЦЕЛ */}
            <AnimatePresence>
                {isCheatActive && targetPos && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        style={{
                            position: 'absolute',
                            left: `${targetPos.x}%`,
                            top: `${targetPos.y}%`,
                            transform: 'translate(-50%, -50%)',
                            width: '40px',
                            height: '40px',
                            zIndex: 80,
                            pointerEvents: 'none'
                        }}
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            style={{ width: '100%', height: '100%' }}
                        >
                            <svg viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="red" strokeWidth="4" strokeDasharray="10 15" />
                                <line x1="50" y1="0" x2="50" y2="20" stroke="red" strokeWidth="3" />
                                <line x1="50" y1="80" x2="50" y2="100" stroke="red" strokeWidth="3" />
                                <line x1="0" y1="50" x2="20" y2="50" stroke="red" strokeWidth="3" />
                                <line x1="80" y1="50" x2="100" y2="50" stroke="red" strokeWidth="3" />
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