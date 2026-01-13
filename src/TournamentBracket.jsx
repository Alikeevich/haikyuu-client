import { useState } from 'react';
import { motion } from 'framer-motion';
import './TournamentBracket.css';

const AI_INFO = {
    PHANTOM: { name: 'Kitsune Academy', emoji: '🦊', color: '#9b59b6' },
    TACTICAL: { name: 'Shogi Masters', emoji: '♟️', color: '#3498db' },
    DATA: { name: 'Neural Storm', emoji: '🧠', color: '#e74c3c' },
    APEX: { name: 'Ryujin Killers', emoji: '🦅', color: '#f39c12' }
};

function TournamentBracket({ tournament, onPlayMatch, isPlaying }) {
    const [expandedMatch, setExpandedMatch] = useState(null);

    if (!tournament) return null;

    return (
        <div className="tournament-bracket-container">
            <div className="bracket-header">
                <h2>ТУРНИРНАЯ СЕТКА</h2>
                <div className="tournament-score">
                    <span className="wins">Побед: {tournament.wins}</span>
                    <span className="separator">|</span>
                    <span className="losses">Поражений: {tournament.losses}</span>
                </div>
            </div>

            <div className="bracket-matches">
                {tournament.matches.map((match, idx) => {
                    const aiInfo = AI_INFO[match.aiType];
                    const isActive = match.id === tournament.currentMatchId;
                    const isCompleted = match.status === 'COMPLETED';
                    
                    return (
                        <motion.div
                            key={match.id}
                            className={`match-card ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => setExpandedMatch(expandedMatch === match.id ? null : match.id)}
                        >
                            <div className="match-number">Матч {match.id}/4</div>
                            <div className="match-opponent" style={{ borderColor: aiInfo.color }}>
                                <span className="emoji">{aiInfo.emoji}</span>
                                <span className="name">{aiInfo.name}</span>
                            </div>

                            {isCompleted && (
                                <div className={`match-result ${match.result}`}>
                                    <div className="score">{match.playerScore} : {match.aiScore}</div>
                                    <div className="status">{match.result === 'WIN' ? '✅ ПОБЕДА' : '❌ ПОРАЖЕНИЕ'}</div>
                                </div>
                            )}

                            {isActive && !isPlaying && (
                                <button 
                                    className="btn-play-match"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onPlayMatch(match.id, match.aiType);
                                    }}
                                >
                                    ИГРАТЬ
                                </button>
                            )}

                            {isActive && isPlaying && (
                                <div className="match-status">МАТЧ ИДЁТ...</div>
                            )}

                            {match.status === 'UPCOMING' && !isActive && (
                                <div className="match-status">ОЖИДАНИЕ</div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

export default TournamentBracket;
