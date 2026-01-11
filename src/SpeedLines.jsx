import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SpeedLines = ({ isActive }) => {
    return (
        <AnimatePresence>
            {isActive && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, width: '100%', height: '100%',
                        zIndex: 40, // Под интерфейсом, но над полем
                        pointerEvents: 'none',
                        background: 'radial-gradient(circle, transparent 40%, black 120%)',
                        overflow: 'hidden'
                    }}
                >
                    {/* Генерируем 20 линий */}
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                width: '200%',
                                height: '2px',
                                background: 'rgba(255, 255, 255, 0.15)',
                                transformOrigin: 'left center',
                                rotate: i * 18, // Распределяем по кругу (360 / 20)
                            }}
                            animate={{
                                x: ['0%', '-50%'], // Движение от центра или к центру
                                opacity: [0, 1, 0],
                                width: ['100%', '200%']
                            }}
                            transition={{
                                duration: 0.2,
                                repeat: Infinity,
                                ease: "linear",
                                delay: Math.random() * 0.1
                            }}
                        />
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SpeedLines;