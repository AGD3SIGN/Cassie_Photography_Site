// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
   // Elements
   const header = document.querySelector(".header")
   const progressBar = document.getElementById("progress-bar")
   const navToggle = document.querySelector(".nav-toggle")
   const navMenu = document.querySelector(".nav-menu")
   const backToTop = document.querySelector(".back-to-top")
   const animatedElements = document.querySelectorAll(".animate-on-scroll")
   const statNumbers = document.querySelectorAll(".stat-number")
   const testimonialItems = document.querySelectorAll(".testimonial-item")
   const prevBtn = document.querySelector(".prev-btn")
   const nextBtn = document.querySelector(".next-btn")
   const dots = document.querySelectorAll(".dot")
   const contactForm = document.getElementById("contact-form")

   // Variables
   let currentTestimonial = 0
   let statsAnimated = false

   // Navigation toggle
   navToggle.addEventListener("click", function () {
      this.classList.toggle("active")
      navMenu.classList.toggle("active")
   })

   // Close menu when clicking on a nav link
   document.querySelectorAll(".nav-menu a").forEach((link) => {
      link.addEventListener("click", () => {
         navToggle.classList.remove("active")
         navMenu.classList.remove("active")
      })
   })

   // Initialize Intersection Observer for scroll animations
   const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
   }

   const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
         if (entry.isIntersecting) {
            entry.target.classList.add("visible")
            observer.unobserve(entry.target) // Stop observing once it's visible
         }
      })
   }, observerOptions)

   // Observe all elements with animate-on-scroll class
   animatedElements.forEach((element) => {
      observer.observe(element)
   })

   // Scroll events
   window.addEventListener("scroll", () => {
      const scrollPosition = window.scrollY

      // Header styling on scroll
      if (scrollPosition > 50) {
         header.classList.add("scrolled")
      } else {
         header.classList.remove("scrolled")
      }

      // Progress bar
      const totalHeight = document.body.scrollHeight - window.innerHeight
      const progress = (scrollPosition / totalHeight) * 100
      progressBar.style.width = `${progress}%`

      // Back to top button
      if (scrollPosition > 300) {
         backToTop.classList.add("visible")
      } else {
         backToTop.classList.remove("visible")
      }

      // Animate stats when in viewport
      if (!statsAnimated) {
         const statsSection = document.querySelector(".stats")
         if (isInViewport(statsSection)) {
            animateStats()
            statsAnimated = true
         }
      }
   })

   // Back to top functionality
   backToTop.addEventListener("click", () => {
      window.scrollTo({
         top: 0,
         behavior: "smooth",
      })
   })

   // Testimonial carousel
   function showTestimonial(index) {
      // Hide all testimonials first
      testimonialItems.forEach((item) => {
         item.classList.remove("active")
         item.style.transform = "translateX(100%)"
         item.style.opacity = "0"
      })

      // Remove active class from all dots
      dots.forEach((dot) => {
         dot.classList.remove("active")
      })

      // Show the selected testimonial
      testimonialItems[index].classList.add("active")
      testimonialItems[index].style.transform = "translateX(0)"
      testimonialItems[index].style.opacity = "1"

      // Activate the corresponding dot
      dots[index].classList.add("active")

      // Update current index
      currentTestimonial = index
   }

   // Initialize testimonial carousel
   if (testimonialItems.length > 0) {
      // Set initial state for all testimonials
      testimonialItems.forEach((item, i) => {
         if (i === 0) {
            item.classList.add("active")
            item.style.transform = "translateX(0)"
            item.style.opacity = "1"
         } else {
            item.style.transform = "translateX(100%)"
            item.style.opacity = "0"
         }
      })

      // Set first dot as active
      if (dots.length > 0) {
         dots[0].classList.add("active")
      }
   }

   // Add event listeners for testimonial navigation
   if (prevBtn) {
      prevBtn.addEventListener("click", () => {
         let index = currentTestimonial - 1
         if (index < 0) index = testimonialItems.length - 1
         showTestimonial(index)
      })
   }

   if (nextBtn) {
      nextBtn.addEventListener("click", () => {
         let index = currentTestimonial + 1
         if (index >= testimonialItems.length) index = 0
         showTestimonial(index)
      })
   }

   dots.forEach((dot) => {
      dot.addEventListener("click", function () {
         const index = Number.parseInt(this.getAttribute("data-index"))
         showTestimonial(index)
      })
   })

   // Auto rotate testimonials
   let testimonialInterval = setInterval(() => {
      let index = currentTestimonial + 1
      if (index >= testimonialItems.length) index = 0
      showTestimonial(index)
   }, 5000)

   // Pause auto-rotation when hovering over testimonials
   const testimonialCarousel = document.querySelector(".testimonial-carousel")
   if (testimonialCarousel) {
      testimonialCarousel.addEventListener("mouseenter", () => {
         clearInterval(testimonialInterval)
      })

      testimonialCarousel.addEventListener("mouseleave", () => {
         testimonialInterval = setInterval(() => {
            let index = currentTestimonial + 1
            if (index >= testimonialItems.length) index = 0
            showTestimonial(index)
         }, 5000)
      })
   }

   // Contact form validation
   if (contactForm) {
      contactForm.addEventListener("submit", (e) => {
         e.preventDefault()

         let valid = true
         const formStatus = document.querySelector(".form-status")

         // Reset error messages
         document.querySelectorAll(".error-message").forEach((error) => {
            error.style.display = "none"
         })

         // Validate name
         const nameInput = document.getElementById("name")
         if (nameInput.value.trim() === "") {
            showError(nameInput, "Please enter your name")
            valid = false
         }

         // Validate email
         const emailInput = document.getElementById("email")
         if (!isValidEmail(emailInput.value)) {
            showError(emailInput, "Please enter a valid email address")
            valid = false
         }

         // Validate service selection
         const serviceInput = document.getElementById("service")
         if (serviceInput.value === "") {
            showError(serviceInput, "Please select a service")
            valid = false
         }

         // Validate message
         const messageInput = document.getElementById("message")
         if (messageInput.value.trim() === "") {
            showError(messageInput, "Please enter your message")
            valid = false
         }

         if (valid) {
            // Simulate form submission
            formStatus.textContent = "Thank you for your message! We will get back to you soon."
            formStatus.classList.add("success")
            formStatus.style.display = "block"

            // Reset form
            contactForm.reset()

            // Hide success message after 5 seconds
            setTimeout(() => {
               formStatus.style.display = "none"
            }, 5000)
         }
      })
   }

   // Helper Functions
   function showError(input, message) {
      const errorElement = input.nextElementSibling.nextElementSibling
      errorElement.textContent = message
      errorElement.style.display = "block"
   }

   function isValidEmail(email) {
      const re =
         /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return re.test(String(email).toLowerCase())
   }

   function isInViewport(element) {
      if (!element) return false
      const rect = element.getBoundingClientRect()
      return rect.top <= (window.innerHeight || document.documentElement.clientHeight) && rect.bottom >= 0
   }

   function animateStats() {
      statNumbers.forEach((stat) => {
         const target = Number.parseInt(stat.getAttribute("data-count"))
         let current = 0
         const increment = target / 50 // Adjust for animation speed
         const timer = setInterval(() => {
            current += increment
            stat.textContent = Math.floor(current)
            if (current >= target) {
               stat.textContent = target
               clearInterval(timer)
            }
         }, 30)
      })
   }

   // Subtle animation for hero image
   const heroImage = document.querySelector(".hero-img")
   if (heroImage) {
      // Add a subtle floating animation
      setInterval(() => {
         heroImage.style.transform = "scale(1.02)"
         setTimeout(() => {
            heroImage.style.transform = "scale(1)"
         }, 1500)
      }, 3000)
   }

   // Trigger initial animations for elements already in viewport
   animatedElements.forEach((element) => {
      if (isInViewport(element)) {
         element.classList.add("visible")
      }
   })

   // Initialize testimonial carousel
   if (testimonialItems.length > 0) {
      showTestimonial(0)
   }
})
