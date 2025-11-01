import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import WorldScene from './scenes/WorldScene.js';
import BattleScene from './scenes/BattleScene.js';
import UIScene from './scenes/UIScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [BootScene, MenuScene, WorldScene, BattleScene, UIScene],
    pixelArt: false,
    antialias: true,
    roundPixels: false,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Глобальное состояние игры
window.gameState = {
    playerName: 'Странник',
    level: 1,
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    exp: 0,
    gold: 0,
    inventory: [],
    quests: [],
    reputation: {
        guardians: 0,
        rebels: 0,
        merchants: 0,
        mystics: 0
    },
    flags: {},
    relationships: {},
    timeOfDay: 'morning',
    weather: 'clear',
    worldState: {
        npcStates: {},
        discoveredLocations: [],
        completedQuests: [],
        choices: []
    }
};

const game = new Phaser.Game(config);

// Скрыть экран загрузки после инициализации
game.events.once('ready', () => {
    setTimeout(() => {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.transition = 'opacity 1s';
            loading.style.opacity = '0';
            setTimeout(() => loading.remove(), 1000);
        }
    }, 1000);
});

export default game;
