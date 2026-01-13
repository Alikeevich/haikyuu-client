import { motion } from 'framer-motion';
import './TournamentFinish.css';

function TournamentFinish({ tournament, onRestart }) {
    if (!tournament) return null;

    const totalMatches = tournament.totalMatches;
    const wins = tournament.wins;
    const losses = tournament.losses;
    const successRate = Math.round((wins / totalMatches) * 100);

    const getResult = () => {
        if (wins === 4) return { title: '🏆 АБСОЛЮТНЫЙ ЧЕМПИОН!', msg: 'Вы выиграли все матчи!' };
        if (wins === 3) return { title: '🥇 ЧЕМПИОН!', msg: 'Отличный результат!' };
        if (wins === 2) return { title: '🥈 ХОРОШИЙ РЕЗУЛЬТАТ', msg: 'Ничья в турнире' };
        if (wins === 1) return { title: '🥉 ПОПЫТКА', msg: 'Нужно тренироваться' };
        return { title: '💪 НАЧИНАЙТЕ СНАЧАЛА', msg: 'Вы проиграли все матчи' };
    };

    const result = getResult();

    return (
        <div className="tournament-finish-overlay">
            <motion.div 
                className="finish-card"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 100 }}
            >
                <div className="finish-header">{result.title}</div>
                <p className="finish-message">{result.msg}</p>

                <div className="tournament-stats">
                    <div className="stat-item">
                        <div className="stat-label">Побед</div>
                        <div className="stat-value wins">{wins}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-label">Поражений</div>
                        <div className="stat-value losses">{losses}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-label">Процент побед</div>
                        <div className="stat-value">{successRate}%</div>
                    </div>
                </div>

                <div className="progress-bar">
                    <div 
                        className="progress-fill" 
                        style={{ width: `${successRate}%` }}
                    ></div>
                </div>

                <button className="restart-btn" onClick={onRestart}>
                    ВЕРНУТЬСЯ В ЛОББИ
                </button>
            </motion.div>
        </div>
    );
}

export default TournamentFinish;
