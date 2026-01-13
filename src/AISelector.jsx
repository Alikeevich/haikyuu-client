import { useState } from 'react';
import { motion } from 'framer-motion';

const AI_TYPES = {
    PHANTOM: {
        name: 'Kitsune Academy',
        subtitle: '👻 Обманщики',
        description: 'Мастера блефа и психологических атак. Создают ложные паттерны и ломают ваши ожидания.',
        difficulty: 3,
        special: 'Feint Shot',
        specialDesc: 'Сброс на переднюю линию (30% шанс)',
        color: '#9b59b6',
        emoji: '🦊',
        tips: ['Не создавайте паттерны', 'Меняйте тактику', 'Ожидайте неожиданного']
    },
    TACTICAL: {
        name: 'Shogi Masters',
        subtitle: '♟️ Тактики',
        description: 'Позиционная игра по фазам. Атакуют по заранее продуманному плану и запоминают ваши слабости.',
        difficulty: 4,
        special: 'Synchronized Block',
        specialDesc: 'Двойной блок +15%',
        color: '#3498db',
        emoji: '♟️',
        tips: ['Избегайте предсказуемости', 'Меняйте зоны атак', 'Будьте гибкими']
    },
    DATA: {
        name: 'Neural Storm',
        subtitle: '🧠 Адаптивные',
        description: 'Анализируют каждое ваше действие. Учатся во время игры и становятся сильнее с каждым очком.',
        difficulty: 4,
        special: 'Analysis Mode',
        specialDesc: '+10% receive каждые 5 очков (макс +30%)',
        color: '#e74c3c',
        emoji: '🧠',
        tips: ['Не давайте им учиться', 'Прерывайте серии', 'Будьте непредсказуемы']
    },
    APEX: {
        name: 'Ryujin Killers',
        subtitle: '🦅 Хищники',
        description: 'Безжалостно находят ваше слабое звено и атакуют его. Умная геометрия и таргетинг.',
        difficulty: 5,
        special: 'Hunt Mode',
        specialDesc: '+20% power против слабейшего игрока',
        color: '#f39c12',
        emoji: '🦅',
        tips: ['Усильте защиту слабых', 'Распределяйте нагрузку', 'Готовьтесь к фокусу']
    },
    CHAOS: {
        name: 'Karasu Ranbu',
        subtitle: '🎲 Хаос',
        description: 'Непредсказуемая и дикая игра. Отлично для новичков и тренировки базовых навыков.',
        difficulty: 2,
        special: 'Wild Card',
        specialDesc: '15% критическая подача',
        color: '#95a5a6',
        emoji: '🎲',
        tips: ['Идеально для практики', 'Отработка основ', 'Расслабьтесь']
    }
};

