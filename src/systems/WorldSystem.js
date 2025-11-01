export default class WorldSystem {
    constructor(scene) {
        this.scene = scene;
        this.events = [];
        this.ecosystem = {
            creatures: [],
            plants: [],
            resources: []
        };
        
        this.initializeEcosystem();
        this.scheduleRandomEvents();
    }
    
    initializeEcosystem() {
        // Создаем живую экосистему
        this.spawnCreatures();
        this.createResourceNodes();
    }
    
    spawnCreatures() {
        // Различные существа, которые живут своей жизнью
        const creatureTypes = [
            { name: 'Светлячок', color: 0xffff00, behavior: 'fly' },
            { name: 'Лесной дух', color: 0x00ff00, behavior: 'wander' },
            { name: 'Тень', color: 0x4a0e4e, behavior: 'hide' }
        ];
        
        for (let i = 0; i < 20; i++) {
            const type = creatureTypes[Phaser.Math.Between(0, creatureTypes.length - 1)];
            const creature = {
                x: Phaser.Math.Between(0, 2000),
                y: Phaser.Math.Between(0, 2000),
                type: type.name,
                color: type.color,
                behavior: type.behavior,
                sprite: null,
                energy: 100,
                hunger: 0
            };
            
            // Создаем визуализацию
            creature.sprite = this.scene.add.circle(creature.x, creature.y, 8, creature.color, 0.7);
            creature.sprite.setDepth(5);
            
            this.ecosystem.creatures.push(creature);
            this.animateCreature(creature);
        }
    }
    
    animateCreature(creature) {
        switch (creature.behavior) {
            case 'fly':
                this.scene.tweens.add({
                    targets: creature.sprite,
                    x: creature.x + Phaser.Math.Between(-200, 200),
                    y: creature.y + Phaser.Math.Between(-200, 200),
                    duration: 3000,
                    ease: 'Sine.easeInOut',
                    onComplete: () => {
                        creature.x = creature.sprite.x;
                        creature.y = creature.sprite.y;
                        this.animateCreature(creature);
                    }
                });
                
                // Мерцание
                this.scene.tweens.add({
                    targets: creature.sprite,
                    alpha: 0.3,
                    duration: 500,
                    yoyo: true,
                    repeat: -1
                });
                break;
                
            case 'wander':
                this.scene.time.delayedCall(Phaser.Math.Between(2000, 5000), () => {
                    const newX = Phaser.Math.Clamp(
                        creature.x + Phaser.Math.Between(-100, 100),
                        0, 2000
                    );
                    const newY = Phaser.Math.Clamp(
                        creature.y + Phaser.Math.Between(-100, 100),
                        0, 2000
                    );
                    
                    this.scene.tweens.add({
                        targets: creature.sprite,
                        x: newX,
                        y: newY,
                        duration: 2000,
                        onComplete: () => {
                            creature.x = newX;
                            creature.y = newY;
                            this.animateCreature(creature);
                        }
                    });
                });
                break;
                
            case 'hide':
                // Появляется и исчезает
                this.scene.tweens.add({
                    targets: creature.sprite,
                    alpha: 0,
                    duration: 2000,
                    yoyo: true,
                    repeat: -1,
                    repeatDelay: 3000
                });
                break;
        }
    }
    
    createResourceNodes() {
        // Ресурсные узлы (травы, кристаллы и т.д.)
        const resourceTypes = [
            { name: 'Светящийся гриб', color: 0x00ffff, value: 10 },
            { name: 'Магический кристалл', color: 0x9370db, value: 25 },
            { name: 'Древняя руна', color: 0xffd700, value: 50 }
        ];
        
        for (let i = 0; i < 30; i++) {
            const type = resourceTypes[Phaser.Math.Between(0, resourceTypes.length - 1)];
            const resource = {
                x: Phaser.Math.Between(0, 2000),
                y: Phaser.Math.Between(0, 2000),
                type: type.name,
                color: type.color,
                value: type.value,
                collected: false,
                sprite: null
            };
            
            resource.sprite = this.scene.add.star(resource.x, resource.y, 5, 5, 10, type.color, 0.8);
            resource.sprite.setDepth(3);
            
            // Анимация мерцания
            this.scene.tweens.add({
                targets: resource.sprite,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 1000,
                yoyo: true,
                repeat: -1
            });
            
            this.ecosystem.resources.push(resource);
        }
    }
    
    scheduleRandomEvents() {
        // Случайные события в мире
        this.scene.time.addEvent({
            delay: 45000, // каждые 45 секунд
            callback: () => this.triggerRandomEvent(),
            loop: true
        });
    }
    
    triggerRandomEvent() {
        const events = [
            {
                name: 'Метеоритный дождь',
                description: 'С неба падают метеориты!',
                effect: () => this.meteorShower()
            },
            {
                name: 'Магическая аномалия',
                description: 'Магия в воздухе сгущается...',
                effect: () => this.magicAnomaly()
            },
            {
                name: 'Миграция существ',
                description: 'Стая существ пролетает мимо.',
                effect: () => this.creatureMigration()
            },
            {
                name: 'Временной разлом',
                description: 'Время течет странно...',
                effect: () => this.timeDistortion()
            }
        ];
        
        const event = events[Phaser.Math.Between(0, events.length - 1)];
        
        // Показываем уведомление
        this.scene.showMessage(`⚠️ ${event.name}: ${event.description}`, 4000);
        
        // Выполняем эффект
        event.effect();
        
        // Сохраняем в историю
        this.events.push({
            name: event.name,
            time: Date.now()
        });
    }
    
    meteorShower() {
        // Создаем падающие метеориты
        for (let i = 0; i < 10; i++) {
            this.scene.time.delayedCall(i * 500, () => {
                const x = Phaser.Math.Between(0, 2000);
                const y = -50;
                
                const meteor = this.scene.add.circle(x, y, 15, 0xff4500);
                meteor.setDepth(50);
                
                // Хвост
                const trail = this.scene.add.circle(x, y - 20, 8, 0xffa500, 0.5);
                trail.setDepth(49);
                
                this.scene.tweens.add({
                    targets: [meteor, trail],
                    y: 2100,
                    duration: 2000,
                    onComplete: () => {
                        // Эффект удара
                        const impact = this.scene.add.circle(meteor.x, meteor.y, 30, 0xff4500, 0.5);
                        impact.setDepth(50);
                        
                        this.scene.tweens.add({
                            targets: impact,
                            scaleX: 2,
                            scaleY: 2,
                            alpha: 0,
                            duration: 500,
                            onComplete: () => impact.destroy()
                        });
                        
                        meteor.destroy();
                        trail.destroy();
                    }
                });
            });
        }
    }
    
    magicAnomaly() {
        // Создаем магические вихри
        for (let i = 0; i < 5; i++) {
            const x = Phaser.Math.Between(200, 1800);
            const y = Phaser.Math.Between(200, 1800);
            
            const vortex = this.scene.add.circle(x, y, 50, 0x9370db, 0.3);
            vortex.setDepth(20);
            
            // Частицы вокруг
            for (let j = 0; j < 20; j++) {
                const particle = this.scene.add.circle(x, y, 3, 0xff00ff, 0.8);
                particle.setDepth(21);
                
                this.scene.tweens.add({
                    targets: particle,
                    x: x + Phaser.Math.Between(-100, 100),
                    y: y + Phaser.Math.Between(-100, 100),
                    alpha: 0,
                    duration: 3000,
                    onComplete: () => particle.destroy()
                });
            }
            
            this.scene.tweens.add({
                targets: vortex,
                scaleX: 2,
                scaleY: 2,
                alpha: 0,
                duration: 5000,
                onComplete: () => vortex.destroy()
            });
        }
        
        // Временный бафф магии
        window.gameState.mp = Math.min(window.gameState.maxMp, window.gameState.mp + 20);
    }
    
    creatureMigration() {
        // Стая существ пролетает
        const startX = -100;
        const startY = Phaser.Math.Between(200, 1800);
        
        for (let i = 0; i < 15; i++) {
            this.scene.time.delayedCall(i * 200, () => {
                const bird = this.scene.add.triangle(
                    startX, 
                    startY + Phaser.Math.Between(-50, 50),
                    0, 10, 10, 0, 20, 10,
                    0x87ceeb
                );
                bird.setDepth(30);
                
                this.scene.tweens.add({
                    targets: bird,
                    x: 2100,
                    duration: 8000,
                    onComplete: () => bird.destroy()
                });
                
                // Анимация взмахов
                this.scene.tweens.add({
                    targets: bird,
                    scaleY: 0.8,
                    duration: 200,
                    yoyo: true,
                    repeat: 40
                });
            });
        }
    }
    
    timeDistortion() {
        // Эффект замедления/ускорения времени
        const originalTimeScale = this.scene.time.timeScale;
        
        this.scene.time.timeScale = 0.5; // Замедление
        
        // Визуальный эффект
        const overlay = this.scene.add.rectangle(1000, 1000, 2000, 2000, 0x9370db, 0.2);
        overlay.setDepth(90);
        
        this.scene.tweens.add({
            targets: overlay,
            alpha: 0.4,
            duration: 1000,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                overlay.destroy();
                this.scene.time.timeScale = originalTimeScale;
            }
        });
    }
    
    update(time, delta) {
        // Обновление экосистемы
        this.updateCreatures(delta);
        this.updateResources();
        this.checkInteractions();
    }
    
    updateCreatures(delta) {
        this.ecosystem.creatures.forEach(creature => {
            // Уменьшение энергии
            creature.energy -= delta * 0.001;
            creature.hunger += delta * 0.002;
            
            // Если голодно, ищет еду
            if (creature.hunger > 50) {
                // Простое поведение поиска ресурсов
                const nearestResource = this.findNearestResource(creature);
                if (nearestResource && !nearestResource.collected) {
                    // Двигается к ресурсу
                    const distance = Phaser.Math.Distance.Between(
                        creature.x, creature.y,
                        nearestResource.x, nearestResource.y
                    );
                    
                    if (distance < 20) {
                        // "Съедает" ресурс
                        creature.hunger = 0;
                        creature.energy = 100;
                        nearestResource.collected = true;
                        nearestResource.sprite.destroy();
                    }
                }
            }
            
            // Если энергия закончилась, существо "умирает" и возрождается
            if (creature.energy <= 0) {
                creature.energy = 100;
                creature.hunger = 0;
                creature.x = Phaser.Math.Between(0, 2000);
                creature.y = Phaser.Math.Between(0, 2000);
                creature.sprite.setPosition(creature.x, creature.y);
            }
        });
    }
    
    updateResources() {
        // Регенерация ресурсов
        this.ecosystem.resources.forEach(resource => {
            if (resource.collected) {
                // Шанс возрождения
                if (Phaser.Math.Between(0, 1000) < 1) {
                    resource.collected = false;
                    resource.x = Phaser.Math.Between(0, 2000);
                    resource.y = Phaser.Math.Between(0, 2000);
                    
                    // Создаем новый спрайт
                    resource.sprite = this.scene.add.star(
                        resource.x, resource.y, 5, 5, 10, resource.color, 0.8
                    );
                    resource.sprite.setDepth(3);
                    
                    this.scene.tweens.add({
                        targets: resource.sprite,
                        scaleX: 1.2,
                        scaleY: 1.2,
                        duration: 1000,
                        yoyo: true,
                        repeat: -1
                    });
                }
            }
        });
    }
    
    checkInteractions() {
        // Проверка взаимодействий между существами
        for (let i = 0; i < this.ecosystem.creatures.length; i++) {
            for (let j = i + 1; j < this.ecosystem.creatures.length; j++) {
                const c1 = this.ecosystem.creatures[i];
                const c2 = this.ecosystem.creatures[j];
                
                const distance = Phaser.Math.Distance.Between(
                    c1.x, c1.y, c2.x, c2.y
                );
                
                // Если близко, взаимодействуют
                if (distance < 30) {
                    // Простое взаимодействие: обмен энергией
                    const avgEnergy = (c1.energy + c2.energy) / 2;
                    c1.energy = avgEnergy;
                    c2.energy = avgEnergy;
                }
            }
        }
    }
    
    findNearestResource(creature) {
        let nearest = null;
        let minDistance = Infinity;
        
        this.ecosystem.resources.forEach(resource => {
            if (!resource.collected) {
                const distance = Phaser.Math.Distance.Between(
                    creature.x, creature.y,
                    resource.x, resource.y
                );
                
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = resource;
                }
            }
        });
        
        return nearest;
    }
    
    getWorldState() {
        return {
            creatures: this.ecosystem.creatures.length,
            resources: this.ecosystem.resources.filter(r => !r.collected).length,
            events: this.events.length
        };
    }
}
