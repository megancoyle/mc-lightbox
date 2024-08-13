document.addEventListener('DOMContentLoaded', function() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const closeButton = lightbox.querySelector('.lightbox-close');
    const prevButton = lightbox.querySelector('.prev');
    const nextButton = lightbox.querySelector('.next');
    let currentGallery = [];
    let currentIndex = -1;
    let currentLightboxId = '';
    let isStandalone = false;

    function openLightbox(gallery, index) {
        if (gallery) {
            currentGallery = gallery.querySelectorAll('img');
            currentLightboxId = gallery.getAttribute('data-lightbox-id');
            currentIndex = index;
            isStandalone = false;
            lightboxImg.src = currentGallery[currentIndex]?.src || '';
        } else {
            currentGallery = [];
            currentIndex = -1;
            isStandalone = true;
            lightboxImg.src = lightbox.dataset.imageSrc;
        }

        lightbox.classList.add('visible');
        document.body.classList.add('disable-scroll'); // Disable background scrolling
        updateNavigationButtons();
        updateURL();
    }

    function closeLightbox() {
        lightbox.classList.remove('visible');
        document.body.classList.remove('disable-scroll'); // Enable background scrolling
        updateURL();
    }

    function showNextImage() {
        if (currentIndex < currentGallery.length - 1) {
            currentIndex++;
            lightboxImg.src = currentGallery[currentIndex].src;
            updateNavigationButtons();
            updateURL();
        }
    }

    function showPrevImage() {
        if (currentIndex > 0) {
            currentIndex--;
            lightboxImg.src = currentGallery[currentIndex].src;
            updateNavigationButtons();
            updateURL();
        }
    }

    function updateNavigationButtons() {
        prevButton.classList.toggle('hidden', currentIndex === 0 || currentGallery.length === 0);
        nextButton.classList.toggle('hidden', currentIndex === currentGallery.length - 1 || currentGallery.length === 0);
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
    document.querySelectorAll('.gallery img').forEach((img, index) => {
        img.addEventListener('click', () => {
            const gallery = img.closest('.gallery');
            openLightbox(gallery, Array.from(gallery.querySelectorAll('img')).indexOf(img));
        });
    });

    // Event listeners for lightbox actions
    closeButton.addEventListener('click', closeLightbox);
    lightboxImg.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    prevButton.addEventListener('click', function(event) {
        showPrevImage();
        event.stopPropagation(); // Prevent closing the lightbox when clicking the arrow
    });

    nextButton.addEventListener('click', function(event) {
        showNextImage();
        event.stopPropagation(); // Prevent closing the lightbox when clicking the arrow
    });

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
            const gallery = document.querySelector(`.gallery[data-lightbox-id="${lightboxId}"]`);
            if (gallery) {
                const imageIndex = params.get('image');
                const index = parseInt(imageIndex, 10);
                if (!isNaN(index)) {
                    openLightbox(gallery, index);
                } else {
                    openLightbox(gallery, 0); // Default to the first image if index is invalid
                }
            } else {
                const link = document.querySelector(`.lightbox-link[data-lightbox-id="${lightboxId}"]`);
                if (link) {
                    lightbox.dataset.imageSrc = link.getAttribute('data-image-src');
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
            const gallery = document.querySelector(`.gallery[data-lightbox-id="${lightboxId}"]`);
            if (gallery) {
                const index = parseInt(imageIndex, 10);
                if (!isNaN(index)) {
                    openLightbox(gallery, index);
                } else {
                    openLightbox(gallery, 0); // Default to the first image if index is invalid
                }
            } else {
                const link = document.querySelector(`.lightbox-link[data-lightbox-id="${lightboxId}"]`);
                if (link) {
                    lightbox.dataset.imageSrc = link.getAttribute('data-image-src');
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
    document.querySelectorAll('.lightbox-link').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const lightboxId = this.getAttribute('data-lightbox-id');
            const gallery = document.querySelector(`.gallery[data-lightbox-id="${lightboxId}"]`);

            if (gallery) {
                const imageIndex = parseInt(this.getAttribute('data-image-index'), 10);
                if (!isNaN(imageIndex)) {
                    openLightbox(gallery, imageIndex);
                }
            } else {
                lightbox.dataset.imageSrc = this.getAttribute('data-image-src');
                currentLightboxId = lightboxId;
                openLightbox(null, -1);
            }
        });
    });
});
