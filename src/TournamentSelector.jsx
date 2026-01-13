import { useState } from 'react';
import { motion } from 'framer-motion';
import './TournamentSelector.css';

function TournamentSelector({ onStart, onBack }) {
    return (
        <div className="tournament-selector-container">
            <motion.div 
                className="tournament-intro"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="trophy-icon">🏆</div>
                <h1>ТУРНИР</h1>
                <p className="subtitle">Вызовите всех ИИ подряд</p>
                <div className="tournament-rules">
                    <h3>Правила турнира:</h3>
                    <ul>
                        <li>✅ Один состав на весь турнир</li>
                        <li>✅ 4 матча против разных ИИ</li>
                        <li>✅ Случайный порядок противников</li>
                        <li>✅ Победитель - тот кто выигрывает больше матчей</li>
                    </ul>
                </div>
                <div className="button-group">
                    <button className="btn-tournament-start" onClick={onStart}>
                        НАЧАТЬ ТУРНИР 🚀
                    </button>
                    <button className="btn-secondary" onClick={onBack}>
                        НАЗАД
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default TournamentSelector;
