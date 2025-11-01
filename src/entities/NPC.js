export default class NPC {
    constructor(scene, x, y, name, type, dialogue) {
        this.scene = scene;
        this.name = name;
        this.type = type;
        this.dialogue = dialogue;
        this.mood = 'neutral';
        this.schedule = this.generateSchedule();
        this.currentActivity = 'idle';
        this.dialogueHistory = [];
        this.interactionCount = 0;
        this.lastInteractionTime = 0;
        this.relationship = 0; // -100 to 100
        this.dialogueTree = this.createDialogueTree();
        
        // Создаем спрайт
        this.sprite = scene.physics.add.sprite(x, y, null);
        this.createNPCGraphics(type);
        
        // Настройка физики
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setSize(30, 40);
        this.sprite.setDepth(10);
        
        // Имя над головой
        this.nameText = scene.add.text(x, y - 40, name, {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 2 }
        }).setOrigin(0.5).setDepth(11);
        
        // Индикатор настроения
        this.moodIndicator = scene.add.circle(x, y - 50, 5, this.getMoodColor());
        this.moodIndicator.setDepth(11);
        
        // AI поведение
        this.aiTimer = scene.time.addEvent({
            delay: 3000,
            callback: () => this.performAI(),
            loop: true
        });
    }
    
    createNPCGraphics(type) {
        const graphics = this.scene.add.graphics();
        graphics.clear();
        
        // Разные цвета для разных типов
        const colors = {
            mystic: 0x9370db,
            merchant: 0xffd700,
            guardian: 0x4169e1,
            rebel: 0xff4500,
            child: 0xffb6c1,
            default: 0x808080
        };
        
        const color = colors[type] || colors.default;
        
        // Тело
        graphics.fillStyle(color, 1);
        graphics.fillCircle(0, 0, 18);
        
        // Голова
        graphics.fillStyle(0xffdbac, 1);
        graphics.fillCircle(0, -23, 10);
        
        // Глаза
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(-4, -24, 2);
        graphics.fillCircle(4, -24, 2);
        
        // Особенности типа
        switch (type) {
            case 'mystic':
                // Шляпа волшебника
                graphics.fillStyle(0x4b0082, 1);
                graphics.fillTriangle(-10, -33, 10, -33, 0, -50);
                break;
            case 'merchant':
                // Монета
                graphics.fillStyle(0xffd700, 1);
                graphics.fillCircle(15, -20, 5);
                break;
            case 'guardian':
                // Щит
                graphics.fillStyle(0x708090, 1);
                graphics.fillRect(-20, -5, 8, 15);
                break;
            case 'rebel':
                // Повязка
                graphics.fillStyle(0xff0000, 1);
                graphics.fillRect(-8, -25, 16, 3);
                break;
        }
        
        // Создаем текстуру
        const textureName = `npc_${type}_${Date.now()}`;
        graphics.generateTexture(textureName, 50, 70);
        this.sprite.setTexture(textureName);
        
        graphics.destroy();
    }
    
    generateSchedule() {
        // Генерируем расписание для NPC
        return {
            morning: 'work',
            day: 'socialize',
            evening: 'relax',
            night: 'sleep'
        };
    }
    
    performAI() {
        // Простой AI: случайное движение или остановка
        const action = Phaser.Math.Between(0, 3);
        
        switch (action) {
            case 0: // Двигаться случайно
                const angle = Phaser.Math.Between(0, 360) * Math.PI / 180;
                const speed = 50;
                this.sprite.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );
                
                // Остановка через случайное время
                this.scene.time.delayedCall(Phaser.Math.Between(1000, 3000), () => {
                    this.sprite.setVelocity(0, 0);
                });
                break;
                
            case 1: // Остановиться
                this.sprite.setVelocity(0, 0);
                break;
                
            case 2: // Изменить настроение
                const moods = ['happy', 'neutral', 'sad', 'angry'];
                this.mood = moods[Phaser.Math.Between(0, moods.length - 1)];
                this.moodIndicator.setFillStyle(this.getMoodColor());
                break;
                
            case 3: // Взаимодействие с окружением
                this.currentActivity = ['idle', 'thinking', 'working'][Phaser.Math.Between(0, 2)];
                break;
        }
    }
    
    getMoodColor() {
        const colors = {
            happy: 0x00ff00,
            neutral: 0xffff00,
            sad: 0x0000ff,
            angry: 0xff0000
        };
        return colors[this.mood] || colors.neutral;
    }
    
    update(time, delta) {
        // Обновление позиции текста и индикатора
        if (this.nameText) {
            this.nameText.setPosition(this.sprite.x, this.sprite.y - 40);
        }
        
        if (this.moodIndicator) {
            this.moodIndicator.setPosition(this.sprite.x, this.sprite.y - 50);
        }
        
        // Обновление активности в зависимости от времени суток
        const timeOfDay = window.gameState.timeOfDay;
        if (this.schedule[timeOfDay]) {
            this.currentActivity = this.schedule[timeOfDay];
        }
    }
    
    createDialogueTree() {
        // Создаём дерево диалогов для каждого типа NPC
        const dialogueTrees = {
            mystic: [
                {
                    condition: () => this.interactionCount === 0,
                    text: "Приветствую, странник. Время течёт иначе в этих землях... Я чувствую в тебе особую ауру.",
                    responses: [
                        { text: "Расскажите мне о этом месте", action: () => this.changeRelationship(5) },
                        { text: "Что вы знаете о портале?", action: () => this.changeRelationship(10) },
                        { text: "Мне некогда", action: () => this.changeRelationship(-5) }
                    ]
                },
                {
                    condition: () => this.interactionCount > 0 && this.relationship >= 20,
                    text: "Ах, мой друг возвращается. Звёзды говорят, что твой путь полон испытаний, но и великих возможностей.",
                    responses: [
                        { text: "Научите меня магии", action: () => this.teachMagic() },
                        { text: "Что вы видите в будущем?", action: () => this.tellFortune() }
                    ]
                },
                {
                    condition: () => this.relationship < 0,
                    text: "Тьма окружает тебя... Уходи, пока не поздно.",
                    responses: []
                },
                {
                    condition: () => window.gameState.timeOfDay === 'night',
                    text: "Ночь - время магии. Чувствуешь, как энергия пульсирует вокруг нас?",
                    responses: [
                        { text: "Да, это удивительно", action: () => this.changeRelationship(3) },
                        { text: "Я ничего не чувствую", action: () => this.changeRelationship(-2) }
                    ]
                }
            ],
            merchant: [
                {
                    condition: () => this.interactionCount === 0,
                    text: "Добро пожаловать! У меня лучшие товары во всей округе. Что тебя интересует?",
                    responses: [
                        { text: "Покажите ваши товары", action: () => this.showShop() },
                        { text: "Просто смотрю", action: () => this.changeRelationship(-2) },
                        { text: "Слишком дорого!", action: () => this.changeRelationship(-5) }
                    ]
                },
                {
                    condition: () => window.gameState.gold > 100,
                    text: "О, вижу у тебя есть золото! Могу предложить особые товары для щедрых покупателей.",
                    responses: [
                        { text: "Покажите особые товары", action: () => this.showRareShop() },
                        { text: "Может быть позже", action: () => {} }
                    ]
                },
                {
                    condition: () => this.relationship >= 30,
                    text: "Мой лучший клиент! Для тебя у меня особая скидка - 20%!",
                    responses: [
                        { text: "Спасибо! Покажите товары", action: () => this.showShopWithDiscount() }
                    ]
                }
            ],
            guardian: [
                {
                    condition: () => this.interactionCount === 0,
                    text: "Я защищаю эту деревню уже 20 лет. Здесь всё спокойно... пока ты не нарушаешь порядок.",
                    responses: [
                        { text: "Я здесь, чтобы помочь", action: () => this.changeRelationship(10) },
                        { text: "Кто вы такой, чтобы мне указывать?", action: () => this.changeRelationship(-15) },
                        { text: "Есть ли здесь опасность?", action: () => this.changeRelationship(5) }
                    ]
                },
                {
                    condition: () => window.gameState.reputation.guardians >= 50,
                    text: "Товарищ! Твоя помощь неоценима. Мы рады видеть тебя в наших рядах.",
                    responses: [
                        { text: "Есть ли задания?", action: () => this.offerQuest() },
                        { text: "Научите меня сражаться", action: () => this.teachCombat() }
                    ]
                },
                {
                    condition: () => window.gameState.reputation.rebels > 30,
                    text: "Я слышал, ты общаешься с бунтарями. Будь осторожен, странник.",
                    responses: [
                        { text: "Я просто изучаю обе стороны", action: () => {} },
                        { text: "Это не ваше дело", action: () => this.changeRelationship(-10) }
                    ]
                }
            ],
            rebel: [
                {
                    condition: () => this.interactionCount === 0,
                    text: "Система прогнила. Пора что-то менять! Ты с нами или против нас?",
                    responses: [
                        { text: "Я с вами!", action: () => this.changeRelationship(15) },
                        { text: "Мне нужно подумать", action: () => this.changeRelationship(0) },
                        { text: "Вы опасны", action: () => this.changeRelationship(-20) }
                    ]
                },
                {
                    condition: () => window.gameState.reputation.rebels >= 40,
                    text: "Брат! Вместе мы изменим этот мир. У меня есть план...",
                    responses: [
                        { text: "Я готов помочь", action: () => this.offerRebelQuest() },
                        { text: "Расскажи подробнее", action: () => this.explainPlan() }
                    ]
                },
                {
                    condition: () => window.gameState.reputation.guardians > 30,
                    text: "Ты работаешь на стражей? Предатель!",
                    responses: [
                        { text: "Я пытаюсь найти баланс", action: () => this.changeRelationship(-5) },
                        { text: "Извини, я передумал", action: () => this.changeRelationship(-10) }
                    ]
                }
            ],
            child: [
                {
                    condition: () => this.interactionCount === 0,
                    text: "*всхлипывает* Ты видел моего кота? Он убежал и я не могу его найти...",
                    responses: [
                        { text: "Я помогу тебе найти его", action: () => this.startCatQuest() },
                        { text: "Не плачь, всё будет хорошо", action: () => this.changeRelationship(5) },
                        { text: "Извини, я спешу", action: () => this.changeRelationship(-3) }
                    ]
                },
                {
                    condition: () => window.gameState.flags.foundCat,
                    text: "Ты нашёл моего Мурзика! Спасибо, спасибо! Вот, возьми мою любимую игрушку!",
                    responses: [
                        { text: "Спасибо, малышка", action: () => this.giveReward() }
                    ]
                },
                {
                    condition: () => this.relationship >= 20,
                    text: "Ты мой лучший друг! Хочешь поиграть со мной?",
                    responses: [
                        { text: "Конечно!", action: () => this.playGame() },
                        { text: "Может быть позже", action: () => {} }
                    ]
                }
            ]
        };

        return dialogueTrees[this.type] || [];
    }

    getDialogue() {
        // Находим подходящий диалог на основе условий
        const availableDialogues = this.dialogueTree.filter(d => !d.condition || d.condition());
        
        if (availableDialogues.length > 0) {
            // Выбираем первый подходящий диалог
            return availableDialogues[0];
        }
        
        // Дефолтный диалог
        return {
            text: this.dialogue,
            responses: [
                { text: "До свидания", action: () => {} }
            ]
        };
    }

    changeRelationship(amount) {
        this.relationship = Math.max(-100, Math.min(100, this.relationship + amount));
        window.gameState.relationships[this.name] = this.relationship;
        
        // Меняем настроение в зависимости от отношений
        if (this.relationship > 50) {
            this.mood = 'happy';
        } else if (this.relationship < -30) {
            this.mood = 'angry';
        } else {
            this.mood = 'neutral';
        }
        
        this.moodIndicator.setFillStyle(this.getMoodColor());
    }

    teachMagic() {
        window.gameState.mp = Math.min(window.gameState.maxMp, window.gameState.mp + 10);
        window.gameState.exp += 50;
        this.scene.showMessage('Мудрец научил тебя новому заклинанию! +10 MP, +50 опыта', 3000);
    }

    tellFortune() {
        const fortunes = [
            'Вижу великую битву в твоём будущем...',
            'Звёзды говорят о встрече с важным союзником.',
            'Остерегайся предательства со стороны близких.',
            'Твой путь приведёт к древним сокровищам.',
            'Тёмные силы следят за тобой...'
        ];
        const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
        this.scene.showMessage(`Предсказание: ${fortune}`, 4000);
    }

    showShop() {
        this.scene.showMessage('Система торговли в разработке. Скоро будет доступна!', 2000);
        this.changeRelationship(2);
    }

    showRareShop() {
        this.scene.showMessage('Редкие товары! (В разработке)', 2000);
        this.changeRelationship(5);
    }

    showShopWithDiscount() {
        this.scene.showMessage('Скидка 20%! (В разработке)', 2000);
    }

    offerQuest() {
        this.scene.showMessage('Квест от стражей: Защити деревню! (В разработке)', 3000);
    }

    teachCombat() {
        window.gameState.exp += 100;
        this.scene.showMessage('Страж обучил тебя новым приёмам! +100 опыта', 2000);
    }

    offerRebelQuest() {
        this.scene.showMessage('Квест бунтарей: Свергни тирана! (В разработке)', 3000);
    }

    explainPlan() {
        this.scene.showMessage('Кай рассказывает о плане революции...', 3000);
    }

    startCatQuest() {
        window.gameState.quests.push({
            id: 'find_cat',
            name: 'Найти кота Мурзика',
            description: 'Помоги Мие найти её потерявшегося кота',
            active: true
        });
        this.scene.showMessage('Новый квест: Найти кота Мурзика', 2000);
        this.changeRelationship(10);
    }

    giveReward() {
        window.gameState.inventory.push({
            id: 'magic_toy',
            name: 'Волшебная игрушка',
            description: 'Подарок от Мии. Излучает тепло и доброту.'
        });
        window.gameState.exp += 25;
        this.scene.showMessage('Получено: Волшебная игрушка! +25 опыта', 2000);
    }

    playGame() {
        this.scene.showMessage('Ты поиграл с Мией. Она счастлива! +5 к отношениям', 2000);
        this.changeRelationship(5);
    }

    interact(player) {
        // Реакция на взаимодействие с игроком
        this.interactionCount++;
        this.lastInteractionTime = Date.now();
        
        const dialogue = this.getDialogue();
        
        return {
            name: this.name,
            dialogue: dialogue.text,
            responses: dialogue.responses,
            mood: this.mood,
            type: this.type,
            relationship: this.relationship
        };
    }
}
