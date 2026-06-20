const messagesElement = document.getElementById('messages');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

const BOT_AVATAR = 'img/bot.png';
const USER_AVATAR = 'img/user.png';

let isStarted = false;
let userName = '';
let numbers = [];
let waitingForAction = false;

messageInput.addEventListener('input', () => {
  const hasText = messageInput.value.trim().length > 0;

  sendButton.disabled = !hasText;
  sendButton.classList.toggle('is-active', hasText);
});

chatForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const message = messageInput.value.trim();

  if (!message) {
    return;
  }

  addMessage(message, 'user');

  messageInput.value = '';
  sendButton.disabled = true;
  sendButton.classList.remove('is-active');

  showTyping(() => {
    const botAnswer = getBotAnswer(message);
    addMessage(botAnswer, 'bot');
  });
});

function addMessage(text, author) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', `message--${author}`);

  const avatarElement = document.createElement('img');
  avatarElement.classList.add('message__avatar');
  avatarElement.src = author === 'bot' ? BOT_AVATAR : USER_AVATAR;
  avatarElement.alt = author === 'bot' ? 'Аватар' : 'Аватар';

  const bubbleElement = document.createElement('div');
  bubbleElement.classList.add('message__bubble');
  bubbleElement.textContent = text;

  messageElement.appendChild(avatarElement);
  messageElement.appendChild(bubbleElement);

  messagesElement.prepend(messageElement);
}

function showTyping(callback) {
  const typingElement = document.createElement('div');
  typingElement.classList.add('message', 'message--bot', 'message--typing');

  const avatarElement = document.createElement('img');
  avatarElement.classList.add('message__avatar');
  avatarElement.src = BOT_AVATAR;
  avatarElement.alt = 'Аватар';

  const bubbleElement = document.createElement('div');
  bubbleElement.classList.add('message__bubble');

  const dotsElement = document.createElement('div');
  dotsElement.classList.add('typing');

  dotsElement.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;

  bubbleElement.appendChild(dotsElement);
  typingElement.appendChild(avatarElement);
  typingElement.appendChild(bubbleElement);

  messagesElement.prepend(typingElement);

  setTimeout(() => {
    typingElement.remove();
    callback();
  }, 900);
}

function getBotAnswer(message) {
  if (message === '/stop') {
    isStarted = false;
    userName = '';
    numbers = [];
    waitingForAction = false;
    return 'Всего доброго, если хочешь поговорить пиши /start';
  }

  if (message === '/help') {
    return 'Для начала работы пиши /start. Далее введи своё имя с помощью /name. Посчитать с помощью команды /number и числа через запятую. Для завершения используй /stop';
  }

  if (!isStarted) {
    if (message === '/start') {
      isStarted = true;
      return 'Привет, меня зовут Чат-бот, а как зовут тебя? Введи /name и своё имя :)';
    }

    return 'Введи команду /start, для начала общения';
  }

  if (message === '/start') {
    return 'Мы уже начали общение, как тебя зовут? Введи команду /name и своё имя :)';
  }

  if (message.startsWith('/name')) {
    const name = message.replace('/name', '').trim();

    if (!name) {
      return 'Введи имя после команды /name';
    }

    userName = name;

    return `Привет ${userName}, приятно познакомится. Я умею считать, введи числа которые надо посчитать с помощью /number через запятую`;
  }

  if (message.startsWith('/number')) {
    if (!userName) {
      return 'Сначала давай познакомимся! Введи имя командой /name';
    }

    const rawNumbers = message.replace('/number', '').trim();
    if (!rawNumbers) {
      return `${userName}, введи числа после команды /number через запятую`;
    }

    const parsedNumbers = rawNumbers
      .split(',')
      .map((number) => Number(number.trim()))
      .filter((number) => !Number.isNaN(number));

    if (parsedNumbers.length < 2) {
      return 'Введи минимум два числа через запятую';
    }

    numbers = parsedNumbers;
    waitingForAction = true;

    return 'Введи одно из действий: -, +, *, /';
  }

  if (waitingForAction) {
    if (['-', '+', '*', '/'].includes(message)) {
      const result = calculate(numbers, message);

      waitingForAction = false;
      numbers = [];

      return `Результат: ${result}`;
    }

    return 'Введи одно из действий: -, +, *, /';
  }

  return 'Я не понимаю, введи другую команду или /help!';
}

function calculate(values, action) {
  switch (action) {
    case '+':
      return values.reduce((acc, value) => acc + value, 0);

    case '-':
      return values.slice(1).reduce((acc, value) => acc - value, values[0]);

    case '*':
      return values.reduce((acc, value) => acc * value, 1);

    case '/':
      if (values.slice(1).includes(0)) {
        return 'деление на ноль невозможно!';
      }

      return values.slice(1).reduce((acc, value) => acc / value, values[0]);

    default:
      return 'неизвестное действие';
  }
}