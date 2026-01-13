import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Lobby from './Lobby';
import Draft from './Draft';
import MatchBoard from './MatchBoard';
import './App.css';
import MusicPlayer from './MusicPlayer';
import GameOver from './GameOver';
import AIEffects from './AIEffects';
import TournamentBracket from './TournamentBracket';
import TournamentFinish from './TournamentFinish';
import { playSound } from './SoundManager';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";
const socket = io.connect(SOCKET_URL);

function App() {
    const [gameState, setGameState] = useState('lobby');
    const [roomId, setRoomId] = useState("");
    const [myId, setMyId] = useState("");
    const [notification, setNotification] = useState("");
    const [triggerShake, setTriggerShake] = useState(false);
    const [allCharacters, setAllCharacters] = useState([]);
    const [draftTurn, setDraftTurn] = useState(null);
    const [triggerLegendary, setTriggerLegendary] = useState(false);
    const [gameOverData, setGameOverData] = useState(null);
    const [teams, setTeams] = useState({ myTeam: [], enemyTeam: [] });
    const [myTeamIndex, setMyTeamIndex] = useState(null);
    const [turn, setTurn] = useState("");
    const [score, setScore] = useState({ team1: 0, team2: 0 });
    const [gameLog, setGameLog] = useState("");
    const [phase, setPhase] = useState('SERVE');
    const [ballTarget, setBallTarget] = useState(null);
    const [lastAction, setLastAction] = useState(null);
    const [isActionPending, setActionPending] = useState(false);
    
    // 🏆 НОВОЕ: Состояния для турнира
    const [isTournament, setIsTournament] = useState(false);
    const [tournamentData, setTournamentData] = useState(null);
    const [tournamentFinished, setTournamentFinished] = useState(null);
    const [currentMatchId, setCurrentMatchId] = useState(null);
    
    // 🤖 НОВОЕ: Состояния для AI эффектов
    const [aiEffect, setAIEffect] = useState(null);
    const [aiEffectData, setAIEffectData] = useState({});

    useEffect(() => {
        socket.on('connect', () => setMyId(socket.id));
        socket.on('error_message', (msg) => alert(msg));

        const onGameCreated = (id) => {
            setRoomId(id);
            setNotification(`Комната создана: ${id}`);
        };

        const onGameStarted = (data) => {
            setAllCharacters(data.allCharacters);
            setGameState('draft');
            setRoomId(data.roomId);
            setIsTournament(data.isTournament || false);
            setNotification("Драфт начался! Выбирай карты.");
        };

        const onMatchStart = (data) => {
            const amIPlayer1 = socket.id === data.players[0];
            setMyTeamIndex(amIPlayer1 ? 1 : 2);
            
            setTeams({ 
                myTeam: amIPlayer1 ? data.team1 : data.team2, 
                enemyTeam: amIPlayer1 ? data.team2 : data.team1 
            });

            setTurn(data.turn);
            setScore(data.score);
            
            if (data.isTournament) {
                setCurrentMatchId(data.matchId);
            }
            
            setGameState('match');
            setNotification("Матч начинается!");
            setPhase('SERVE');
            
            setTimeout(() => playSound('whistle'), 300);
        };

        const onGameOver = (data) => {
            playSound('whistle');
            setGameOverData(data);
        };

        // 🏆 ТУРНИР: Турнир начался
        const onTournamentStarted = (data) => {
            setTournamentData(data.tournament);
            setGameState('tournament');
            setNotification("Турнир начался!");
        };

        // 🏆 ТУРНИР: Результат матча
        const onMatchResult = (data) => {
            setTournamentData(data.tournament);
            setNotification(data.playerWon ? '✅ Матч выигран!' : '❌ Матч проигран!');
        };

        // 🏆 ТУРНИР: Следующий матч
        const onNextTournamentMatch = (data) => {
            setNotification(`Следующий противник: ${data.aiType}`);
        };

        // 🏆 ТУРНИР: Турнир закончен
        const onTournamentFinished = (data) => {
            setTournamentFinished(data);
            setNotification('Турнир закончен!');
        };

        // 🤖 НОВОЕ: Слушатель AI эффектов
        const onAIEffect = (data) => {
            console.log('🎨 AI Effect:', data);
            setAIEffect(data.type);
            setAIEffectData(data.data || {});
            
            // Автоматически сбрасываем через 2 секунды
            setTimeout(() => {
                setAIEffect(null);
                setAIEffectData({});
            }, 2000);
        };

        socket.on('game_created', onGameCreated);
        socket.on('game_started', onGameStarted);
        socket.on('match_start', onMatchStart);
        socket.on('game_over', onGameOver);
        socket.on('draft_turn', (data) => setDraftTurn(data.turn));
        socket.on('ai_effect', onAIEffect);
        socket.on('tournament_started', onTournamentStarted);
        socket.on('match_result', onMatchResult);
        socket.on('next_tournament_match', onNextTournamentMatch);
        socket.on('tournament_finished', onTournamentFinished);

        return () => {
            socket.off('connect');
            socket.off('game_created');
            socket.off('game_started');
            socket.off('match_start');
            socket.off('game_over');
            socket.off('draft_turn');
            socket.off('error_message');
            socket.off('ai_effect');
            socket.off('tournament_started');
            socket.off('match_result');
            socket.off('next_tournament_match');
            socket.off('tournament_finished');
        };
    }, []);

    useEffect(() => {
        const onServeResult = (data) => {
            console.log('🎾 SERVE RESULT:', data.message);

            setScore(data.score);
            setTurn(data.nextTurn);
            setNotification(data.message);
            setGameLog(prev => prev + '\n' + data.message);
            if (data.phase) setPhase(data.phase);
            
            setLastAction({ 
                type: 'SERVE', 
                actorId: data.serverId, 
                ts: Date.now(),
                data: data
            });
            setActionPending(false);
            
            const msg = data.message.toLowerCase();

            if (msg.includes("эйс")) {
                console.log('🔊 Играем: serve + whistle (ЭЙС)');
                playSound('serve');
                if (data.isCritical) {
                    setTriggerShake(true);
                    setTimeout(() => setTriggerShake(false), 500);
                }
                setTimeout(() => playSound('whistle'), 800);
            } else {
                console.log('🔊 Играем: bump (прием)');
                playSound('bump');
            }
            
            // 🤖 НОВОЕ: Wild Card эффект
            if (msg.includes('wild card')) {
                setAIEffect('WILD_CARD');
                setTimeout(() => setAIEffect(null), 2000);
            }
        };

        const onSetResult = (data) => {
            console.log('🏐 SET RESULT:', data.message);
            
            setTurn(data.nextTurn);      
            setPhase(data.phase);
            setBallTarget(data.targetPos);
            setNotification(data.message);
            setGameLog(prev => prev + '\n' + data.message);
            
            playSound('set');
            
            setLastAction({ type: 'SET', actorId: data.setterId, targetPos: data.targetPos, ts: Date.now() });
            setActionPending(false);
            
            // 🤖 НОВОЕ: Feint Shot эффект
            const msg = data.message.toLowerCase();
            if (msg.includes('feint') || msg.includes('сброс')) {
                setAIEffect('FEINT');
                setTimeout(() => setAIEffect(null), 2000);
            }
        };

        const onSetMade = (data) => {
            console.log('🏐 SET MADE:', data.message);
            
            setTurn(data.nextTurn);
            setPhase(data.phase);
            setBallTarget(null);
            setNotification(data.message);
            setGameLog(prev => prev + '\n' + data.message);
            
            playSound('set');
            
            setLastAction({ type: 'SET', actorId: data.setterId, targetPos: data.targetPos, ts: Date.now() });
            setActionPending(false);
        };

        const onSpikeResult = (data) => {
            console.log('💥 SPIKE RESULT:', data.message, '| Details:', data.details);
            setActionPending(false);
            
            setScore(data.score);
            setTurn(data.nextTurn);
            setPhase(data.phase);
            setBallTarget(null);
            
            if (data.team1 && data.team2 && myTeamIndex) {
                setTeams({
                    myTeam: myTeamIndex === 1 ? data.team1 : data.team2,
                    enemyTeam: myTeamIndex === 1 ? data.team2 : data.team1
                });
            }

            setNotification(data.message);
            setGameLog(prev => prev + '\n' + `${data.message} (${data.details})`);
            setLastAction({ type: 'SPIKE', ts: Date.now(), data: data });
            
            const msg = data.message.toLowerCase();
            const details = (data.details || '').toLowerCase();

            if (data.isCritical) {
                setTriggerShake(true);
                setTimeout(() => setTriggerShake(false), 500);
            }

            if (data.isLegendary) {
                setTriggerLegendary(true);
                setTimeout(() => setTriggerLegendary(false), 600);
            }

            // 🤖 НОВОЕ: Обнаружение AI эффектов в сообщениях
            if (msg.includes('синхронный блок') || msg.includes('synchronized')) {
                setAIEffect('SYNC_BLOCK');
                setAIEffectData({ blockPos: data.blockPos });
                setTimeout(() => setAIEffect(null), 2000);
            }
            
            if (msg.includes('hunt mode') || msg.includes('целимся в')) {
                setAIEffect('HUNT');
                setAIEffectData({ targetName: data.targetName });
                setTimeout(() => setAIEffect(null), 2000);
            }

            // Звуки
            if (msg.includes("monster block") || msg.includes("заблокировал")) {
                console.log('🔊 Играем: monster_block + whistle (KILL BLOCK)');
                playSound('monster_block');
                setTimeout(() => playSound('whistle'), 700);
            } else if (msg.includes("гол") || msg.includes("пробил защиту")) {
                console.log('🔊 Играем: spike + whistle (ГОЛ)');
                playSound('spike');
                setTimeout(() => playSound('whistle'), 700);
            } else if (msg.includes("смягчение")) {
                console.log('🔊 Играем: soft_block (смягчение)');
                playSound('soft_block');
            } else if (msg.includes("чистая сетка")) {
                console.log('🔊 Играем: spike (чистая)');
                playSound('spike');
            } else if (msg.includes("тащит") || msg.includes("поднял")) {
                console.log('🔊 Играем: bump (защита)');
                playSound('bump');
            } else {
                console.log('🔊 Играем: bump (fallback)');
                playSound('bump');
            }
        };

        // 🤖 НОВОЕ: Слушатель системных логов (для Analysis Mode)
        const onGameLogMessage = (data) => {
            if (data.message.includes('SYSTEM CALIBRATED')) {
                const bonusMatch = data.message.match(/\+(\d+)%/);
                const bonus = bonusMatch ? parseInt(bonusMatch[1]) : 10;
                
                setAIEffect('ANALYSIS');
                setAIEffectData({ bonus });
                setTimeout(() => setAIEffect(null), 2000);
            }
            
            setGameLog(prev => prev + '\n' + data.message);
        };

        socket.on('spike_result', onSpikeResult);
        socket.on('serve_result', onServeResult);
        socket.on('set_result', onSetResult);
        socket.on('set_made', onSetMade);
        socket.on('game_log', onGameLogMessage);

        return () => {
            socket.off('serve_result');
            socket.off('set_result');
            socket.off('spike_result');
            socket.off('set_made');
            socket.off('game_log');
        };
    }, [myTeamIndex]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(""), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleServe = () => {
        if (isActionPending) return;
        setActionPending(true);
        socket.emit('action_serve', { roomId });
    };
    
    const handleSet = (targetPos) => {
        if (isActionPending) return;
        setActionPending(true);
        socket.emit('action_set', { roomId, targetPos });
    };
    
    const handleBlock = (blockPos) => {
        if (isActionPending) return;
        setActionPending(true);
        socket.emit('action_block', { roomId, blockPos });
    };
    
    const handleRestart = () => {
        window.location.reload();
    };

    const handlePlayTournamentMatch = (matchId, aiType) => {
        socket.emit('start_tournament_match', { roomId, matchId });
    };

    return (
        <div className="app">
            {notification && <div className="notification">{notification}</div>}

            {gameState === 'lobby' && (
                <Lobby socket={socket} roomId={roomId} setRoomId={setRoomId} />
            )}

            {gameState === 'draft' && (
                <Draft socket={socket} roomId={roomId} allCharacters={allCharacters} myId={myId} draftTurn={draftTurn} />
            )}

            {gameState === 'tournament' && tournamentData && !tournamentFinished && (
                <TournamentBracket 
                    tournament={tournamentData}
                    onPlayMatch={handlePlayTournamentMatch}
                    isPlaying={gameState === 'match'}
                />
            )}

            {gameState === 'match' && (
                <>
                    <MatchBoard 
                        myTeam={teams.myTeam} 
                        enemyTeam={teams.enemyTeam} 
                        myId={myId}
                        turn={turn}
                        score={score}
                        onServe={handleServe} 
                        gameLog={gameLog}     
                        phase={phase}
                        ballTarget={ballTarget}
                        lastAction={lastAction}
                        onSet={handleSet}
                        onBlock={handleBlock}
                        triggerShake={triggerShake}
                        myTeamIndex={myTeamIndex}
                        triggerLegendary={triggerLegendary}
                        isActionPending={isActionPending}
                    />
                    {gameOverData && !isTournament && (
                        <GameOver data={gameOverData} onRestart={handleRestart} />
                    )}
                    
                    <AIEffects effect={aiEffect} data={aiEffectData} />
                </>
            )}

            {tournamentFinished && (
                <TournamentFinish 
                    tournament={tournamentFinished}
                    onRestart={handleRestart}
                />
            )}
            
            <MusicPlayer />
        </div>
    );
}

export default App;