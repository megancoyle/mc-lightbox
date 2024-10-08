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
            currentLightboxId = gallery.getAttribute('data-mc-lightbox-id');
            currentIndex = index;
            isStandalone = false;
            lightboxImg.src = currentGallery[currentIndex]?.getAttribute('data-mc-image-src') || '';
            updateCaption(currentGallery[currentIndex]?.dataset.mcCaption);
        } else {
            currentGallery = [];
            currentIndex = -1;
            isStandalone = true;
            lightboxImg.src = lightbox.dataset.imageSrc;
            const caption = lightbox.dataset.mcCaption || ''; 
            updateCaption(caption); 
        }

        lightboxImg.onload = function() {
            // Hide loader and show inner content when image is loaded
            lightboxLoader.style.display = 'none';
            lightboxInner.style.display = 'block';
            updateCaption(lightboxCaption.innerHTML); // Ensure the caption is shown
        };

        lightbox.classList.add('visible');
        document.body.classList.add('mc-disable-scroll');
        updateNavigationButtons();
        updateURL();
    }

    function closeLightbox() {
        lightbox.classList.remove('visible');
        document.body.classList.remove('mc-disable-scroll');
        const url = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.pushState({ path: url }, '', url);
    }

    function showNextImage() {
        if (currentIndex < currentGallery.length - 1) {
            currentIndex++;
            lightboxLoader.style.display = 'block';
            lightboxInner.style.display = 'none';
            lightboxImg.src = currentGallery[currentIndex].getAttribute('data-mc-image-src');
            updateCaption(currentGallery[currentIndex]?.dataset.mcCaption);
            lightboxImg.onload = function() {
                lightboxLoader.style.display = 'none'; // Hide the loader
                lightboxInner.style.display = 'block'; // Show the content
            };
            updateNavigationButtons();
            updateURL();
        }
    }

    function showPrevImage() {
        if (currentIndex > 0) {
            currentIndex--;
            lightboxLoader.style.display = 'block';
            lightboxInner.style.display = 'none';
            lightboxImg.src = currentGallery[currentIndex].getAttribute('data-mc-image-src');
            updateCaption(currentGallery[currentIndex]?.dataset.mcCaption);
            lightboxImg.onload = function() {
                lightboxLoader.style.display = 'none'; // Hide the loader
                lightboxInner.style.display = 'block'; // Show the content
            };
            updateNavigationButtons();
            updateURL();
        }
    }

    function updateCaption(caption) {
        if (caption) {
            // Regular expression to detect escaped HTML sequences
            const escapedHtmlPattern = /&lt;|&gt;|&amp;|&quot;|&#39;/;
    
            if (escapedHtmlPattern.test(caption)) {
                // Create a temporary div element to decode the escaped HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = caption;
                lightboxCaption.innerHTML = tempDiv.textContent || tempDiv.innerText;
            } else {
                // If no escaped HTML is found, use the caption as is
                lightboxCaption.innerHTML = caption;
            }
    
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
                prevButton.classList.add('mc-hidden');
                nextButton.classList.add('mc-hidden');
            } else {
                prevButton.classList.remove('mc-hidden');
                nextButton.classList.remove('mc-hidden');
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

    // Event listeners for gallery thumbnails
    document.querySelectorAll('.mc-gallery .mc-gallery-thumbnail').forEach((thumbnail, index) => {
        const img = thumbnail.querySelector('img');

        thumbnail.addEventListener('click', () => {
            const gallery = thumbnail.closest('.mc-gallery');
            openLightbox(gallery, Array.from(gallery.querySelectorAll('img')).indexOf(img));
        });

        thumbnail.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') { // Handle both Enter and Space key for activation
                const gallery = thumbnail.closest('.mc-gallery');
                openLightbox(gallery, Array.from(gallery.querySelectorAll('img')).indexOf(img));
            }
        });

        // Ensure thumbnails are focusable
        thumbnail.setAttribute('tabindex', '0');
    });

    // Event listeners for lightbox actions
    if (closeButton) {
        closeButton.addEventListener('click', closeLightbox);
        closeButton.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
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
            if (event.key === 'Enter' || event.key === ' ') {
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
            if (event.key === 'Enter' || event.key === ' ') {
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

    document.querySelectorAll('.mc-lightbox-link').forEach(link => {
        const lightboxId = link.getAttribute('data-mc-lightbox-id');
        link.href = `?lightbox=${encodeURIComponent(lightboxId)}`;
    });

    // Handle URL state on page load
    window.addEventListener('load', () => {
        const params = new URLSearchParams(window.location.search);
        const lightboxId = params.get('lightbox');

        if (lightboxId) {
            const gallery = document.querySelector(`.mc-gallery[data-mc-lightbox-id="${lightboxId}"]`);
            if (gallery) {
                const imageIndex = params.get('image');
                const index = parseInt(imageIndex, 10);
                if (!isNaN(index)) {
                    openLightbox(gallery, index);
                } else {
                    openLightbox(gallery, 0);
                }
            } else {
                const link = document.querySelector(`.mc-lightbox-link[data-mc-lightbox-id="${lightboxId}"]`);
                if (link) {
                    lightbox.dataset.imageSrc = link.getAttribute('data-mc-image-src');
                    lightbox.dataset.mcCaption = link.getAttribute('data-mc-caption') || '';
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
            const gallery = document.querySelector(`.mc-gallery[data-mc-lightbox-id="${lightboxId}"]`);
            if (gallery) {
                const index = parseInt(imageIndex, 10);
                if (!isNaN(index)) {
                    openLightbox(gallery, index);
                } else {
                    openLightbox(gallery, 0);
                }
            } else {
                const link = document.querySelector(`.mc-lightbox-link[data-mc-lightbox-id="${lightboxId}"]`);
                if (link) {
                    lightbox.dataset.imageSrc = link.getAttribute('data-mc-image-src');
                    lightbox.dataset.mcCaption = link.getAttribute('data-mc-caption') || '';
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
            const lightboxId = this.getAttribute('data-mc-lightbox-id');
            lightbox.dataset.imageSrc = this.getAttribute('data-mc-image-src');
            lightbox.dataset.mcCaption = this.getAttribute('data-mc-caption') || '';
            currentLightboxId = lightboxId;
            openLightbox(null, -1);
        });

        link.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') { // Handle both Enter and Space key for activation
                event.preventDefault();
                const lightboxId = this.getAttribute('data-mc-lightbox-id');
                lightbox.dataset.imageSrc = this.getAttribute('data-mc-image-src');
                lightbox.dataset.mcCaption = this.getAttribute('data-mc-caption') || '';
                currentLightboxId = lightboxId;
                openLightbox(null, -1);
            }
        });

        // Ensure lightbox links are focusable
        link.setAttribute('tabindex', '0');
    });
});
