import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Lobby from './Lobby';
import Draft from './Draft';
import MatchBoard from './MatchBoard';
import './App.css';
import MusicPlayer from './MusicPlayer';
import { playSound } from './SoundManager';

// 🌐 ПОДДЕРЖКА PRODUCTION И DEVELOPMENT
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

  const [teams, setTeams] = useState({ myTeam: [], enemyTeam: [] });
  const [myTeamIndex, setMyTeamIndex] = useState(null);
  const [turn, setTurn] = useState(""); 
  const [score, setScore] = useState({ team1: 0, team2: 0 });
  const [gameLog, setGameLog] = useState(""); 
  const [phase, setPhase] = useState('SERVE');
  const [ballTarget, setBallTarget] = useState(null); 
  const [lastAction, setLastAction] = useState(null);

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
        setGameState('match');
        setNotification("Матч начинается!");
        setPhase('SERVE');
        
        // 🔊 Звук начала матча
        setTimeout(() => playSound('whistle'), 300);
    };

    const onGameOver = (data) => {
        // 🔊 Финальный свисток
        playSound('whistle');
        setTimeout(() => {
            alert(data.message);
            setNotification("🏆 ИГРА ОКОНЧЕНА 🏆");
        }, 500);
    };

    const createAIGame = () => {
        socket.emit('create_ai_game');
        // Таймаут на ожидание 'game_started' (если не пришло — ошибка)
        setTimeout(() => {
            if (gameState !== 'draft') alert('Ошибка: не удалось начать игру против ИИ. Проверьте соединение.');
        }, 5000);
    };

    useEffect(() => {
        socket.on('connect', () => console.log('Сокет подключён'));
        socket.on('connect_error', (err) => console.error('Ошибка сокета:', err));
    }, []);

    socket.on('game_created', onGameCreated);
    socket.on('game_started', onGameStarted);
    socket.on('match_start', onMatchStart);
    socket.on('game_over', onGameOver);
    socket.on('draft_turn', (data) => setDraftTurn(data.turn));

    return () => {
        socket.off('connect');
        socket.off('game_created');
        socket.off('game_started');
        socket.off('match_start');
        socket.off('game_over');
        socket.off('draft_turn');
        socket.off('error_message');
    };
  }, []);

  // ЭФФЕКТ 2: Игровой процесс
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

        const msg = data.message.toLowerCase();

        // 🔊 ЛОГИКА ЗВУКОВ ДЛЯ ПОДАЧИ
        if (msg.includes("эйс")) {
            console.log('🔊 Играем: serve + whistle (ЭЙС)');
            playSound('serve');
            if (data.isCritical) {
                setTriggerShake(true);
                setTimeout(() => setTriggerShake(false), 500);
            }
            setTimeout(() => playSound('whistle'), 800);
        } 
        else {
            // Прием подачи (разыгрыш продолжается)
            console.log('🔊 Играем: bump (прием)');
            playSound('bump');
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
    };

    const onSetMade = (data) => {
        console.log('🏐 SET MADE:', data.message);
        
        setTurn(data.nextTurn);
        setPhase(data.phase);
        setBallTarget(null);
        setNotification(data.message);
        setGameLog(prev => prev + '\n' + data.message);
        
        playSound('set');
        
        setLastAction({ type: 'SET', actorId: data.setterId, ts: Date.now() });
    };

    const onSpikeResult = (data) => {
        console.log('💥 SPIKE RESULT:', data.message, '| Details:', data.details);
        
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

        // 🔊 ДЕТАЛЬНАЯ ЛОГИКА ЗВУКОВ ДЛЯ АТАКИ

        // 1. KILL BLOCK → ОЧКО
        if (msg.includes("monster block") || msg.includes("заблокировал")) {
            console.log('🔊 Играем: monster_block + whistle (KILL BLOCK)');
            playSound('monster_block');
            if (data.isCritical) {
                setTriggerShake(true);
                setTimeout(() => setTriggerShake(false), 500);
            }
            setTimeout(() => playSound('whistle'), 700);
        }
        
        // 2. ГОЛ → ОЧКО
        else if (msg.includes("гол") || msg.includes("пробил защиту")) {
            console.log('🔊 Играем: spike + whistle (ГОЛ)');
            playSound('spike');
            if (data.isCritical) {
                setTriggerShake(true);
                setTimeout(() => setTriggerShake(false), 500);
            }
            setTimeout(() => playSound('whistle'), 700);
        }
        
        // 3. СМЯГЧЕНИЕ БЛОКОМ → ПРОДОЛЖЕНИЕ
        else if (msg.includes("смягчение")) {
            console.log('🔊 Играем: soft_block (смягчение)');
            playSound('soft_block');
        }
        
        // 4. ЧИСТАЯ СЕТКА → ЗВУК УДАРА БЕЗ СВИСТКА
        else if (msg.includes("чистая сетка")) {
            console.log('🔊 Играем: spike (чистая)');
            playSound('spike');
        }
        
        // 5. ЗАЩИТА/ПРИЕМ → ПРОДОЛЖЕНИЕ
        else if (msg.includes("тащит") || msg.includes("поднял")) {
            console.log('🔊 Играем: bump (защита)');
            playSound('bump');
        }
        
        // 6. FALLBACK
        else {
            console.log('🔊 Играем: bump (fallback)');
            playSound('bump');
        }
    };

    socket.on('spike_result', onSpikeResult);
    socket.on('serve_result', onServeResult);
    socket.on('set_result', onSetResult);
    socket.on('set_made', onSetMade);

    return () => {
        socket.off('serve_result');
        socket.off('set_result');
        socket.off('spike_result');
        socket.off('set_made');
    };
  }, [myTeamIndex]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleServe = () => socket.emit('action_serve', { roomId });
  const handleSet = (targetPos) => socket.emit('action_set', { roomId, targetPos });
  const handleBlock = (blockPos) => socket.emit('action_block', { roomId, blockPos });

  return (
    <div className="app">
        {notification && <div className="notification">{notification}</div>}

        {gameState === 'lobby' && (
            <Lobby socket={socket} roomId={roomId} setRoomId={setRoomId} setGameState={setGameState} />
        )}

        {gameState === 'draft' && (
            <Draft socket={socket} roomId={roomId} allCharacters={allCharacters} myId={myId} draftTurn={draftTurn} />
        )}

        {gameState === 'match' && (
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
            />
        )}
        <MusicPlayer />
    </div>
  );
}

export default App;