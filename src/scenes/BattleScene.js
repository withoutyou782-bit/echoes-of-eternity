export default class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene' });
        this.enemy = null;
        this.playerTurn = true;
        this.bullets = [];
        this.playerHeart = null;
    }

    init(data) {
        this.enemyData = data.enemy || {
            name: 'Теневое существо',
            hp: 100,
            maxHp: 100,
            attack: 15,
            defense: 5,
            personality: 'aggressive',
            weaknesses: ['kindness'],
            dialogue: ['...', 'Ты не пройдешь!', 'Сдавайся!']
        };
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Фон боя
        this.createBattleBackground();
        
        // Враг
        this.createEnemy();
        
        // Интерфейс боя
        this.createBattleUI();
        
        // Сердце игрока (для bullet-hell фазы)
        this.playerHeart = this.add.circle(width / 2, height / 2 + 100, 10, 0xff0000);
        this.playerHeart.setVisible(false);
        this.physics.add.existing(this.playerHeart);
        
        // Управление
        this.cursors = this.input.keyboard.createCursorKeys();
        this.actionKey = this.input.keyboard.addKey('Z');
        this.cancelKey = this.input.keyboard.addKey('X');
        
        // Эффект входа
        this.cameras.main.fadeIn(500, 0, 0, 0);
        
        // Начальное сообщение
        this.showBattleMessage(`${this.enemyData.name} появляется!`, 2000);
    }
    
    createBattleBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Градиентный фон
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x4a0e4e, 0x4a0e4e, 1);
        bg.fillRect(0, 0, width, height);
        
        // Анимированные частицы
        for (let i = 0; i < 30; i++) {
            const particle = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.Between(2, 4),
                0x9370db,
                0.3
            );
            
            this.tweens.add({
                targets: particle,
                y: particle.y + Phaser.Math.Between(-50, 50),
                alpha: Phaser.Math.FloatBetween(0.1, 0.5),
                duration: Phaser.Math.Between(2000, 4000),
                yoyo: true,
                repeat: -1
            });
        }
    }
    
    createEnemy() {
        const width = this.cameras.main.width;
        
        // Визуализация врага (процедурная)
        this.enemy = this.add.container(width / 2, 200);
        
        // Тело
        const body = this.add.circle(0, 0, 60, 0x4a0e4e);
        
        // Глаза
        const eye1 = this.add.circle(-20, -10, 8, 0xff0000);
        const eye2 = this.add.circle(20, -10, 8, 0xff0000);
        
        // Аура
        const aura = this.add.circle(0, 0, 80, 0x9370db, 0.2);
        
        this.enemy.add([aura, body, eye1, eye2]);
        
        // Анимация врага
        this.tweens.add({
            targets: this.enemy,
            y: 190,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.tweens.add({
            targets: aura,
            scaleX: 1.2,
            scaleY: 1.2,
            alpha: 0.4,
            duration: 1500,
            yoyo: true,
            repeat: -1
        });
        
        // Мигание глаз
        this.time.addEvent({
            delay: 3000,
            callback: () => {
                this.tweens.add({
                    targets: [eye1, eye2],
                    scaleY: 0.1,
                    duration: 100,
                    yoyo: true
                });
            },
            loop: true
        });
    }
    
    createBattleUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Информация о враге
        this.enemyNameText = this.add.text(width / 2, 100, this.enemyData.name, {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        this.enemyHPBar = this.createHealthBar(width / 2 - 150, 130, 300, 20, 
            this.enemyData.hp, this.enemyData.maxHp, 0xff0000);
        
        // Информация об игроке
        this.playerHPBar = this.createHealthBar(50, height - 150, 200, 15,
            window.gameState.hp, window.gameState.maxHp, 0x00ff00);
        
        this.playerNameText = this.add.text(50, height - 170, window.gameState.playerName, {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff'
        });
        
        // Меню действий
        this.createActionMenu();
    }
    
    createHealthBar(x, y, width, height, current, max, color) {
        const container = this.add.container(x, y);
        
        const bg = this.add.rectangle(0, 0, width, height, 0x000000);
        bg.setOrigin(0, 0.5);
        
        const bar = this.add.rectangle(0, 0, width * (current / max), height, color);
        bar.setOrigin(0, 0.5);
        
        const border = this.add.rectangle(0, 0, width, height);
        border.setOrigin(0, 0.5);
        border.setStrokeStyle(2, 0xffffff);
        border.isFilled = false;
        
        container.add([bg, bar, border]);
        container.bar = bar;
        container.maxWidth = width;
        
        return container;
    }
    
    createActionMenu() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.actionMenu = this.add.container(width / 2, height - 80);
        
        const menuBg = this.add.rectangle(0, 0, 600, 100, 0x000000, 0.8);
        menuBg.setStrokeStyle(3, 0xffffff);
        
        const actions = [
            { text: '⚔ АТАКА', x: -200, action: () => this.selectAttack() },
            { text: '🛡 ЗАЩИТА', x: -70, action: () => this.selectDefend() },
            { text: '💬 ДЕЙСТВИЕ', x: 70, action: () => this.selectAct() },
            { text: '🎒 ПРЕДМЕТ', x: 200, action: () => this.selectItem() }
        ];
        
        this.actionMenu.add(menuBg);
        
        actions.forEach((action, index) => {
            const btn = this.add.text(action.x, 0, action.text, {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#ffffff'
            }).setOrigin(0.5).setInteractive();
            
            btn.on('pointerover', () => {
                btn.setColor('#00ffff');
                btn.setScale(1.1);
            });
            
            btn.on('pointerout', () => {
                btn.setColor('#ffffff');
                btn.setScale(1);
            });
            
            btn.on('pointerdown', action.action);
            
            this.actionMenu.add(btn);
        });
    }
    
    selectAttack() {
        if (!this.playerTurn) return;
        
        this.playerTurn = false;
        this.actionMenu.setVisible(false);
        
        // Мини-игра для атаки
        this.startAttackMinigame();
    }
    
    startAttackMinigame() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Полоса для тайминга
        const bar = this.add.rectangle(width / 2, height / 2, 400, 30, 0x333333);
        bar.setStrokeStyle(3, 0xffffff);
        
        const targetZone = this.add.rectangle(width / 2, height / 2, 60, 30, 0x00ff00, 0.5);
        
        const cursor = this.add.rectangle(width / 2 - 200, height / 2, 10, 30, 0xff0000);
        
        let moving = true;
        
        this.tweens.add({
            targets: cursor,
            x: width / 2 + 200,
            duration: 1500,
            onComplete: () => {
                if (moving) {
                    this.performAttack(0); // Промах
                    bar.destroy();
                    targetZone.destroy();
                    cursor.destroy();
                }
            }
        });
        
        const hitHandler = this.input.keyboard.once('keydown-Z', () => {
            if (!moving) return;
            moving = false;
            
            const distance = Math.abs(cursor.x - targetZone.x);
            let damage = 20;
            
            if (distance < 30) {
                damage = 40; // Критический удар
                this.showBattleMessage('КРИТИЧЕСКИЙ УДАР!', 1000);
            } else if (distance < 60) {
                damage = 30; // Хороший удар
            } else {
                damage = 15; // Слабый удар
            }
            
            this.performAttack(damage);
            bar.destroy();
            targetZone.destroy();
            cursor.destroy();
        });
    }
    
    performAttack(damage) {
        this.enemyData.hp = Math.max(0, this.enemyData.hp - damage);
        
        // Обновление HP бара
        this.tweens.add({
            targets: this.enemyHPBar.bar,
            width: this.enemyHPBar.maxWidth * (this.enemyData.hp / this.enemyData.maxHp),
            duration: 500
        });
        
        // Эффект удара
        this.cameras.main.shake(200, 0.01);
        this.tweens.add({
            targets: this.enemy,
            x: this.enemy.x + 20,
            duration: 50,
            yoyo: true,
            repeat: 3
        });
        
        if (damage > 0) {
            this.showDamageNumber(this.enemy.x, this.enemy.y, damage);
        }
        
        if (this.enemyData.hp <= 0) {
            this.victory();
        } else {
            this.time.delayedCall(1000, () => this.enemyTurn());
        }
    }
    
    selectDefend() {
        if (!this.playerTurn) return;
        
        this.playerTurn = false;
        this.actionMenu.setVisible(false);
        
        this.showBattleMessage('Вы готовитесь к защите...', 1500);
        
        // Временный бафф защиты
        window.gameState.defendBuff = true;
        
        this.time.delayedCall(1500, () => this.enemyTurn());
    }
    
    selectAct() {
        if (!this.playerTurn) return;
        
        this.playerTurn = false;
        this.actionMenu.setVisible(false);
        
        // Меню действий
        this.showActMenu();
    }
    
    showActMenu() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const actMenu = this.add.container(width / 2, height / 2);
        
        const bg = this.add.rectangle(0, 0, 400, 300, 0x000000, 0.9);
        bg.setStrokeStyle(3, 0x00ffff);
        
        const title = this.add.text(0, -120, 'Выберите действие:', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        const acts = [
            { text: '💝 Проявить доброту', effect: 'kindness' },
            { text: '😄 Пошутить', effect: 'humor' },
            { text: '😠 Запугать', effect: 'intimidate' },
            { text: '🔍 Изучить', effect: 'check' }
        ];
        
        actMenu.add([bg, title]);
        
        acts.forEach((act, index) => {
            const btn = this.add.text(0, -60 + index * 50, act.text, {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#ffffff'
            }).setOrigin(0.5).setInteractive();
            
            btn.on('pointerover', () => btn.setColor('#00ffff'));
            btn.on('pointerout', () => btn.setColor('#ffffff'));
            btn.on('pointerdown', () => {
                actMenu.destroy();
                this.performAct(act.effect);
            });
            
            actMenu.add(btn);
        });
        
        actMenu.setDepth(100);
    }
    
    performAct(effect) {
        let message = '';
        let success = false;
        
        switch (effect) {
            case 'kindness':
                if (this.enemyData.weaknesses.includes('kindness')) {
                    message = `${this.enemyData.name} успокаивается...`;
                    this.enemyData.hp -= 20;
                    success = true;
                } else {
                    message = 'Это не сработало.';
                }
                break;
            case 'humor':
                message = 'Вы рассказали шутку. Враг озадачен.';
                this.enemyData.attack -= 5;
                break;
            case 'intimidate':
                message = 'Вы пытаетесь запугать врага!';
                if (Phaser.Math.Between(0, 1) === 1) {
                    this.enemyData.defense -= 5;
                    success = true;
                }
                break;
            case 'check':
                message = `${this.enemyData.name} - HP: ${this.enemyData.hp}/${this.enemyData.maxHp}`;
                break;
        }
        
        this.showBattleMessage(message, 2000);
        
        if (this.enemyData.hp <= 0) {
            this.time.delayedCall(2000, () => this.victory());
        } else {
            this.time.delayedCall(2000, () => this.enemyTurn());
        }
    }
    
    selectItem() {
        if (!this.playerTurn) return;
        
        this.showBattleMessage('У вас пока нет предметов.', 1500);
        this.time.delayedCall(1500, () => {
            this.actionMenu.setVisible(true);
        });
    }
    
    enemyTurn() {
        this.showBattleMessage(`${this.enemyData.name} атакует!`, 1500);
        
        // Move enemy towards player
        this.tweens.add({
            targets: this.enemy,
            x: this.cameras.main.width / 2 - 50,
            y: 250,
            duration: 800,
            onComplete: () => {
                // Attack animation
                this.tweens.add({
                    targets: this.enemy,
                    x: this.cameras.main.width / 2 + 50,
                    duration: 200,
                    yoyo: true,
                    onComplete: () => {
                        // Calculate damage
                        let damage = this.enemyData.attack;
                        if (window.gameState.defendBuff) {
                            damage = Math.floor(damage / 2);
                            window.gameState.defendBuff = false;
                        }
                        
                        window.gameState.hp = Math.max(0, window.gameState.hp - damage);
                        
                        // Update HP bar
                        this.tweens.add({
                            targets: this.playerHPBar.bar,
                            width: this.playerHPBar.maxWidth * (window.gameState.hp / window.gameState.maxHp),
                            duration: 300
                        });
                        
                        this.showDamageNumber(this.playerHeart.x, this.playerHeart.y, damage);
                        
                        // Damage effect
                        this.cameras.main.flash(100, 255, 0, 0);
                        
                        if (window.gameState.hp <= 0) {
                            this.gameOver();
                        } else {
                            // Return enemy to position
                            this.tweens.add({
                                targets: this.enemy,
                                x: this.cameras.main.width / 2,
                                y: 200,
                                duration: 500,
                                onComplete: () => {
                                    this.playerTurn = true;
                                    this.actionMenu.setVisible(true);
                                }
                            });
                        }
                    }
                });
            }
        });
    }
    
    showDamageNumber(x, y, damage) {
        const dmgText = this.add.text(x, y, `-${damage}`, {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ff0000',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: dmgText,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => dmgText.destroy()
        });
    }
    
    showBattleMessage(text, duration) {
        const width = this.cameras.main.width;
        
        if (this.battleMessage) {
            this.battleMessage.destroy();
        }
        
        this.battleMessage = this.add.text(width / 2, 350, text, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        
        this.time.delayedCall(duration, () => {
            if (this.battleMessage) {
                this.battleMessage.destroy();
            }
        });
    }
    
    victory() {
        this.showBattleMessage('ПОБЕДА!', 3000);
        
        // Награды
        const expGain = 50;
        const goldGain = 30;
        
        window.gameState.exp += expGain;
        window.gameState.gold += goldGain;
        
        this.time.delayedCall(3000, () => {
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                this.scene.stop();
                this.scene.resume('WorldScene');
            });
        });
    }
    
    gameOver() {
        this.showBattleMessage('ПОРАЖЕНИЕ...', 3000);
        
        this.time.delayedCall(3000, () => {
            this.scene.start('MenuScene');
        });
    }
    
    update() {
        // Обновление логики боя
    }
}
