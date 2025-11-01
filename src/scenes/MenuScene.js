export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Анимированный фон
        this.createAnimatedBackground();
        
        // Заголовок игры
        const title = this.add.text(width / 2, 150, 'ECHOES OF ETERNITY', {
            fontFamily: 'Arial Black',
            fontSize: '64px',
            color: '#00ffff',
            stroke: '#000000',
            strokeThickness: 8,
            shadow: {
                offsetX: 4,
                offsetY: 4,
                color: '#000',
                blur: 10,
                fill: true
            }
        }).setOrigin(0.5);
        
        // Анимация заголовка
        this.tweens.add({
            targets: title,
            y: 140,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Подзаголовок
        this.add.text(width / 2, 220, 'Живой мир, где каждый выбор имеет значение', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            alpha: 0.8
        }).setOrigin(0.5);
        
        // Меню
        const menuItems = [
            { text: '▶ Новая игра', action: () => this.startNewGame() },
            { text: '📖 Продолжить', action: () => this.continueGame() },
            { text: '⚙ Настройки', action: () => this.showSettings() },
            { text: '❓ О игре', action: () => this.showAbout() }
        ];
        
        let yPos = 350;
        menuItems.forEach((item, index) => {
            const menuText = this.add.text(width / 2, yPos, item.text, {
                fontFamily: 'Arial',
                fontSize: '32px',
                color: '#ffffff'
            }).setOrigin(0.5).setInteractive();
            
            menuText.on('pointerover', () => {
                menuText.setColor('#00ffff');
                menuText.setScale(1.1);
                this.sound.play('hover', { volume: 0.3 });
            });
            
            menuText.on('pointerout', () => {
                menuText.setColor('#ffffff');
                menuText.setScale(1);
            });
            
            menuText.on('pointerdown', () => {
                this.cameras.main.flash(200, 255, 255, 255);
                this.time.delayedCall(200, item.action);
            });
            
            // Анимация появления
            menuText.setAlpha(0);
            this.tweens.add({
                targets: menuText,
                alpha: 1,
                duration: 500,
                delay: index * 100
            });
            
            yPos += 70;
        });
        
        // Информация внизу
        this.add.text(width / 2, height - 30, 'v1.0.0 | Создано с ❤️', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff',
            alpha: 0.5
        }).setOrigin(0.5);
        
        // Создаем звуковые эффекты (заглушки)
        if (!this.sound.get('hover')) {
            this.sound.add('hover', { volume: 0 });
        }
    }
    
    createAnimatedBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Создаем частицы
        const particles = [];
        for (let i = 0; i < 50; i++) {
            const particle = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.Between(2, 5),
                0x00ffff,
                0.3
            );
            
            particles.push(particle);
            
            this.tweens.add({
                targets: particle,
                x: Phaser.Math.Between(0, width),
                y: Phaser.Math.Between(0, height),
                alpha: Phaser.Math.FloatBetween(0.1, 0.5),
                duration: Phaser.Math.Between(3000, 8000),
                repeat: -1,
                yoyo: true
            });
        }
    }
    
    startNewGame() {
        // Диалог ввода имени
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        
        const dialog = this.add.rectangle(width / 2, height / 2, 600, 300, 0x1a1a2e, 1);
        dialog.setStrokeStyle(4, 0x00ffff);
        
        this.add.text(width / 2, height / 2 - 80, 'Как вас зовут, странник?', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        const nameInput = this.add.text(width / 2, height / 2, 'Введите имя...', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#00ffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        
        const startBtn = this.add.text(width / 2, height / 2 + 80, '✓ Начать путешествие', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#00ff00'
        }).setOrigin(0.5).setInteractive();
        
        startBtn.on('pointerover', () => startBtn.setScale(1.1));
        startBtn.on('pointerout', () => startBtn.setScale(1));
        startBtn.on('pointerdown', () => {
            window.gameState.playerName = 'Странник';
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                this.scene.start('WorldScene');
                this.scene.launch('UIScene');
            });
        });
    }
    
    continueGame() {
        // TODO: Загрузка сохранения
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 
            'Сохранений пока нет', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ff0000'
        }).setOrigin(0.5);
    }
    
    showSettings() {
        console.log('Настройки');
    }
    
    showAbout() {
        console.log('О игре');
    }
}
