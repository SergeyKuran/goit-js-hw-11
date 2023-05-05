//Функція створення кольору фону при кожному сабміті форми
function getRandomHexColor() {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, 0)}`;
}

export { getRandomHexColor };
