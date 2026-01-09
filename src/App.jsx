import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Lobby from './Lobby';
import Draft from './Draft';
import MatchBoard from './MatchBoard';
import './App.css';

// 🌐 ПОДДЕРЖКА PRODUCTION И DEVELOPMENT
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";
console.log("🔌 Подключение к серверу:", SOCKET_URL);

const socket = io.connect(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

function App() {
  const [gameState, setGameState] = useState('lobby');
  const [roomId, setRoomId] = useState("");
  const [myId, setMyId] = useState("");
  const [notification, setNotification] = useState("");
  
  const [allCharacters, setAllCharacters] = useState([]);

  const [teams, setTeams] = useState({ myTeam: [], enemyTeam: [] });
  const [myTeamIndex, setMyTeamIndex] = useState(null);
  const [turn, setTurn] = useState(""); 
  const [score, setScore] = useState({ team1: 0, team2: 0 });
  const [gameLog, setGameLog] = useState(""); 
  const [phase, setPhase] = useState('SERVE');
  const [ballTarget, setBallTarget] = useState(null); // ✅ НОВОЕ: Куда летит мяч при сете

  // ЭФФЕКТ 1: Основная логика
  useEffect(() => {
    socket.on('connect', () => {
        setMyId(socket.id);
        console.log("✅ Подключено! ID:", socket.id);
    });

    socket.on('connect_error', (error) => {
        console.error("❌ Ошибка подключения:", error);
        setNotification("Ошибка подключения к серверу");
    });

    socket.on('disconnect', () => {
        console.log("⚠️ Отключено от сервера");
    });

    const onGameCreated = (id) => {
        setRoomId(id);
        setNotification(`Комната создана: ${id}`);
    };

    const onGameStarted = (data) => {
        setAllCharacters(data.allCharacters);
        setGameState('draft');
        setNotification("Драфт начался! Выбирай карты.");
    };

    const onMatchStart = (data) => {
        console.log("Старт матча:", data);
        
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
    };

    const onGameOver = (data) => {
        alert(data.message);
        setNotification("🏆 ИГРА ОКОНЧЕНА 🏆");
    };

    const onError = (msg) => {
        console.error("Ошибка:", msg);
        alert(msg);
    };

    socket.on('game_created', onGameCreated);
    socket.on('game_started', onGameStarted);
    socket.on('match_start', onMatchStart);
    socket.on('game_over', onGameOver);
    socket.on('error_message', onError);

    return () => {
        socket.off('connect');
        socket.off('connect_error');
        socket.off('disconnect');
        socket.off('game_created', onGameCreated);
        socket.off('game_started', onGameStarted);
        socket.off('match_start', onMatchStart);
        socket.off('game_over', onGameOver);
        socket.off('error_message', onError);
    };
  }, []);

  // ЭФФЕКТ 2: Игровой процесс
  useEffect(() => {
    const onServeResult = (data) => {
        setScore(data.score);
        setTurn(data.nextTurn);
        setNotification(data.message);
        setGameLog(prev => prev + '\n' + data.message);
        if (data.phase) setPhase(data.phase);
    };

    const onSetResult = (data) => {
        setTurn(data.nextTurn);      
        setPhase(data.phase);
        setBallTarget(data.targetPos); // ✅ НОВОЕ: Сохраняем куда летит мяч
        setNotification(data.message);
        setGameLog(prev => prev + '\n' + data.message);
    };

    const onSpikeResult = (data) => {
        setScore(data.score);
        setTurn(data.nextTurn);
        setPhase(data.phase); 
        
        if (data.team1 && data.team2 && myTeamIndex) {
            setTeams({
                myTeam: myTeamIndex === 1 ? data.team1 : data.team2,
                enemyTeam: myTeamIndex === 1 ? data.team2 : data.team1
            });
        }
        
        setNotification(data.message);
        setGameLog(prev => prev + '\n' + `${data.message} (${data.details})`);
    };

    socket.on('spike_result', onSpikeResult);
    socket.on('serve_result', onServeResult);
    socket.on('set_result', onSetResult);

    return () => {
        socket.off('serve_result', onServeResult);
        socket.off('set_result', onSetResult);
        socket.off('spike_result', onSpikeResult);
    };
  }, [myTeamIndex]);

  // ЭФФЕКТ 3: Таймер уведомлений
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
            <Lobby 
                socket={socket} 
                roomId={roomId}          
                setRoomId={setRoomId} 
                setGameState={setGameState} 
            />
        )}

        {gameState === 'draft' && (
            <Draft 
                socket={socket} 
                roomId={roomId} 
                allCharacters={allCharacters} 
            />
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
                ballTarget={ballTarget} // ✅ НОВОЕ: Передаем куда летит мяч
                onSet={handleSet}
                onBlock={handleBlock}
            />
        )}
    </div>
  );
}

export default App;