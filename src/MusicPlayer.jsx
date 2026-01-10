import React, { useState, useRef, useEffect } from 'react';

const PLAYLIST = [
    { title: "Opening 1", src: "/music/track1.mp3" },
    { title: "Epic Battle", src: "/music/track2.mp3" },
    { title: "Victory Theme", src: "/music/track3.mp3" }
];

function MusicPlayer() {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(0);
    const [volume, setVolume] = useState(0.3); // Начальная громкость 30%
    const [isMinimized, setIsMinimized] = useState(true); // Свернут по умолчанию

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Переключение трека
    const playTrack = (index) => {
        setCurrentTrack(index);
        setIsPlaying(true);
        // Небольшая задержка, чтобы React успел обновить src
        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.play().catch(e => console.log("Autoplay prevented:", e));
            }
        }, 100);
    };

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(e => console.log("Autoplay prevented:", e));
            }
            setIsPlaying(!isPlaying);
        }
    };

    const nextTrack = () => {
        const nextIndex = (currentTrack + 1) % PLAYLIST.length;
        playTrack(nextIndex);
    };

    // Авто-переключение на следующий трек, когда песня кончилась
    const handleEnded = () => {
        nextTrack();
    };

    return (
        <div className={`music-player-widget ${isMinimized ? 'minimized' : ''}`}>
            {/* Скрытый аудио элемент */}
            <audio 
                ref={audioRef} 
                src={PLAYLIST[currentTrack].src} 
                onEnded={handleEnded}
            />

            {/* Кнопка разворачивания (Иконка ноты) */}
            <button 
                className="music-toggle-btn" 
                onClick={() => setIsMinimized(!isMinimized)}
            >
                {isPlaying ? '🎵' : '🔇'}
            </button>

            {/* Панель управления (видна, если не свернуто) */}
            {!isMinimized && (
                <div className="music-controls">
                    <div className="track-info">
                        <span className="track-name">{PLAYLIST[currentTrack].title}</span>
                    </div>
                    
                    <div className="buttons-row">
                        <button onClick={togglePlay}>
                            {isPlaying ? '⏸️' : '▶️'}
                        </button>
                        <button onClick={nextTrack}>⏭️</button>
                    </div>

                    <input 
                        type="range" 
                        min="0" max="1" step="0.05" 
                        value={volume} 
                        onChange={(e) => setVolume(parseFloat(e.target.value))} 
                        className="volume-slider"
                    />
                </div>
            )}
        </div>
    );
}

export default MusicPlayer;