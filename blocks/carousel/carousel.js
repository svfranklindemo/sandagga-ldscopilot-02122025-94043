export function updateButtons(activeSlide) {
  const block = activeSlide.closest('.block');
  const buttons = block.closest('.carousel-wrapper').querySelector('.carousel-buttons');

  const nthSlide = activeSlide.offsetLeft / activeSlide.parentNode.clientWidth;
  const button = block.parentElement.querySelector(`.carousel-buttons > button:nth-child(${nthSlide + 1})`);
  [...buttons.children].forEach((r) => r.classList.remove('selected'));
  button.classList.add('selected');
}

export default function decorate(block) {
  const buttons = document.createElement('div');
  [...block.children].forEach((row, i) => {
    const classes = ['image', 'text'];
    classes.forEach((e, j) => {
      row.children[j].classList.add(`carousel-${e}`);
    });
    const carouselText = row.querySelector('.carousel-text');
    if (!carouselText.innerText.trim()) carouselText.remove();
    /* buttons */
    const button = document.createElement('button');
    button.title = 'Carousel Nav';
    if (!i) button.classList.add('selected');
    button.addEventListener('click', () => {
      block.scrollTo({ top: 0, left: row.offsetLeft - row.parentNode.offsetLeft, behavior: 'smooth' });
      [...buttons.children].forEach((r) => r.classList.remove('selected'));
      button.classList.add('selected');
    });
    buttons.append(button);
  });
  if (block.nextElementSibling) block.nextElementSibling.replaceWith(buttons);
  else block.parentElement.append(buttons);

  block.querySelectorAll(':scope > div').forEach((slide) => slide.classList.add('slide'));

  block.addEventListener('scrollend', () => {
    const activeElement = Math.round(block.scrollLeft / block.children[0].clientWidth);
    const slide = block.children[activeElement];
    updateButtons(slide);
  }, { passive: true });

  const blocks = document.querySelectorAll(`.carousel`);
  blocks.forEach((block, index) => {
    block.id = `carousel-${index}`;

    // Add indexed IDs to text content divs only
    const carouselTextBlocks = block.querySelectorAll('.carousel-text');
    carouselTextBlocks.forEach((carouselTextBlock, bodyIndex) => {
      carouselTextBlock.setAttribute('data-text-block-index', bodyIndex);
    });

    // Add indexed IDs to heading elements with container context
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'].forEach((tag) => {
      const elements = block.querySelectorAll(tag);
      elements.forEach((el) => {
        const textBlock = el.closest('[data-text-block-index]');
        const textBlockIndex = textBlock ? textBlock.getAttribute('data-text-block-index') : 'unknown';
        
        // Count this tag within its container
        const textBlockElements = textBlock ? textBlock.querySelectorAll(tag) : [el];
        const tagIndex = Array.from(textBlockElements).indexOf(el);
        
        el.id = `carousel_${index}_text_${textBlockIndex}_${tag}_${tagIndex}`;
      });
    });
  });
}