function AISelector({ onSelect, onBack }) {
    const [selectedAI, setSelectedAI] = useState(null);
    const [hoveredAI, setHoveredAI] = useState(null);

    const handleSelect = (type) => {
        setSelectedAI(type);
        setTimeout(() => {
            onSelect(type);
        }, 300);
    };

    const renderDifficulty = (level) => {
        return '⭐'.repeat(level) + '☆'.repeat(5 - level);
    };

    return (
        <div className="ai-selector-container">
            {/* Фоновые эффекты */}
            <div className="ai-bg-effect"></div>
            <div className="ai-bg-glow"></div>

            <div className="ai-selector-header">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    ВЫБОР ПРОТИВНИКА
                </motion.h1>
                <motion.p 
                    className="subtitle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                >
                    Каждая команда обладает уникальной стратегией
                </motion.p>
            </div>

            <div className="ai-cards-grid">
                {Object.entries(AI_TYPES).map(([type, info], index) => (
                    <motion.div
                        key={type}
                        className={`ai-card ${selectedAI === type ? 'selected' : ''}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        whileHover={{ scale: 1.03, y: -8 }}
                        onClick={() => handleSelect(type)}
                        onMouseEnter={() => setHoveredAI(type)}
                        onMouseLeave={() => setHoveredAI(null)}
                        style={{
                            borderColor: hoveredAI === type ? info.color : 'rgba(255,255,255,0.1)',
                            boxShadow: hoveredAI === type 
                                ? `0 20px 50px ${info.color}60, inset 0 0 20px ${info.color}20` 
                                : '0 8px 16px rgba(0,0,0,0.4)'
                        }}
                    >
                        {/* Фоновый градиент карточки */}
                        <div className="ai-card-bg" style={{ background: `linear-gradient(135deg, ${info.color}15 0%, ${info.color}05 100%)` }}></div>

                        <div className="ai-card-emoji">{info.emoji}</div>
                        
                        <div className="ai-card-content">
                            <div className="ai-card-title">
                                <h3>{info.name}</h3>
                                <span className="ai-subtitle-small">{info.subtitle}</span>
                            </div>

                            <div className="ai-difficulty" style={{ borderColor: `${info.color}40` }}>
                                <span className="difficulty-label">Сложность</span>
                                <span className="difficulty-stars">{renderDifficulty(info.difficulty)}</span>
                            </div>

                            <p className="ai-description">{info.description}</p>

                            <motion.div 
                                className="ai-special"
                                style={{ 
                                    borderColor: `${info.color}60`,
                                    background: `${info.color}12`
                                }}
                            >
                                <div className="special-header">
                                    <span className="special-icon">✨</span>
                                    <strong>{info.special}</strong>
                                </div>
                                <p className="special-desc">{info.specialDesc}</p>
                            </motion.div>

                            {hoveredAI === type && (
                                <motion.div 
                                    className="ai-tips"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="tips-header">💡 Советы:</div>
                                    <ul>
                                        {info.tips.map((tip, idx) => (
                                            <motion.li 
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                            >
                                                {tip}
                                            </motion.li>
                                        ))}
                                    </ul>
                                </motion.div>
                            )}
                        </div>

                        <motion.button
                            className="ai-select-btn"
                            whileHover={{ scale: 1.05, boxShadow: `0 12px 30px ${info.color}80` }}
                            whileTap={{ scale: 0.93 }}
                            style={{ 
                                background: `linear-gradient(135deg, ${info.color} 0%, ${info.color}dd 100%)`,
                                boxShadow: `0 8px 20px ${info.color}40`
                            }}
                        >
                            ВЫБРАТЬ
                        </motion.button>
                    </motion.div>
                ))}
            </div>

            <motion.button 
                className="back-btn" 
                onClick={onBack}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                ← НАЗАД
            </motion.button>

            <style>{`
                .ai-selector-container {
                    position: relative;
                    width: 100%;
                    min-height: 100dvh;
                    background: linear-gradient(135deg, rgba(18, 18, 18, 0.98) 0%, rgba(5, 5, 5, 0.95) 100%);
                    padding: max(30px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(100px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left));
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: clamp(20px, 5vh, 40px);
                    overflow-y: auto;
                    overflow-x: hidden;
                    -webkit-user-select: none;
                    user-select: none;
                }

                /* Фоновые эффекты */
                .ai-bg-effect {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: 
                        radial-gradient(circle at 20% 50%, rgba(252, 163, 17, 0.08) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(102, 126, 234, 0.08) 0%, transparent 50%);
                    pointer-events: none;
                    z-index: -1;
                }

                .ai-bg-glow {
                    position: fixed;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(252, 163, 17, 0.03) 0%, transparent 70%);
                    animation: float 20s ease-in-out infinite;
                    pointer-events: none;
                    z-index: -1;
                }

                @keyframes float {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    25% { transform: translate(50px, -50px) rotate(90deg); }
                    50% { transform: translate(0, -100px) rotate(180deg); }
                    75% { transform: translate(-50px, -50px) rotate(270deg); }
                }

                .ai-selector-header {
                    text-align: center;
                    width: 100%;
                    max-width: 900px;
                    position: relative;
                    z-index: 1;
                }

                .ai-selector-header h1 {
                    font-family: 'Teko', sans-serif;
                    font-size: clamp(36px, 10vw, 72px);
                    margin: 0 0 15px 0;
                    background: linear-gradient(135deg, #fca311 0%, #ff6b00 50%, #fca311 100%);
                    background-size: 200% 200%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    line-height: 1;
                    font-weight: 900;
                    letter-spacing: 2px;
                    text-shadow: 0 4px 20px rgba(252, 163, 17, 0.3);
                    animation: gradientShift 3s ease infinite;
                }

                @keyframes gradientShift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }

                .ai-selector-header .subtitle {
                    color: #aaa;
                    font-size: clamp(13px, 4vw, 18px);
                    margin: 0;
                    line-height: 1.5;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    font-weight: 500;
                }

                .ai-cards-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: clamp(16px, 3vw, 24px);
                    width: 100%;
                    max-width: 100%;
                    padding: 0 var(--safe-area, 0);
                }

                @media (min-width: 600px) {
                    .ai-cards-grid {
                        grid-template-columns: repeat(2, 1fr);
                        max-width: 900px;
                        margin: 0 auto;
                    }
                }

                @media (min-width: 1100px) {
                    .ai-cards-grid {
                        grid-template-columns: repeat(3, 1fr);
                        max-width: 1400px;
                    }
                }

                @media (min-width: 1600px) {
                    .ai-cards-grid {
                        grid-template-columns: repeat(5, 1fr);
                        max-width: 100%;
                    }
                }

                .ai-card {
                    background: rgba(25, 25, 25, 0.95);
                    backdrop-filter: blur(10px);
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    border-radius: clamp(12px, 3vw, 20px);
                    padding: clamp(14px, 3vw, 24px);
                    cursor: pointer;
                    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    min-height: 380px;
                    -webkit-tap-highlight-color: transparent;
                }

                .ai-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%);
                    pointer-events: none;
                    border-radius: inherit;
                }

                .ai-card.selected {
                    transform: scale(1.03);
                    border-width: 3px;
                    z-index: 10;
                }

                .ai-card-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                    transition: opacity 0.3s;
                    z-index: 0;
                    border-radius: inherit;
                }

                .ai-card:hover .ai-card-bg,
                .ai-card.selected .ai-card-bg {
                    opacity: 1;
                }

                .ai-card-emoji {
                    font-size: clamp(52px, 15vw, 80px);
                    text-align: center;
                    margin-bottom: clamp(10px, 2vw, 16px);
                    filter: drop-shadow(0 6px 12px rgba(0,0,0,0.6));
                    line-height: 1;
                    position: relative;
                    z-index: 1;
                    animation: bounce-emoji 2s ease-in-out infinite;
                }

                @keyframes bounce-emoji {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }

                .ai-card-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: clamp(8px, 2vw, 12px);
                    position: relative;
                    z-index: 1;
                }

                .ai-card-title h3 {
                    font-family: 'Teko', sans-serif;
                    font-size: clamp(18px, 5vw, 32px);
                    margin: 0;
                    color: white;
                    text-align: center;
                    line-height: 1.1;
                    font-weight: 700;
                    letter-spacing: 1px;
                }

                .ai-subtitle-small {
                    display: block;
                    font-size: clamp(11px, 3vw, 14px);
                    color: #999;
                    text-align: center;
                    margin-top: 4px;
                    font-weight: 500;
                }

                .ai-difficulty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    padding: 10px;
                    background: rgba(0, 0, 0, 0.4);
                    border: 1px solid;
                    border-radius: 10px;
                    transition: all 0.3s;
                }

                .difficulty-label {
                    color: #888;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-size: clamp(10px, 2.5vw, 12px);
                }

                .difficulty-stars {
                    letter-spacing: 2px;
                    color: #ffd700;
                    font-size: clamp(13px, 3vw, 16px);
                }

                .ai-description {
                    font-size: clamp(11px, 3.5vw, 13px);
                    line-height: 1.6;
                    color: #ccc;
                    text-align: center;
                    margin: 0;
                    flex-grow: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: clamp(8px, 2vw, 12px);
                }

                .ai-special {
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid;
                    border-radius: 10px;
                    padding: clamp(10px, 2vw, 14px);
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    position: relative;
                    overflow: hidden;
                }

                .ai-special::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%);
                    animation: shimmer 2s infinite;
                }

                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                .special-header {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-bottom: 4px;
                    font-size: clamp(10px, 3vw, 12px);
                    font-weight: 700;
                    position: relative;
                    z-index: 1;
                }

                .special-icon {
                    font-size: clamp(14px, 3vw, 16px);
                    animation: rotate 3s linear infinite;
                }

                @keyframes rotate {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .special-desc {
                    font-size: clamp(9px, 2.5vw, 11px);
                    color: #ddd;
                    margin: 0;
                    line-height: 1.4;
                    position: relative;
                    z-index: 1;
                }

                .ai-tips {
                    background: rgba(255, 255, 255, 0.08);
                    border-radius: 8px;
                    padding: clamp(10px, 2vw, 12px);
                    margin-top: 8px;
                    overflow: hidden;
                    border: 1px solid rgba(252, 163, 17, 0.3);
                }

                .tips-header {
                    font-size: clamp(10px, 3vw, 12px);
                    font-weight: 700;
                    color: #fca311;
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .ai-tips ul {
                    margin: 0;
                    padding-left: 16px;
                    font-size: clamp(9px, 2.5vw, 11px);
                    color: #ccc;
                    line-height: 1.6;
                }

                .ai-tips li {
                    margin-bottom: 4px;
                    transition: all 0.2s;
                }

                .ai-tips li:hover {
                    color: #fca311;
                    margin-left: 4px;
                }

                .ai-select-btn {
                    width: 100%;
                    padding: clamp(10px, 2vw, 14px);
                    border: none;
                    border-radius: 8px;
                    font-family: 'Teko', sans-serif;
                    font-size: clamp(14px, 4vw, 18px);
                    color: white;
                    cursor: pointer;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-top: auto;
                    font-weight: 700;
                    transition: all 0.2s;
                    -webkit-tap-highlight-color: transparent;
                    position: relative;
                    z-index: 2;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                }

                .ai-select-btn:active {
                    filter: brightness(0.9);
                }

                .back-btn {
                    padding: 12px 32px;
                    background: transparent;
                    border: 2px solid #444;
                    color: #aaa;
                    border-radius: 8px;
                    font-family: 'Teko', sans-serif;
                    font-size: clamp(14px, 4vw, 18px);
                    cursor: pointer;
                    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    width: auto;
                    margin-bottom: clamp(10px, 3vw, 20px);
                    position: relative;
                    z-index: 5;
                    font-weight: 600;
                }

                .back-btn:active {
                    transform: scale(0.95);
                }

                @media (hover: hover) {
                    .back-btn:hover {
                        border-color: #fca311;
                        color: #fca311;
                        box-shadow: 0 0 15px rgba(252, 163, 17, 0.4);
                    }
                }

                /* === МОБИЛЬНАЯ АДАПТАЦИЯ === */
                @media (max-width: 600px) {
                    .ai-selector-container {
                        padding-top: max(20px, env(safe-area-inset-top));
                        padding-bottom: max(80px, env(safe-area-inset-bottom));
                    }

                    .ai-card {
                        min-height: 340px;
                    }
                }

                @media (max-width: 380px) {
                    .ai-card-emoji {
                        margin-bottom: 8px;
                    }

                    .ai-card {
                        padding: 12px;
                    }
                }
            `}</style>
        </div>
    );
}

export default AISelector;