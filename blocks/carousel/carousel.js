export default function decorate(block) {
  const rows = [...block.children];

  if (rows.length < 3) {
    return;
  }

  const firstRow = rows[0];
  const lastRow = rows[rows.length - 1];

  const prevButton = document.createElement('button');
  prevButton.className = 'carousel-button carousel-prev';
  prevButton.type = 'button';
  prevButton.setAttribute('aria-label', 'Previous slide');
  prevButton.innerHTML = '&lt;&lt;';
  firstRow.replaceWith(prevButton);

  const nextButton = document.createElement('button');
  nextButton.className = 'carousel-button carousel-next';
  nextButton.type = 'button';
  nextButton.setAttribute('aria-label', 'Next slide');
  nextButton.innerHTML = '&gt;&gt;';
  lastRow.replaceWith(nextButton);

  const slides = rows.slice(1, -1);

  slides.forEach((slide, index) => {
    slide.classList.add('carousel-slide');
    slide.dataset.slideIndex = index;

    const columns = [...slide.children];

    if (columns[0]) {
      columns[0].classList.add('carousel-image');
    }

    if (columns[1]) {
      columns[1].classList.add('carousel-content');
    }
  });

  const viewport = document.createElement('div');
  viewport.className = 'carousel-viewport';

  const track = document.createElement('div');
  track.className = 'carousel-track';

  slides.forEach((slide) => {
    track.appendChild(slide);
  });

  viewport.appendChild(track);
  block.appendChild(viewport);

  let currentSlide = 0;
  const totalSlides = slides.length;

  function updateSlider() {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    prevButton.disabled = currentSlide === 0;
    prevButton.classList.toggle('disabled', currentSlide === 0);

    nextButton.disabled = currentSlide === totalSlides - 1;
    nextButton.classList.toggle('disabled', currentSlide === totalSlides - 1);

    slides.forEach((slide, index) => {
      slide.setAttribute(
        'aria-hidden',
        index === currentSlide ? 'false' : 'true',
      );
    });
  }

  prevButton.addEventListener('click', () => {
    if (currentSlide > 0) {
      currentSlide -= 1;
      updateSlider();
    }
  });

  nextButton.addEventListener('click', () => {
    if (currentSlide < totalSlides - 1) {
      currentSlide += 1;
      updateSlider();
    }
  });

  block.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' && currentSlide > 0) {
      currentSlide -= 1;
      updateSlider();
    }

    if (event.key === 'ArrowRight' && currentSlide < totalSlides - 1) {
      currentSlide += 1;
      updateSlider();
    }
  });

  let touchStartX = 0;
  let touchEndX = 0;

  viewport.addEventListener(
    'touchstart',
    (event) => {
      touchStartX = event.changedTouches[0].screenX;
    },
    { passive: true },
  );

  viewport.addEventListener(
    'touchend',
    (event) => {
      touchEndX = event.changedTouches[0].screenX;

      const swipeDistance = touchStartX - touchEndX;

      if (swipeDistance > 50 && currentSlide < totalSlides - 1) {
        currentSlide += 1;
        updateSlider();
      }

      if (swipeDistance < -50 && currentSlide > 0) {
        currentSlide -= 1;
        updateSlider();
      }
    },
    { passive: true },
  );

  updateSlider();
}

