export default function getRandomColor() {
  const possibleColors = [
    '#00D47E',
    '#FF5555',
    '#1890FF',
    '#FFC812',
    '#102830',
  ];

  return possibleColors[Math.floor(Math.random() * possibleColors.length)];
}
