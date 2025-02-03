let isExecuted = false;
let currentUrl = window.location.href;

// Функция для отслеживания изменений URL
const initUrlTracking = () => {
	// Перехват методов History API
	const originalPushState = history.pushState;
	const originalReplaceState = history.replaceState;

	history.pushState = function (state, title, url) {
		originalPushState.apply(history, arguments);
		handleUrlChange();
	};

	history.replaceState = function (state, title, url) {
		originalReplaceState.apply(history, arguments);
		handleUrlChange();
	};

	// Обработчик навигации вперед/назад
	window.addEventListener('popstate', handleUrlChange);
};

const handleUrlChange = () => {
	if (window.location.href !== currentUrl) {
		currentUrl = window.location.href;
		resetActivation();
	}
};

const resetActivation = () => {
	isExecuted = false;
	// Удаляем старые обработчики
	document
		.querySelector('#control-play')
		.removeEventListener('click', handleActivation);
	document.removeEventListener('keydown', handleKeyPress);
	// Вешаем новые обработчики
	document
		.querySelector('#control-play')
		.addEventListener('click', handleActivation);
	document.addEventListener('keydown', handleKeyPress);
};

const handleActivation = () => {
	if (isExecuted) return;
	isExecuted = true;

	// Удаляем обработчики до следующего изменения URL
	document
		.querySelector('#control-play')
		.removeEventListener('click', handleActivation);
	document.removeEventListener('keydown', handleKeyPress);

	const DrugAndDrop = () => {
		const observerConfig = {
			childList: true,
			subtree: true,
		};

		const initObserver = () => {
			const observer = new MutationObserver((mutations, obs) => {
				const box = document.querySelector('#youtube-container');
				if (box) {
					obs.disconnect();
					startDragDrop(box);
				}
			});
			observer.observe(document.body, observerConfig);
		};

		const startDragDrop = box => {
			const injectStyles = () => {
				const style = document.createElement('style');
				style.textContent = `
                  #youtube-container {
                      position: fixed !important;
                      will-change: transform !important;
                      cursor: grab !important;
                      transition: transform 0.3s ease !important;
                      top: 0;
                      left: 0;
                      min-width: 300px; /* Добавлена минимальная ширина */
                  }
                  #youtube-container.grabbing {
                      cursor: grabbing !important;
                      transition: none !important;
                  }
              `;
				document.head.appendChild(style);
			};

			injectStyles();

			box.style.height = '235px';
			box.style.zIndex = '100';

			let startX,
				startY,
				initialTranslateX,
				initialTranslateY,
				isDragging = false;
			const snapThreshold = 40;

			const setInitialPosition = () => {
				const viewportWidth = window.innerWidth;
				const viewportHeight = window.innerHeight;
				const elementWidth = box.offsetWidth;

				// Правильное позиционирование с 15% отступами
				const initialX = viewportWidth * 1 - elementWidth;
				const initialY = viewportHeight * 0.85 - 235;

				const maxX = Math.max(0, viewportWidth - elementWidth);
				const maxY = Math.max(0, viewportHeight - 235);

				const clampedX = Math.max(15, Math.min(initialX, maxX));
				const clampedY = Math.max(15, Math.min(initialY, maxY));

				box.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
			};

			setInitialPosition();

			const getTranslateValues = element => {
				const style = window.getComputedStyle(element);
				const matrix = style.transform.match(/^matrix\((.+)\)$/);
				return matrix
					? {
							x: parseFloat(matrix[1].split(', ')[4]),
							y: parseFloat(matrix[1].split(', ')[5]),
					  }
					: { x: 0, y: 0 };
			};

			const getScreenLimits = () => ({
				maxX: window.innerWidth - box.offsetWidth,
				maxY: window.innerHeight - 235,
			});

			// Обработчики событий
			box.addEventListener('mousedown', e => {
				isDragging = true;
				const transform = getTranslateValues(box);
				initialTranslateX = transform.x;
				initialTranslateY = transform.y;
				startX = e.clientX;
				startY = e.clientY;
				box.classList.add('grabbing');
			});

			document.addEventListener('mousemove', e => {
				if (!isDragging) return;

				const deltaX = e.clientX - startX;
				const deltaY = e.clientY - startY;

				let newX = initialTranslateX + deltaX;
				let newY = initialTranslateY + deltaY;

				const { maxX, maxY } = getScreenLimits();

				newX = Math.max(0, Math.min(newX, maxX));
				newY = Math.max(0, Math.min(newY, maxY));

				if (newX <= snapThreshold) newX = 0;
				else if (newX >= maxX - snapThreshold) newX = maxX;

				if (newY <= snapThreshold) newY = 0;
				else if (newY >= maxY - snapThreshold) newY = maxY;

				box.style.transform = `translate(${newX}px, ${newY}px)`;
			});

			document.addEventListener('mouseup', () => {
				isDragging = false;
				box.classList.remove('grabbing');
			});

			window.addEventListener('resize', () => {
				setInitialPosition();
				const { maxX, maxY } = getScreenLimits();
				const current = getTranslateValues(box);
				box.style.transform = `translate(${Math.min(
					current.x,
					maxX
				)}px, ${Math.min(current.y, maxY)}px)`;
			});
		};

		const existingBox = document.querySelector('#youtube-container');
		if (existingBox) {
			startDragDrop(existingBox);
		} else {
			initObserver();
		}
	};

	DrugAndDrop();
};

const handleKeyPress = e => {
	if (e.code === 'Space') handleActivation();
};

// Инициализация отслеживания URL
initUrlTracking();

// Первоначальная инициализация обработчиков
document
	.querySelector('#control-play')
	.addEventListener('click', handleActivation);
document.addEventListener('keydown', handleKeyPress);
