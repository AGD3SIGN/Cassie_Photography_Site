document.addEventListener("DOMContentLoaded", () => {
    // Gallery filtering
    const filterButtons = document.querySelectorAll(".filter-btn")
    const galleryItems = document.querySelectorAll(".gallery-item")
    const lightbox = document.getElementById("lightbox")
    const lightboxImage = document.querySelector(".lightbox-image")
    const lightboxTitle = document.querySelector(".lightbox-title")
    const lightboxCategory = document.querySelector(".lightbox-category")
    const lightboxClose = document.querySelector(".lightbox-close")
    const lightboxPrev = document.querySelector(".lightbox-prev")
    const lightboxNext = document.querySelector(".lightbox-next")

    let currentImageIndex = 0
    let filteredItems = [...galleryItems]

    // Filter gallery items
    filterButtons.forEach((button) => {
        button.addEventListener("click", function () {
            // Update active button
            filterButtons.forEach((btn) => btn.classList.remove("active"))
            this.classList.add("active")

            const filter = this.getAttribute("data-filter")

            // Filter items
            galleryItems.forEach((item) => {
                if (filter === "all" || item.getAttribute("data-category") === filter) {
                    item.style.display = "block"
                } else {
                    item.style.display = "none"
                }
            })

            // Update filtered items array for lightbox navigation
            filteredItems = [...galleryItems].filter((item) => {
                return filter === "all" || item.getAttribute("data-category") === filter
            })
        })
    })

    // Lightbox functionality
    galleryItems.forEach((item, index) => {
        item.addEventListener("click", function () {
            const image = this.querySelector("img")
            const title = this.querySelector("h3").textContent
            const category = this.querySelector("p").textContent

            openLightbox(image.src, title, category)

            // Find index in filtered items
            currentImageIndex = filteredItems.indexOf(this)
        })
    })

    function openLightbox(src, title, category) {
        lightboxImage.src = src
        lightboxTitle.textContent = title
        lightboxCategory.textContent = category
        lightbox.classList.add("active")

        // Prevent body scrolling when lightbox is open
        document.body.style.overflow = "hidden"
    }

    function closeLightbox() {
        lightbox.classList.remove("active")

        // Re-enable body scrolling
        document.body.style.overflow = ""
    }

    function navigateLightbox(direction) {
        currentImageIndex += direction

        // Loop around if at the end or beginning
        if (currentImageIndex >= filteredItems.length) {
            currentImageIndex = 0
        } else if (currentImageIndex < 0) {
            currentImageIndex = filteredItems.length - 1
        }

        const item = filteredItems[currentImageIndex]
        const image = item.querySelector("img")
        const title = item.querySelector("h3").textContent
        const category = item.querySelector("p").textContent

        lightboxImage.src = image.src
        lightboxTitle.textContent = title
        lightboxCategory.textContent = category
    }

    // Lightbox event listeners
    lightboxClose.addEventListener("click", closeLightbox)

    lightboxPrev.addEventListener("click", () => {
        navigateLightbox(-1)
    })

    lightboxNext.addEventListener("click", () => {
        navigateLightbox(1)
    })

    // Close lightbox when clicking outside the image
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
            closeLightbox()
        }
    })

    // Keyboard navigation for lightbox
    document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("active")) return

        if (e.key === "Escape") {
            closeLightbox()
        } else if (e.key === "ArrowLeft") {
            navigateLightbox(-1)
        } else if (e.key === "ArrowRight") {
            navigateLightbox(1)
        }
    })

    // Lazy loading for gallery images
    if ("IntersectionObserver" in window) {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]')

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target
                    img.src = img.dataset.src || img.src
                    img.removeAttribute("loading")
                    imageObserver.unobserve(img)
                }
            })
        })

        lazyImages.forEach((img) => {
            imageObserver.observe(img)
        })
    }

    // Initialize masonry layout for gallery
    function initMasonryLayout() {
        const gallery = document.querySelector(".gallery")
        const items = document.querySelectorAll(".gallery-item")

        // Simple masonry-like layout with varying heights
        items.forEach((item, index) => {
            if (index % 3 === 0) {
                item.style.gridRowEnd = "span 2"
            } else if (index % 5 === 0) {
                item.style.gridRowEnd = "span 1"
            } else {
                item.style.gridRowEnd = "span " + Math.floor(Math.random() * 2 + 1)
            }
        })
    }

    // Call masonry layout initialization
    initMasonryLayout()

    // Reinitialize on window resize
    window.addEventListener("resize", initMasonryLayout)
})
