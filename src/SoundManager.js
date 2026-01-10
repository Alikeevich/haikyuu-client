// client/src/SoundManager.js

const sounds = {
    whistle: new Audio('/sounds/whistle.mp3'),
    serve: new Audio('/sounds/serve.mp3'),
    spike: new Audio('/sounds/spike.mp3'),
    bump: new Audio('/sounds/bump.mp3'), // Для приема и сейвов
    set: new Audio('/sounds/set.mp3'),
    monster_block: new Audio('/sounds/monster_block.mp3'),
    soft_block: new Audio('/sounds/bump.mp3'), // Можно использовать тот же bump или найти отдельный
};

// Настройка громкости (чтобы уши не резало)
const VOLUMES = {
    whistle: 0.3,
    serve: 0.5,
    spike: 0.6,
    bump: 0.4,
    set: 0.3,
    monster_block: 0.7,
    soft_block: 0.4
};

// Предзагрузка
Object.keys(sounds).forEach(key => {
    sounds[key].load();
    sounds[key].volume = VOLUMES[key] || 0.5;
});

export const playSound = (name) => {
    const audio = sounds[name];
    if (audio) {
        audio.currentTime = 0; // Перемотка в начало (чтобы можно было спамить)
        audio.play().catch(e => console.error("Ошибка воспроизведения звука:", e));
    } else {
        console.warn(`Звук ${name} не найден!`);
    }
};