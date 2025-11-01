export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        // Постоянный UI поверх игры
        this.createHUD();
        
        // Обновление каждую секунду
        this.time.addEvent({
            delay: 1000,
            callback: () => this.updateHUD(),
            loop: true
        });
    }
    
    createHUD() {
        const width = this.cameras.main.width;
        
        // Панель статуса
        const hudBg = this.add.rectangle(10, 10, 300, 120, 0x000000, 0.7);
        hudBg.setOrigin(0, 0);
        hudBg.setScrollFactor(0);
        hudBg.setDepth(1000);
        
        // Имя игрока
        this.nameText = this.add.text(20, 20, window.gameState.playerName, {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#00ffff',
            fontStyle: 'bold'
        }).setScrollFactor(0).setDepth(1001);
        
        // HP
        this.hpText = this.add.text(20, 50, `HP: ${window.gameState.hp}/${window.gameState.maxHp}`, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#00ff00'
        }).setScrollFactor(0).setDepth(1001);
        
        this.hpBar = this.add.rectangle(20, 70, 260, 10, 0x00ff00);
        this.hpBar.setOrigin(0, 0);
        this.hpBar.setScrollFactor(0);
        this.hpBar.setDepth(1001);
        
        // MP
        this.mpText = this.add.text(20, 85, `MP: ${window.gameState.mp}/${window.gameState.maxMp}`, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#0099ff'
        }).setScrollFactor(0).setDepth(1001);
        
        this.mpBar = this.add.rectangle(20, 105, 260, 10, 0x0099ff);
        this.mpBar.setOrigin(0, 0);
        this.mpBar.setScrollFactor(0);
        this.mpBar.setDepth(1001);
        
        // Уровень и опыт
        this.levelText = this.add.text(width - 150, 20, `Уровень: ${window.gameState.level}`, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffff00'
        }).setScrollFactor(0).setDepth(1001);
        
        this.expText = this.add.text(width - 150, 45, `Опыт: ${window.gameState.exp}`, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff'
        }).setScrollFactor(0).setDepth(1001);
        
        // Золото
        this.goldText = this.add.text(width - 150, 70, `💰 ${window.gameState.gold}`, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffd700'
        }).setScrollFactor(0).setDepth(1001);
        
        // Время и погода
        this.timeText = this.add.text(width / 2, 20, '', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        
        this.updateTimeWeather();
    }
    
    updateHUD() {
        // Обновление HP
        this.hpText.setText(`HP: ${window.gameState.hp}/${window.gameState.maxHp}`);
        const hpPercent = window.gameState.hp / window.gameState.maxHp;
        this.hpBar.width = 260 * hpPercent;
        
        // Цвет HP бара в зависимости от здоровья
        if (hpPercent > 0.5) {
            this.hpBar.setFillStyle(0x00ff00);
        } else if (hpPercent > 0.25) {
            this.hpBar.setFillStyle(0xffff00);
        } else {
            this.hpBar.setFillStyle(0xff0000);
        }
        
        // Обновление MP
        this.mpText.setText(`MP: ${window.gameState.mp}/${window.gameState.maxMp}`);
        this.mpBar.width = 260 * (window.gameState.mp / window.gameState.maxMp);
        
        // Обновление уровня и опыта
        this.levelText.setText(`Уровень: ${window.gameState.level}`);
        this.expText.setText(`Опыт: ${window.gameState.exp}`);
        
        // Обновление золота
        this.goldText.setText(`💰 ${window.gameState.gold}`);
        
        // Обновление времени и погоды
        this.updateTimeWeather();
    }
    
    updateTimeWeather() {
        const timeEmojis = {
            morning: '🌅',
            day: '☀️',
            evening: '🌆',
            night: '🌙'
        };
        
        const weatherEmojis = {
            clear: '☀️',
            rain: '🌧️',
            snow: '❄️',
            fog: '🌫️'
        };
        
        const timeEmoji = timeEmojis[window.gameState.timeOfDay] || '☀️';
        const weatherEmoji = weatherEmojis[window.gameState.weather] || '☀️';
        
        this.timeText.setText(`${timeEmoji} ${weatherEmoji}`);
    }
}
