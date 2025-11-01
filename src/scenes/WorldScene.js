import Player from '../entities/Player.js';
import NPC from '../entities/NPC.js';
import WorldSystem from '../systems/WorldSystem.js';

export default class WorldScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WorldScene' });
        this.worldSystem = null;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Создаем живой мир
        this.createWorld();
        
        // Создаем игрока
        this.player = new Player(this, width / 2, height / 2);
        
        // Создаем NPC
        this.npcs = this.physics.add.group();
        this.createNPCs();
        
        // Система мира
        this.worldSystem = new WorldSystem(this);
        
        // Add physics for hostile creatures
        this.physics.add.collider(this.player.sprite, this.worldSystem.hostileGroup);
        this.physics.add.overlap(this.player.sprite, this.worldSystem.hostileGroup, this.handleHostileEncounter, null, this);
        
        // Камера следует за игроком
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
        this.cameras.main.setZoom(1);
        
        // Управление
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.input.keyboard.addKey('W'),
            down: this.input.keyboard.addKey('S'),
            left: this.input.keyboard.addKey('A'),
            right: this.input.keyboard.addKey('D')
        };
        this.actionKey = this.input.keyboard.addKey('Z');
        this.menuKey = this.input.keyboard.addKey('X');
        this.inventoryKey = this.input.keyboard.addKey('C');
        this.sprintKey = this.input.keyboard.addKey('SHIFT');
        
        // Коллизии
        this.physics.add.collider(this.player.sprite, this.npcs);
        
        // Взаимодействие с NPC
        this.physics.add.overlap(this.player.sprite, this.npcs, this.handleNPCInteraction, null, this);
        
        // Эффекты входа
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        
        // Приветственное сообщение
        this.time.delayedCall(1500, () => {
            this.showMessage('Добро пожаловать в Эхо Вечности...', 3000);
        });
        
        // Погода и время суток
        this.createWeatherSystem();
        this.createDayNightCycle();
    }
    
    createWorld() {
        const width = 2000;
        const height = 2000;
        
        // Фон
        const bg = this.add.rectangle(0, 0, width, height, 0x1a4d2e);
        bg.setOrigin(0, 0);
        
        // Процедурная генерация мира
        this.createTerrain(width, height);
        this.createVegetation(width, height);
        this.createStructures(width, height);
        
        // Границы мира
        this.physics.world.setBounds(0, 0, width, height);
    }
    
    createTerrain(width, height) {
        // Создаем разнообразный ландшафт
        const terrainTypes = [
            { color: 0x2d5016, name: 'grass' },
            { color: 0x8b7355, name: 'dirt' },
            { color: 0x4a90e2, name: 'water' },
            { color: 0x7f8c8d, name: 'stone' }
        ];
        
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(50, 200);
            const terrain = terrainTypes[Phaser.Math.Between(0, terrainTypes.length - 1)];
            
            const patch = this.add.circle(x, y, size, terrain.color, 0.3);
            patch.setDepth(-10);
        }
    }
    
    createVegetation(width, height) {
        // Деревья
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(100, width - 100);
            const y = Phaser.Math.Between(100, height - 100);
            this.createTree(x, y);
        }
        
        // Кусты
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(50, width - 50);
            const y = Phaser.Math.Between(50, height - 50);
            this.createBush(x, y);
        }
        
        // Цветы
        for (let i = 0; i < 200; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            this.createFlower(x, y);
        }
    }
    
    createTree(x, y) {
        const trunk = this.add.rectangle(x, y, 20, 60, 0x654321);
        const crown = this.add.circle(x, y - 40, 40, 0x228b22);
        
        // Анимация дерева (покачивание)
        this.tweens.add({
            targets: [trunk, crown],
            x: x + 5,
            duration: 2000 + Phaser.Math.Between(0, 1000),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        trunk.setDepth(1);
        crown.setDepth(1);
    }
    
    createBush(x, y) {
        const bush = this.add.circle(x, y, 15, 0x2d5016);
        bush.setDepth(0);
        
        this.tweens.add({
            targets: bush,
            scaleX: 1.1,
            scaleY: 0.9,
            duration: 1500 + Phaser.Math.Between(0, 1000),
            yoyo: true,
            repeat: -1
        });
    }
    
    createFlower(x, y) {
        const colors = [0xff69b4, 0xffd700, 0xff4500, 0x9370db, 0x00ced1];
        const color = colors[Phaser.Math.Between(0, colors.length - 1)];
        const flower = this.add.circle(x, y, 5, color);
        flower.setDepth(0);
        flower.setAlpha(0.8);
    }
    
    createStructures(width, height) {
        // Деревня
        this.createVillage(width / 2, height / 2);
        
        // Руины
        this.createRuins(width / 4, height / 4);
        
        // Таинственный портал
        this.createPortal(width * 0.75, height * 0.75);
    }
    
    createVillage(centerX, centerY) {
        // Несколько домов
        const houses = [
            { x: centerX - 100, y: centerY - 100 },
            { x: centerX + 100, y: centerY - 100 },
            { x: centerX - 100, y: centerY + 100 },
            { x: centerX + 100, y: centerY + 100 },
            { x: centerX, y: centerY }
        ];
        
        houses.forEach(pos => {
            this.createHouse(pos.x, pos.y);
        });
    }
    
    createHouse(x, y) {
        const house = this.add.rectangle(x, y, 80, 80, 0x8b4513);
        const roof = this.add.triangle(x, y - 40, 0, 40, 40, -20, 80, 40, 0xdc143c);
        const door = this.add.rectangle(x, y + 20, 20, 30, 0x654321);
        const window1 = this.add.rectangle(x - 20, y - 10, 15, 15, 0xffffe0);
        const window2 = this.add.rectangle(x + 20, y - 10, 15, 15, 0xffffe0);
        
        [house, roof, door, window1, window2].forEach(obj => obj.setDepth(2));
        
        // Свет в окнах (мерцание)
        this.tweens.add({
            targets: [window1, window2],
            alpha: 0.5,
            duration: 2000,
            yoyo: true,
            repeat: -1
        });
    }
    
    createRuins(x, y) {
        for (let i = 0; i < 5; i++) {
            const pillar = this.add.rectangle(
                x + i * 50,
                y,
                30,
                Phaser.Math.Between(60, 120),
                0x808080
            );
            pillar.setDepth(1);
            pillar.setAlpha(0.7);
        }
    }
    
    createPortal(x, y) {
        const portal = this.add.circle(x, y, 50, 0x9370db, 0.5);
        portal.setDepth(0);
        
        // Анимация портала
        this.tweens.add({
            targets: portal,
            scaleX: 1.2,
            scaleY: 1.2,
            alpha: 0.8,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        // Частицы вокруг портала
        for (let i = 0; i < 20; i++) {
            const particle = this.add.circle(x, y, 3, 0xff00ff, 0.6);
            particle.setDepth(1);
            
            this.tweens.add({
                targets: particle,
                x: x + Phaser.Math.Between(-80, 80),
                y: y + Phaser.Math.Between(-80, 80),
                alpha: 0,
                duration: 2000,
                delay: i * 100,
                repeat: -1
            });
        }
    }
    
    createNPCs() {
        const npcData = [
            { x: 1000, y: 1000, name: 'Мудрец Элдрин', type: 'mystic', dialogue: 'Приветствую, странник. Время течет иначе в этих землях...' },
            { x: 1200, y: 900, name: 'Торговка Лира', type: 'merchant', dialogue: 'Хочешь купить что-нибудь интересное?' },
            { x: 800, y: 1100, name: 'Страж Торн', type: 'guardian', dialogue: 'Я защищаю эту деревню уже 20 лет.' },
            { x: 1100, y: 1200, name: 'Бунтарь Кай', type: 'rebel', dialogue: 'Система прогнила. Пора что-то менять!' },
            { x: 950, y: 950, name: 'Ребенок Мия', type: 'child', dialogue: 'Ты видел моего кота? Он убежал!' }
        ];
        
        npcData.forEach(data => {
            const npc = new NPC(this, data.x, data.y, data.name, data.type, data.dialogue);
            this.npcs.add(npc.sprite);
            npc.sprite.npcData = data;
        });
    }
    
    createWeatherSystem() {
        this.weatherParticles = [];
        this.currentWeather = 'clear';
        
        // Периодическая смена погоды
        this.time.addEvent({
            delay: 30000, // каждые 30 секунд
            callback: () => this.changeWeather(),
            loop: true
        });
    }
    
    changeWeather() {
        const weathers = ['clear', 'rain', 'snow', 'fog'];
        const newWeather = weathers[Phaser.Math.Between(0, weathers.length - 1)];
        
        if (newWeather !== this.currentWeather) {
            this.currentWeather = newWeather;
            window.gameState.weather = newWeather;
            
            // Очистка старых частиц
            this.weatherParticles.forEach(p => p.destroy());
            this.weatherParticles = [];
            
            // Создание новых эффектов
            switch (newWeather) {
                case 'rain':
                    this.createRain();
                    this.showMessage('Начался дождь...', 2000);
                    break;
                case 'snow':
                    this.createSnow();
                    this.showMessage('Пошел снег...', 2000);
                    break;
                case 'fog':
                    this.createFog();
                    this.showMessage('Туман окутывает землю...', 2000);
                    break;
                default:
                    this.showMessage('Погода прояснилась.', 2000);
            }
        }
    }
    
    createRain() {
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, 2000);
            const y = Phaser.Math.Between(-100, 2000);
            const drop = this.add.line(x, y, 0, 0, 0, 20, 0x4a90e2, 0.5);
            drop.setDepth(100);
            this.weatherParticles.push(drop);
            
            this.tweens.add({
                targets: drop,
                y: y + 500,
                duration: 1000,
                repeat: -1,
                onRepeat: () => {
                    drop.y = -100;
                    drop.x = Phaser.Math.Between(0, 2000);
                }
            });
        }
    }
    
    createSnow() {
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, 2000);
            const y = Phaser.Math.Between(-100, 2000);
            const flake = this.add.circle(x, y, 3, 0xffffff, 0.8);
            flake.setDepth(100);
            this.weatherParticles.push(flake);
            
            this.tweens.add({
                targets: flake,
                y: y + 300,
                x: x + Phaser.Math.Between(-50, 50),
                duration: 3000,
                repeat: -1,
                onRepeat: () => {
                    flake.y = -100;
                    flake.x = Phaser.Math.Between(0, 2000);
                }
            });
        }
    }
    
    createFog() {
        const fog = this.add.rectangle(1000, 1000, 2000, 2000, 0xcccccc, 0.3);
        fog.setDepth(99);
        this.weatherParticles.push(fog);
    }
    
    createDayNightCycle() {
        this.dayNightOverlay = this.add.rectangle(1000, 1000, 2000, 2000, 0x000033, 0);
        this.dayNightOverlay.setDepth(98);
        
        // Цикл день-ночь (каждые 2 минуты)
        this.time.addEvent({
            delay: 120000,
            callback: () => this.cycleTimeOfDay(),
            loop: true
        });
    }
    
    cycleTimeOfDay() {
        const times = ['morning', 'day', 'evening', 'night'];
        const currentIndex = times.indexOf(window.gameState.timeOfDay);
        const nextIndex = (currentIndex + 1) % times.length;
        window.gameState.timeOfDay = times[nextIndex];
        
        const alphas = { morning: 0, day: 0, evening: 0.3, night: 0.6 };
        
        this.tweens.add({
            targets: this.dayNightOverlay,
            alpha: alphas[times[nextIndex]],
            duration: 5000
        });
        
        const messages = {
            morning: 'Рассвет...',
            day: 'Солнце в зените.',
            evening: 'Наступает вечер...',
            night: 'Ночь окутывает мир...'
        };
        
        this.showMessage(messages[times[nextIndex]], 2000);
    }
    
    handleNPCInteraction(playerSprite, npcSprite) {
        if (Phaser.Input.Keyboard.JustDown(this.actionKey)) {
            const npcData = npcSprite.npcData;
            if (npcData) {
                this.startDialogue(npcData);
            }
        }
    }
    
    handleHostileEncounter(playerSprite, enemySprite) {
        // Get enemy data
        const enemyData = enemySprite.enemyData;
        
        // Start battle with this enemy
        this.scene.pause();
        this.scene.launch('BattleScene', { enemy: enemyData });
    }
    
    startDialogue(npcData) {
        this.scene.pause();
        
        // Создаем диалоговое окно
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const dialogBox = this.add.container(width / 2, height - 200);
        dialogBox.setScrollFactor(0);
        
        const bg = this.add.rectangle(0, 0, width - 100, 300, 0x000000, 0.95);
        bg.setStrokeStyle(4, 0x00ffff);
        
        // Портрет NPC
        const npcColors = {
            mystic: 0x9370db,
            merchant: 0xffd700,
            guardian: 0x4169e1,
            rebel: 0xff4500,
            child: 0xffb6c1,
            default: 0x808080
        };
        const npcColor = npcColors[npcData.type] || npcColors.default;
        const portrait = this.add.circle(-width / 2 + 80, -80, 40, npcColor);
        portrait.setStrokeStyle(3, 0xffffff);
        
        // Имя NPC
        const nameText = this.add.text(-width / 2 + 150, -120, npcData.name, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#00ffff',
            fontStyle: 'bold'
        });
        
        // Отношения
        const relationshipText = this.add.text(-width / 2 + 150, -95, `Отношения: ${npcData.relationship || 0}`, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: npcData.relationship > 0 ? '#00ff00' : (npcData.relationship < 0 ? '#ff0000' : '#ffffff')
        });
        
        // Текст диалога
        const dialogueText = this.add.text(-width / 2 + 150, -60, npcData.dialogue, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            wordWrap: { width: width - 300 }
        });
        
        dialogBox.add([bg, portrait, nameText, relationshipText, dialogueText]);
        dialogBox.setDepth(1000);
        
        // Добавляем варианты ответов
        if (npcData.responses && npcData.responses.length > 0) {
            let yOffset = 20;
            npcData.responses.forEach((response, index) => {
                const responseKey = (index + 1).toString();
                const responseText = this.add.text(
                    -width / 2 + 150,
                    yOffset,
                    `[${responseKey}] ${response.text}`,
                    {
                        fontFamily: 'Arial',
                        fontSize: '16px',
                        color: '#ffff00',
                        backgroundColor: '#222222',
                        padding: { x: 10, y: 5 }
                    }
                );
                
                responseText.setInteractive({ useHandCursor: true });
                responseText.on('pointerover', () => {
                    responseText.setBackgroundColor('#444444');
                });
                responseText.on('pointerout', () => {
                    responseText.setBackgroundColor('#222222');
                });
                responseText.on('pointerdown', () => {
                    if (response.action) {
                        response.action();
                    }
                    dialogBox.destroy();
                    this.scene.resume();
                });
                
                dialogBox.add(responseText);
                yOffset += 30;
                
                // Клавиатурное управление
                this.input.keyboard.once(`keydown-${responseKey}`, () => {
                    if (response.action) {
                        response.action();
                    }
                    dialogBox.destroy();
                    this.scene.resume();
                });
            });
        } else {
            // Если нет вариантов, показываем кнопку продолжения
            const continueText = this.add.text(width / 2 - 200, 120, '[Z] Продолжить', {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#888888'
            });
            dialogBox.add(continueText);
            
            this.input.keyboard.once('keydown-Z', () => {
                dialogBox.destroy();
                this.scene.resume();
            });
        }
    }
    
    showMessage(text, duration) {
        const width = this.cameras.main.width;
        const message = this.add.text(width / 2, 50, text, {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
        
        this.tweens.add({
            targets: message,
            alpha: 0,
            duration: duration,
            delay: duration / 2,
            onComplete: () => message.destroy()
        });
    }
    
    update(time, delta) {
        // Обновление игрока
        if (this.player) {
            const speed = this.sprintKey.isDown ? 300 : 150;
            
            let velocityX = 0;
            let velocityY = 0;
            
            if (this.cursors.left.isDown || this.wasd.left.isDown) velocityX = -speed;
            if (this.cursors.right.isDown || this.wasd.right.isDown) velocityX = speed;
            if (this.cursors.up.isDown || this.wasd.up.isDown) velocityY = -speed;
            if (this.cursors.down.isDown || this.wasd.down.isDown) velocityY = speed;
            
            this.player.sprite.setVelocity(velocityX, velocityY);
            
            // Нормализация диагонального движения
            if (velocityX !== 0 && velocityY !== 0) {
                this.player.sprite.setVelocity(velocityX * 0.707, velocityY * 0.707);
            }
        }
        
        // Обновление системы мира
        if (this.worldSystem) {
            this.worldSystem.update(time, delta);
        }
        
        // Обновление NPC
        this.npcs.children.entries.forEach(npc => {
            if (npc.update) {
                npc.update(time, delta);
            }
        });
    }
}
