'use strict';

const countOutput = document.getElementById('count');
const incrementButton = document.getElementById('increment');
const resetButton = document.getElementById('reset');
let count = 0n;

function renderCount() {
  countOutput.textContent = count.toString();
}

incrementButton.addEventListener('click', () => {
  count += 1n;
  renderCount();
});

resetButton.addEventListener('click', () => {
  count = 0n;
  renderCount();
});
