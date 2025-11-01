export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Создаем прогресс-бар
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);
        
        const loadingText = this.add.text(width / 2, height / 2 - 60, 'Загрузка...', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        const percentText = this.add.text(width / 2, height / 2 - 5, '0%', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Обработчики загрузки
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x00ffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30);
            percentText.setText(parseInt(value * 100) + '%');
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });
        
        // Здесь будет загрузка ассетов
        // Для демонстрации создадим задержку
        for (let i = 0; i < 10; i++) {
            this.load.image(`dummy${i}`, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
        }
    }

    create() {
        // Переход к главному меню
        this.time.delayedCall(500, () => {
            this.scene.start('MenuScene');
        });
    }
}
