document.addEventListener('DOMContentLoaded', function() {
    const lightbox = document.getElementById('mc-lightbox');
    const lightboxInner = document.getElementById('mc-lightbox-inner');
    if (!lightbox || !lightboxInner) return;

    const lightboxImg = lightbox.querySelector('.mc-lightbox-img');
    const lightboxCaption = document.createElement('div');
    lightboxCaption.classList.add('mc-lightbox-caption');
    lightboxInner.appendChild(lightboxCaption);

    // Create and append loader
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

    function openLightbox(gallery, index) {
        // Show loader and hide inner content initially
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
            // Hide loader and show inner content when image is loaded
            lightboxLoader.style.display = 'none';
            lightboxInner.style.display = 'block';
            updateCaption(lightboxCaption.innerHTML); // Ensure the caption is shown
        };

        lightbox.classList.add('visible');
        document.body.classList.add('disable-scroll');
        updateNavigationButtons();
        updateURL();
    }

    function closeLightbox() {
        lightbox.classList.remove('visible');
        document.body.classList.remove('disable-scroll');
        const url = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.pushState({ path: url }, '', url);
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

    // Event listeners for gallery images
    document.querySelectorAll('.mc-gallery img').forEach((img, index) => {
        img.addEventListener('click', () => {
            const gallery = img.closest('.mc-gallery');
            openLightbox(gallery, Array.from(gallery.querySelectorAll('img')).indexOf(img));
        });
    });

    // Event listeners for lightbox actions
    if (closeButton) {
        closeButton.addEventListener('click', closeLightbox);
        closeButton.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                closeLightbox();
            }
        });
        closeButton.setAttribute('tabindex', '0'); // Make focusable
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
        prevButton.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                showPrevImage();
            }
        });
        prevButton.setAttribute('tabindex', '0'); // Make focusable
    }

    if (nextButton) {
        nextButton.addEventListener('click', function(event) {
            showNextImage();
            event.stopPropagation();
        });
        nextButton.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                showNextImage();
            }
        });
        nextButton.setAttribute('tabindex', '0'); // Make focusable
    }

    document.addEventListener('keydown', function(event) {
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
            }
        }
    });

    // Handle URL state on page load
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

    // Handle browser navigation
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

    // Event listeners for lightbox links
    document.querySelectorAll('.mc-lightbox-link').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const lightboxId = this.getAttribute('data-lightbox-id');
            const gallery = document.querySelector(`.mc-gallery[data-lightbox-id="${lightboxId}"]`);

            if (gallery) {
                const imageIndex = parseInt(this.getAttribute('data-image-index'), 10);
                if (!isNaN(imageIndex)) {
                    openLightbox(gallery, imageIndex);
                }
            } else {
                lightbox.dataset.imageSrc = this.getAttribute('data-image-src');
                lightbox.dataset.caption = this.getAttribute('data-caption') || '';
                currentLightboxId = lightboxId;
                openLightbox(null, -1);
            }
        });
    });
});
