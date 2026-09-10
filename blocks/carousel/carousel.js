
export default function decorate(block) {
  const rows = [...block.children];

  // ---------------------------------------
  // Check if enough rows exist
  // ---------------------------------------
  if (rows.length < 3) {
    return;
  }

  // ---------------------------------------
  // Get first and last rows
  // ---------------------------------------
  const firstRow = rows[0];
  const lastRow = rows[rows.length - 1];

  // ---------------------------------------
  // Previous Button
  // ---------------------------------------
  const prevButton = document.createElement('button');

  prevButton.className = 'carousel-button carousel-prev';
  prevButton.type = 'button';
  prevButton.setAttribute('aria-label', 'Previous slide');
  prevButton.innerHTML = '&lt;&lt;';

  firstRow.replaceWith(prevButton);

  // ---------------------------------------
  // Next Button
  // ---------------------------------------
  const nextButton = document.createElement('button');

  nextButton.className = 'carousel-button carousel-next';
  nextButton.type = 'button';
  nextButton.setAttribute('aria-label', 'Next slide');
  nextButton.innerHTML = '&gt;&gt;';

  lastRow.replaceWith(nextButton);

  // ---------------------------------------
  // Get slides
  // ---------------------------------------
  const slides = rows.slice(1, -1);

  // ---------------------------------------
  // Add slide class
  // ---------------------------------------
  slides.forEach((slide, index) => {
    slide.classList.add('carousel-slide');

    // Add index for accessibility/debugging
    slide.dataset.slideIndex = index;

    // Get columns
    const columns = [...slide.children];

    // Image column
    if (columns[0]) {
      columns[0].classList.add('carousel-image');
    }

    // Text column
    if (columns[1]) {
      columns[1].classList.add('carousel-content');
    }
  });

  // ---------------------------------------
  // Create slider viewport
  // ---------------------------------------
  const viewport = document.createElement('div');
  viewport.className = 'carousel-viewport';

  // ---------------------------------------
  // Create slider track
  // ---------------------------------------
  const track = document.createElement('div');
  track.className = 'carousel-track';

  // Move slides into track
  slides.forEach((slide) => {
    track.appendChild(slide);
  });

  viewport.appendChild(track);

  // ---------------------------------------
  // Insert viewport
  // ---------------------------------------
  block.appendChild(viewport);

  // ---------------------------------------
  // Slider state
  // ---------------------------------------
  let currentSlide = 0;

  const totalSlides = slides.length;

  // ---------------------------------------
  // Update slider
  // ---------------------------------------
  function updateSlider() {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Disable Previous button on first slide
    if (currentSlide === 0) {
      prevButton.disabled = true;
      prevButton.classList.add('disabled');
    } else {
      prevButton.disabled = false;
      prevButton.classList.remove('disabled');
    }

    // Disable Next button on last slide
    if (currentSlide === totalSlides - 1) {
      nextButton.disabled = true;
      nextButton.classList.add('disabled');
    } else {
      nextButton.disabled = false;
      nextButton.classList.remove('disabled');
    }

    // Accessibility
    slides.forEach((slide, index) => {
      slide.setAttribute(
        'aria-hidden',
        index === currentSlide ? 'false' : 'true',
      );
    });
  }

  // ---------------------------------------
  // Previous button
  // ---------------------------------------
  prevButton.addEventListener('click', () => {
    if (currentSlide > 0) {
      currentSlide -= 1;
      updateSlider();
    }
  });

  // ---------------------------------------
  // Next button
  // ---------------------------------------
  nextButton.addEventListener('click', () => {
    if (currentSlide < totalSlides - 1) {
      currentSlide += 1;
      updateSlider();
    }
  });

  // ---------------------------------------
  // Keyboard navigation
  // ---------------------------------------
  block.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      if (currentSlide > 0) {
        currentSlide -= 1;
        updateSlider();
      }
    }

    if (event.key === 'ArrowRight') {
      if (currentSlide < totalSlides - 1) {
        currentSlide += 1;
        updateSlider();
      }
    }
  });

  // ---------------------------------------
  // Touch / Swipe support
  // ---------------------------------------
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

      // Swipe left → Next
      if (swipeDistance > 50 && currentSlide < totalSlides - 1) {
        currentSlide += 1;
        updateSlider();
      }

      // Swipe right → Previous
      if (swipeDistance < -50 && currentSlide > 0) {
        currentSlide -= 1;
        updateSlider();
      }
    },
    { passive: true },
  );

  // ---------------------------------------
  // Initial state
  // ---------------------------------------
  updateSlider();
}

