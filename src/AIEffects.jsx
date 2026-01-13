import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================== PHANTOM: FEINT SHOT ====================
export const FeintEffect = ({ isActive }) => {
    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        zIndex: 100
                    }}
                >
                    {/* Фиолетовая дымка */}
                    <motion.div
                        animate={{
                            opacity: [0, 0.3, 0],
                            scale: [0.8, 1.2, 1]
                        }}
                        transition={{ duration: 0.6 }}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '80%',
                            height: '80%',
                            background: 'radial-gradient(circle, rgba(155, 89, 182, 0.4) 0%, transparent 70%)',
                            borderRadius: '50%'
                        }}
                    />
                    
                    {/* Лисий силуэт */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: [0, 1.5, 0], rotate: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '120px',
                            opacity: 0.6,
                            filter: 'drop-shadow(0 0 20px rgba(155, 89, 182, 0.8))'
                        }}
                    >
                        🦊
                    </motion.div>

                    {/* Текст */}
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            position: 'absolute',
                            top: '60%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontFamily: 'Teko, sans-serif',
                            fontSize: '48px',
                            color: '#9b59b6',
                            textShadow: '0 0 20px rgba(155, 89, 182, 0.8)',
                            fontWeight: 'bold',
                            letterSpacing: '3px'
                        }}
                    >
                        FEINT SHOT
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ==================== TACTICAL: SYNCHRONIZED BLOCK ====================
export const SyncBlockEffect = ({ isActive, blockPos }) => {
    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        zIndex: 100
                    }}
                >
                    {/* Синяя волна */}
                    <motion.div
                        animate={{
                            scale: [1, 1.5],
                            opacity: [0.6, 0]
                        }}
                        transition={{ duration: 0.8, repeat: 2 }}
                        style={{
                            position: 'absolute',
                            top: '40%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '300px',
                            height: '300px',
                            border: '4px solid #3498db',
                            borderRadius: '50%'
                        }}
                    />

                    {/* Шахматная фигура */}
                    <motion.div
                        animate={{ 
                            rotate: [0, 360],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{ duration: 1 }}
                        style={{
                            position: 'absolute',
                            top: '40%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '80px',
                            filter: 'drop-shadow(0 0 20px rgba(52, 152, 219, 0.8))'
                        }}
                    >
                        ♟️
                    </motion.div>

                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        style={{
                            position: 'absolute',
                            top: '55%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontFamily: 'Teko, sans-serif',
                            fontSize: '36px',
                            color: '#3498db',
                            textShadow: '0 0 20px rgba(52, 152, 219, 0.8)',
                            fontWeight: 'bold'
                        }}
                    >
                        SYNCHRONIZED BLOCK
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ==================== DATA: ANALYSIS MODE ====================
export const AnalysisModeEffect = ({ isActive, bonus }) => {
    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        zIndex: 150
                    }}
                >
                    {/* Матричный эффект */}
                    <motion.div
                        animate={{
                            opacity: [0, 0.8, 0]
                        }}
                        transition={{ duration: 1, repeat: 2 }}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '400px',
                            height: '400px',
                            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(231, 76, 60, 0.1) 2px, rgba(231, 76, 60, 0.1) 4px)',
                            borderRadius: '50%'
                        }}
                    />

                    {/* Мозг */}
                    <motion.div
                        animate={{ 
                            scale: [1, 1.3, 1],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 0.8 }}
                        style={{
                            fontSize: '100px',
                            textAlign: 'center',
                            filter: 'drop-shadow(0 0 30px rgba(231, 76, 60, 0.8))'
                        }}
                    >
                        🧠
                    </motion.div>

                    {/* Текст с бонусом */}
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        style={{
                            position: 'absolute',
                            top: '120px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontFamily: 'Teko, sans-serif',
                            fontSize: '40px',
                            color: '#e74c3c',
                            textShadow: '0 0 20px rgba(231, 76, 60, 0.8)',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        SYSTEM CALIBRATED
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        style={{
                            position: 'absolute',
                            top: '165px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontFamily: 'Teko, sans-serif',
                            fontSize: '60px',
                            color: '#2ecc71',
                            textShadow: '0 0 30px rgba(46, 204, 113, 0.8)',
                            fontWeight: 'bold'
                        }}
                    >
                        +{bonus}%
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ==================== APEX: HUNT MODE ====================
export const HuntModeEffect = ({ isActive, targetName }) => {
    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        zIndex: 100
                    }}
                >
                    {/* Прицел */}
                    <motion.div
                        animate={{
                            scale: [1.5, 1],
                            opacity: [0, 1]
                        }}
                        transition={{ duration: 0.5 }}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <svg width="200" height="200" viewBox="0 0 200 200">
                            <motion.circle
                                cx="100"
                                cy="100"
                                r="80"
                                fill="none"
                                stroke="#f39c12"
                                strokeWidth="3"
                                strokeDasharray="10 15"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                            <line x1="100" y1="20" x2="100" y2="40" stroke="#f39c12" strokeWidth="3" />
                            <line x1="100" y1="160" x2="100" y2="180" stroke="#f39c12" strokeWidth="3" />
                            <line x1="20" y1="100" x2="40" y2="100" stroke="#f39c12" strokeWidth="3" />
                            <line x1="160" y1="100" x2="180" y2="100" stroke="#f39c12" strokeWidth="3" />
                            <circle cx="100" cy="100" r="5" fill="#f39c12" />
                        </svg>
                    </motion.div>

                    {/* Орел */}
                    <motion.div
                        animate={{ 
                            y: [0, -20, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{
                            position: 'absolute',
                            top: '35%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '80px',
                            filter: 'drop-shadow(0 0 20px rgba(243, 156, 18, 0.8))'
                        }}
                    >
                        🦅
                    </motion.div>

                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        style={{
                            position: 'absolute',
                            top: '65%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            textAlign: 'center'
                        }}
                    >
                        <div style={{
                            fontFamily: 'Teko, sans-serif',
                            fontSize: '40px',
                            color: '#f39c12',
                            textShadow: '0 0 20px rgba(243, 156, 18, 0.8)',
                            fontWeight: 'bold'
                        }}>
                            🎯 TARGET LOCKED
                        </div>
                        {targetName && (
                            <div style={{
                                fontFamily: 'Montserrat, sans-serif',
                                fontSize: '24px',
                                color: '#e74c3c',
                                textShadow: '0 0 15px rgba(231, 76, 60, 0.6)',
                                marginTop: '10px',
                                fontWeight: 'bold'
                            }}>
                                {targetName}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ==================== CHAOS: WILD CARD ====================
export const WildCardEffect = ({ isActive }) => {
    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        zIndex: 100
                    }}
                >
                    {/* Хаотичные частицы */}
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{
                                x: '50%',
                                y: '50%',
                                scale: 0
                            }}
                            animate={{
                                x: `${Math.random() * 100}%`,
                                y: `${Math.random() * 100}%`,
                                scale: [0, 1, 0],
                                rotate: Math.random() * 360
                            }}
                            transition={{
                                duration: 0.8,
                                delay: Math.random() * 0.3
                            }}
                            style={{
                                position: 'absolute',
                                width: '20px',
                                height: '20px',
                                background: `hsl(${Math.random() * 360}, 70%, 60%)`,
                                borderRadius: '50%'
                            }}
                        />
                    ))}

                    {/* Игральные кости */}
                    <motion.div
                        animate={{ 
                            rotate: [0, 360, 720],
                            scale: [0, 1.5, 1]
                        }}
                        transition={{ duration: 1 }}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '100px',
                            filter: 'drop-shadow(0 0 30px rgba(149, 165, 166, 0.8))'
                        }}
                    >
                        🎲
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ duration: 0.6 }}
                        style={{
                            position: 'absolute',
                            top: '65%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontFamily: 'Teko, sans-serif',
                            fontSize: '48px',
                            color: '#95a5a6',
                            textShadow: '0 0 20px rgba(149, 165, 166, 0.8)',
                            fontWeight: 'bold'
                        }}
                    >
                        WILD CARD!
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ==================== ГЛАВНЫЙ КОМПОНЕНТ-ОБЕРТКА ====================
const AIEffects = ({ effect, data = {} }) => {
    const [showEffect, setShowEffect] = useState(false);

    useEffect(() => {
        if (effect) {
            setShowEffect(true);
            const timer = setTimeout(() => setShowEffect(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [effect]);

    return (
        <>
            {effect === 'FEINT' && <FeintEffect isActive={showEffect} />}
            {effect === 'SYNC_BLOCK' && <SyncBlockEffect isActive={showEffect} blockPos={data.blockPos} />}
            {effect === 'ANALYSIS' && <AnalysisModeEffect isActive={showEffect} bonus={data.bonus} />}
            {effect === 'HUNT' && <HuntModeEffect isActive={showEffect} targetName={data.targetName} />}
            {effect === 'WILD_CARD' && <WildCardEffect isActive={showEffect} />}
        </>
    );
};

export default AIEffects;