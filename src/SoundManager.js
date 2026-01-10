// client/src/SoundManager.js

// 🎵 КАРТА ЗВУКОВ С ОПИСАНИЕМ
const soundFiles = {
    whistle: '/sounds/whistle.mp3',
    serve: '/sounds/serve.mp3',
    spike: '/sounds/spike.mp3',
    bump: '/sounds/bump.mp3',
    set: '/sounds/set.mp3',
    monster_block: '/sounds/monster_block.mp3',
    soft_block: '/sounds/block.mp3',
};

// 🎯 НАСТРОЙКИ ГРОМКОСТИ
const volumeSettings = {
    whistle: 0.6,
    serve: 0.7,
    spike: 0.75,
    bump: 0.5,
    set: 0.35,
    monster_block: 0.85,
    soft_block: 0.5,
};

// 📦 ПУЛ АУДИО-ОБЪЕКТОВ
const POOL_SIZE = 8; // Увеличен для надежности
const soundPools = {};
let isAudioUnlocked = false;

// 🚫 ЗАЩИТА ОТ СПАМА (debounce)
const lastPlayTime = {};
const MIN_INTERVAL = {
    whistle: 400,  // Свисток не чаще раза в 400ms
    serve: 100,
    spike: 100,
    bump: 50,
    set: 80,
    monster_block: 200,
    soft_block: 100,
};

// 🔧 ИНИЦИАЛИЗАЦИЯ ПУЛОВ
Object.keys(soundFiles).forEach(key => {
    soundPools[key] = [];
    lastPlayTime[key] = 0;
    
    for (let i = 0; i < POOL_SIZE; i++) {
        const audio = new Audio(soundFiles[key]);
        audio.preload = 'auto';
        audio.volume = volumeSettings[key] || 0.5;
        
        // Важно: загружаем звук сразу
        audio.load();
        
        audio.addEventListener('error', (e) => {
            console.error(`❌ Не удалось загрузить звук "${key}":`, soundFiles[key]);
        });
        
        // При окончании воспроизведения сбрасываем
        audio.addEventListener('ended', () => {
            audio.currentTime = 0;
        });
        
        soundPools[key].push(audio);
    }
});

// 🔊 ОСНОВНАЯ ФУНКЦИЯ ВОСПРОИЗВЕДЕНИЯ
export const playSound = (name, volumeMultiplier = 1.0) => {
    const pool = soundPools[name];
    
    if (!pool) {
        console.warn(`❌ Звук "${name}" не найден!`);
        return;
    }

    // 🚫 ЗАЩИТА ОТ СПАМА
    const now = Date.now();
    const minInterval = MIN_INTERVAL[name] || 100;
    
    if (now - lastPlayTime[name] < minInterval) {
        console.log(`⏭️ Звук "${name}" пропущен (антиспам)`);
        return;
    }
    
    lastPlayTime[name] = now;

    // Ищем ДЕЙСТВИТЕЛЬНО свободный аудио
    let availableSound = null;
    
    for (let audio of pool) {
        if (audio.paused && audio.currentTime === 0) {
            availableSound = audio;
            break;
        }
    }
    
    // Если не нашли полностью свободный, ищем хотя бы завершенный
    if (!availableSound) {
        availableSound = pool.find(audio => audio.paused);
    }
    
    // Если всё занято - прерываем самый старый
    if (!availableSound) {
        availableSound = pool[0];
        console.log(`⚠️ Все аудио заняты, прерываем для "${name}"`);
    }
    
    // Применяем громкость
    const baseVolume = volumeSettings[name] || 0.5;
    availableSound.volume = Math.min(1.0, baseVolume * volumeMultiplier);
    
    // Сбрасываем и играем
    availableSound.currentTime = 0;
    
    const playPromise = availableSound.play();
    
    if (playPromise !== undefined) {
        playPromise.catch(e => {
            if (e.name === 'NotAllowedError' && !isAudioUnlocked) {
                console.warn('🔇 Звуки заблокированы браузером. Нужен клик пользователя.');
            } else if (!e.message.includes('interrupted')) {
                console.warn(`⚠️ Ошибка воспроизведения "${name}":`, e.message);
            }
        });
    }
};

// 🔓 РАЗБЛОКИРОВКА ЗВУКОВ
export const unlockAudio = () => {
    if (isAudioUnlocked) return;
    
    console.log('🔓 Разблокируем звуки...');
    
    let unlocked = 0;
    
    Object.values(soundPools).forEach(pool => {
        const audio = pool[0]; // Берем первый из пула
        
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                audio.pause();
                audio.currentTime = 0;
                unlocked++;
            }).catch(() => {
                // Игнорируем
            });
        }
    });
    
    setTimeout(() => {
        if (unlocked > 0) {
            isAudioUnlocked = true;
            console.log(`✅ Разблокировано ${unlocked} звуков!`);
        }
    }, 100);
};

// 🎮 АВТОМАТИЧЕСКАЯ РАЗБЛОКИРОВКА
if (typeof document !== 'undefined') {
    const unlock = () => {
        unlockAudio();
        document.removeEventListener('click', unlock);
        document.removeEventListener('touchstart', unlock);
        document.removeEventListener('keydown', unlock);
    };
    
    document.addEventListener('click', unlock, { once: true });
    document.addEventListener('touchstart', unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });
}

// 🎛️ УТИЛИТЫ
export const playSoundDelayed = (name, delayMs, volumeMultiplier = 1.0) => {
    setTimeout(() => playSound(name, volumeMultiplier), delayMs);
};

export const playSoundSequence = (sequence) => {
    let totalDelay = 0;
    
    sequence.forEach(({ name, delay = 0, volume = 1.0 }) => {
        totalDelay += delay;
        playSoundDelayed(name, totalDelay, volume);
    });
};