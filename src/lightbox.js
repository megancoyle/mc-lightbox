document.addEventListener('DOMContentLoaded', function() {
    const lightbox = document.getElementById('mc-lightbox');
    const lightboxInner = document.getElementById('mc-lightbox-inner');
    if (!lightbox || !lightboxInner) return;

    const lightboxImg = lightbox.querySelector('.mc-lightbox-img');
    const lightboxCaption = document.createElement('div');
    lightboxCaption.classList.add('mc-lightbox-caption');
    lightboxInner.appendChild(lightboxCaption);

    const lightboxLoader = document.createElement('div');
    lightboxLoader.classList.add('mc-lightbox-loader');
    lightbox.appendChild(lightboxLoader);

    const closeButton = lightbox.querySelector('.mc-lightbox-close');
    const prevButton = lightbox.querySelector('.prev');
    const nextButton = lightbox.querySelector('.next');
    let currentGallery = [];
    let currentIndex = -1;
    let currentLightboxId = '';
    let isStandalone = false;

    function getFocusableElements() {
        return Array.from(lightbox.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'));
    }

    function trapFocus(event) {
        if (lightbox.classList.contains('visible')) {
            const focusable = getFocusableElements();
            const firstElement = focusable[0];
            const lastElement = focusable[focusable.length - 1];

            if (event.key === 'Tab') {
                if (event.shiftKey) { // Shift + Tab
                    if (document.activeElement === firstElement) {
                        event.preventDefault();
                        lastElement.focus();
                    }
                } else { // Tab
                    if (document.activeElement === lastElement) {
                        event.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        }
    }

    function openLightbox(gallery, index) {
        lightboxLoader.style.display = 'block';
        lightboxInner.style.display = 'none';

        if (gallery) {
            currentGallery = gallery.querySelectorAll('img');
            currentLightboxId = gallery.getAttribute('data-lightbox-id');
            currentIndex = index;
            isStandalone = false;
            lightboxImg.src = currentGallery[currentIndex]?.getAttribute('data-image-src') || '';
            updateCaption(currentGallery[currentIndex]?.dataset.caption);
        } else {
            currentGallery = [];
            currentIndex = -1;
            isStandalone = true;
            lightboxImg.src = lightbox.dataset.imageSrc;
            const caption = lightbox.dataset.caption || ''; 
            updateCaption(caption); 
        }

        lightboxImg.onload = function() {
            lightboxLoader.style.display = 'none';
            lightboxInner.style.display = 'block';
            updateCaption(lightboxCaption.innerHTML);
        };

        lightbox.classList.add('visible');
        document.body.classList.add('disable-scroll');
        updateNavigationButtons();
        updateURL();

        // Focus on the first control (close button)
        if (closeButton) {
            closeButton.focus();
        }

        document.addEventListener('keydown', trapFocus);
    }

    function closeLightbox() {
        lightbox.classList.remove('visible');
        document.body.classList.remove('disable-scroll');
        const url = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.pushState({ path: url }, '', url);

        document.removeEventListener('keydown', trapFocus);
    }

    function showNextImage() {
        if (currentIndex < currentGallery.length - 1) {
            currentIndex++;
            lightboxImg.src = currentGallery[currentIndex].getAttribute('data-image-src');
            updateCaption(currentGallery[currentIndex]?.dataset.caption);
            updateNavigationButtons();
            updateURL();
        }
    }

    function showPrevImage() {
        if (currentIndex > 0) {
            currentIndex--;
            lightboxImg.src = currentGallery[currentIndex].getAttribute('data-image-src');
            updateCaption(currentGallery[currentIndex]?.dataset.caption);
            updateNavigationButtons();
            updateURL();
        }
    }

    function updateCaption(caption) {
        if (caption) {
            lightboxCaption.innerHTML = caption;
            lightboxCaption.style.display = 'block';
        } else {
            lightboxCaption.innerHTML = '';
            lightboxCaption.style.display = 'none';
        }
    }

    function updateNavigationButtons() {
        const prevDisabled = isStandalone || currentIndex <= 0 || currentGallery.length === 0;
        const nextDisabled = isStandalone || currentIndex >= currentGallery.length - 1 || currentGallery.length === 0;

        if (prevButton && nextButton) {
            prevButton.classList.toggle('disabled', prevDisabled);
            nextButton.classList.toggle('disabled', nextDisabled);

            if (prevDisabled) {
                prevButton.setAttribute('tabindex', '-1');
            } else {
                prevButton.setAttribute('tabindex', '0');
            }

            if (nextDisabled) {
                nextButton.setAttribute('tabindex', '-1');
            } else {
                nextButton.setAttribute('tabindex', '0');
            }

            if (prevDisabled && nextDisabled) {
                prevButton.classList.add('hidden');
                nextButton.classList.add('hidden');
            } else {
                prevButton.classList.remove('hidden');
                nextButton.classList.remove('hidden');
            }
        }
    }

    function updateURL() {
        const url = new URL(window.location);
        if (isStandalone) {
            url.searchParams.set('lightbox', currentLightboxId);
            url.searchParams.delete('image');
        } else {
            url.searchParams.set('lightbox', currentLightboxId);
            url.searchParams.set('image', currentIndex);
        }
        history.pushState(null, '', url.toString());
    }

    function handleKeyDown(event) {
        if (lightbox.classList.contains('visible')) {
            switch (event.key) {
                case 'ArrowRight':
                    showNextImage();
                    break;
                case 'ArrowLeft':
                    showPrevImage();
                    break;
                case 'Escape':
                    closeLightbox();
                    break;
                case 'Enter':
                    if (event.target.classList.contains('prev')) {
                        showPrevImage();
                    } else if (event.target.classList.contains('next')) {
                        showNextImage();
                    } else if (event.target.classList.contains('mc-lightbox-close')) {
                        closeLightbox();
                    }
                    break;
            }
        }
    }

    function handleFocus(event) {
        if (lightbox.classList.contains('visible')) {
            const focusable = getFocusableElements();
            const firstElement = focusable[0];
            const lastElement = focusable[focusable.length - 1];

            if (event.target === firstElement || event.target === lastElement) {
                event.target.addEventListener('keydown', handleKeyDown);
            }
        }
    }

    function handleBlur(event) {
        if (event.target.classList.contains('mc-lightbox-nav')) {
            event.target.removeEventListener('keydown', handleKeyDown);
        }
    }

    document.querySelectorAll('.mc-gallery img').forEach((img, index) => {
        img.addEventListener('click', () => {
            const gallery = img.closest('.mc-gallery');
            openLightbox(gallery, Array.from(gallery.querySelectorAll('img')).indexOf(img));
        });
    });

    if (closeButton) {
        closeButton.addEventListener('click', closeLightbox);
    }

    lightbox.addEventListener('click', function(event) {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    if (lightboxImg) {
        lightboxImg.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }

    if (prevButton) {
        prevButton.addEventListener('click', function(event) {
            showPrevImage();
            event.stopPropagation();
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', function(event) {
            showNextImage();
            event.stopPropagation();
        });
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    window.addEventListener('load', () => {
        const params = new URLSearchParams(window.location.search);
        const lightboxId = params.get('lightbox');

        if (lightboxId) {
            const gallery = document.querySelector(`.mc-gallery[data-lightbox-id="${lightboxId}"]`);
            if (gallery) {
                const imageIndex = params.get('image');
                const index = parseInt(imageIndex, 10);
                if (!isNaN(index)) {
                    openLightbox(gallery, index);
                } else {
                    openLightbox(gallery, 0);
                }
            } else {
                const link = document.querySelector(`.mc-lightbox-link[data-lightbox-id="${lightboxId}"]`);
                if (link) {
                    lightbox.dataset.imageSrc = link.getAttribute('data-image-src');
                    lightbox.dataset.caption = link.getAttribute('data-caption') || '';
                    currentLightboxId = lightboxId;
                    openLightbox(null, -1);
                } else {
                    closeLightbox();
                }
            }
        }
    });

    window.addEventListener('popstate', () => {
        const params = new URLSearchParams(window.location.search);
        const lightboxId = params.get('lightbox');
        const imageIndex = params.get('image');

        if (lightboxId) {
            const gallery = document.querySelector(`.mc-gallery[data-lightbox-id="${lightboxId}"]`);
            if (gallery) {
                const index = parseInt(imageIndex, 10);
                if (!isNaN(index)) {
                    openLightbox(gallery, index);
                } else {
                    openLightbox(gallery, 0);
                }
            } else {
                const link = document.querySelector(`.mc-lightbox-link[data-lightbox-id="${lightboxId}"]`);
                if (link) {
                    lightbox.dataset.imageSrc = link.getAttribute('data-image-src');
                    lightbox.dataset.caption = link.getAttribute('data-caption') || '';
                    currentLightboxId = lightboxId;
                    openLightbox(null, -1);
                } else {
                    closeLightbox();
                }
            }
        } else {
            closeLightbox();
        }
    });

    document.querySelectorAll('.mc-lightbox-link').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const lightboxId = this.getAttribute('data-lightbox-id');
            const gallery = document.querySelector(`.mc-gallery[data-lightbox-id="${lightboxId}"]`);
            if (gallery) {
                openLightbox(gallery, 0);
            } else {
                lightbox.dataset.imageSrc = this.getAttribute('data-image-src');
                lightbox.dataset.caption = this.getAttribute('data-caption') || '';
                openLightbox(null, -1);
            }
        });
    });
});
