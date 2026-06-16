// Success Stories Accordion
// Handles expand/collapse for the success items on the testimonials page

document.addEventListener('DOMContentLoaded', function() {
  const successItems = document.querySelectorAll('.success-item');
  
  successItems.forEach(item => {
    const trigger = item.querySelector('.success-trigger');
    const body = item.querySelector('.success-body');
    
    if (!trigger || !body) return;
    
    trigger.addEventListener('click', function() {
      const isOpen = item.classList.contains('open');
      
      // Close all other items
      successItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('open')) {
          closeItem(otherItem);
        }
      });
      
      // Toggle current item
      if (isOpen) {
        closeItem(item);
      } else {
        openItem(item);
      }
    });
  });
  
  function openItem(item) {
    const body = item.querySelector('.success-body');
    const bodyInner = item.querySelector('.success-body-inner');
    
    item.classList.add('open');
    item.querySelector('.success-trigger').setAttribute('aria-expanded', 'true');
    
    // Set max-height for animation
    const height = bodyInner.scrollHeight;
    body.style.maxHeight = height + 'px';
  }
  
  function closeItem(item) {
    const body = item.querySelector('.success-body');
    
    item.classList.remove('open');
    item.querySelector('.success-trigger').setAttribute('aria-expanded', 'false');
    body.style.maxHeight = '0px';
  }
});
