export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        
        // Создаем визуализацию игрока
        this.sprite = scene.physics.add.sprite(x, y, null);
        
        // Рисуем игрока
        this.graphics = scene.add.graphics();
        this.createPlayerGraphics();
        
        // Настройка физики
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setSize(30, 40);
        this.sprite.setDepth(10);
        
        // Анимация
        this.createAnimations();
    }
    
    createPlayerGraphics() {
        const graphics = this.graphics;
        graphics.clear();
        
        // Тело (плащ)
        graphics.fillStyle(0x00ffff, 1);
        graphics.fillCircle(0, 0, 20);
        
        // Голова
        graphics.fillStyle(0xffdbac, 1);
        graphics.fillCircle(0, -25, 12);
        
        // Глаза
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(-5, -27, 3);
        graphics.fillCircle(5, -27, 3);
        
        // Руки
        graphics.fillStyle(0x00ffff, 1);
        graphics.fillRect(-25, -5, 10, 20);
        graphics.fillRect(15, -5, 10, 20);
        
        // Ноги
        graphics.fillRect(-10, 15, 8, 20);
        graphics.fillRect(2, 15, 8, 20);
        
        // Создаем текстуру из графики
        graphics.generateTexture('player', 60, 80);
        this.sprite.setTexture('player');
        
        graphics.destroy();
    }
    
    createAnimations() {
        // Анимация ходьбы (простая)
        this.walkAnimation = this.scene.tweens.add({
            targets: this.sprite,
            scaleY: 1.05,
            duration: 200,
            yoyo: true,
            paused: true
        });
    }
    
    update() {
        // Обновление анимаций в зависимости от движения
        if (this.sprite.body.velocity.x !== 0 || this.sprite.body.velocity.y !== 0) {
            if (!this.walkAnimation.isPlaying()) {
                this.walkAnimation.play();
            }
        } else {
            this.walkAnimation.pause();
            this.sprite.setScale(1, 1);
        }
    }
}
