// Story site: scroll-driven storytelling with anime.js v4 (self-hosted, pinned version)
import { animate, createScope, createTimeline, onScroll, stagger } from "../vendor/anime-4.5.0.esm.min.js"

const root = document.documentElement
const $ = (selector, scope = document) => scope.querySelector(selector)
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)]

// js-flag.js gave up waiting (slow network); content is already visible, so leave it be
if (!root.classList.contains("js")) {
   initInterface()
} else {
   root.classList.add("story-ready")
   initInterface()
   initStory()
}

/* ========================================
Interface: menu, header, contact form (no motion required)
======================================== */
function initInterface() {
   const header = $("[data-header]")
   const menuBtn = $("[data-menu-btn]")
   const nav = $("[data-nav]")
   const hero = $("[data-hero]")

   // Mobile menu
   const setMenu = (open) => {
      menuBtn.setAttribute("aria-expanded", String(open))
      nav.toggleAttribute("data-open", open)
      header.classList.toggle("menu-open", open)
      document.body.style.overflow = open ? "hidden" : ""
      if (open) $("a", nav).focus()
   }

   menuBtn.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"))
   $$("a", nav).forEach((link) => link.addEventListener("click", () => setMenu(false)))
   document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.hasAttribute("data-open")) {
         setMenu(false)
         menuBtn.focus()
      }
   })

   // Header turns solid once the hero has scrolled away
   new IntersectionObserver(([entry]) => header.classList.toggle("is-solid", !entry.isIntersecting), {
      rootMargin: "-80px 0px 0px 0px",
   }).observe(hero)

   initContactForm()
   initFaq()
   initBookLinks()
}

// Service "Book" links preselect the matching session type in the contact form
function initBookLinks() {
   const select = $("#f-type")
   if (!select) return
   $$("[data-book]").forEach((link) => {
      link.addEventListener("click", () => {
         select.value = link.dataset.book
         select.removeAttribute("aria-invalid")
      })
   })
}

// FAQ: <details> stays native (works without JS), anime.js just eases the open/close
function initFaq() {
   const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)")

   $$(".faq__item").forEach((item) => {
      const summary = $("summary", item)
      const answer = $("p", item)

      summary.addEventListener("click", (e) => {
         if (reduceMotion.matches) return
         e.preventDefault()

         // Height right now: 0 when closed (closed <details> can still report a layout height), mid-way if interrupted
         const from = item.open ? answer.offsetHeight : 0
         const closing = item.open && !item.classList.contains("is-closing")

         if (closing) {
            item.classList.add("is-closing")
            animate(answer, {
               height: [from, 0],
               paddingBottom: 0,
               opacity: 0,
               duration: 450,
               ease: "inOutQuart",
               onComplete: () => {
                  if (!item.classList.contains("is-closing")) return
                  item.open = false
                  item.classList.remove("is-closing")
                  answer.removeAttribute("style")
               },
            })
            return
         }

         const wasClosed = !item.open
         item.classList.remove("is-closing")
         item.open = true

         // Measure the natural size, then animate up to it
         const current = { pb: getComputedStyle(answer).paddingBottom, op: getComputedStyle(answer).opacity }
         answer.style.height = "auto"
         answer.style.paddingBottom = ""
         const to = answer.offsetHeight
         const pb = getComputedStyle(answer).paddingBottom
         const startPb = wasClosed ? "0px" : current.pb
         const startOp = wasClosed ? 0 : Number(current.op)

         // Pin the start state before paint so the answer never flashes open
         answer.style.height = `${from}px`
         answer.style.paddingBottom = startPb
         answer.style.opacity = String(startOp)

         animate(answer, {
            height: [from, to],
            paddingBottom: [startPb, pb],
            opacity: { from: startOp, to: 1, duration: 500, delay: 120 },
            y: [-6, 0],
            duration: 550,
            ease: "outQuart",
            onComplete: () => {
               if (item.classList.contains("is-closing")) return
               answer.removeAttribute("style")
            },
         })
      })
   })
}

function initContactForm() {
   const form = $("[data-contact-form]")
   const status = $("[data-form-status]")
   if (!form) return

   const setStatus = (message, type) => {
      status.textContent = message
      status.className = `form__status${type ? ` is-${type}` : ""}`
   }

   form.addEventListener("submit", async (e) => {
      e.preventDefault()
      setStatus("")

      // Honeypot filled: pretend it worked, send nothing
      if (form.elements.website.value) {
         form.reset()
         setStatus("Thank you! I'll be in touch soon.", "success")
         return
      }

      const fields = $$("input:not([name='website']), select, textarea", form)
      let firstInvalid = null
      fields.forEach((field) => {
         const valid = field.checkValidity()
         field.setAttribute("aria-invalid", String(!valid))
         if (!valid && !firstInvalid) firstInvalid = field
      })

      if (firstInvalid) {
         setStatus("Please fill in the highlighted fields.", "error")
         firstInvalid.focus()
         return
      }

      const endpoint = safeEndpoint(form.dataset.endpoint)
      if (!endpoint) {
         setStatus("Thanks! The form isn't connected yet, so please email hello@example.com for now.", "success")
         return
      }

      try {
         const response = await fetch(endpoint, {
            method: "POST",
            headers: { Accept: "application/json" },
            body: new FormData(form),
            credentials: "omit",
         })
         if (!response.ok) throw new Error(response.statusText)
         form.reset()
         setStatus("Thank you! Your message is on its way. I'll reply within two business days.", "success")
      } catch {
         setStatus("Something went wrong sending your message. Please email hello@example.com instead.", "error")
      }
   })
}

// Only allow https endpoints (or same-origin paths) to be posted to
function safeEndpoint(value) {
   if (!value) return null
   try {
      const url = new URL(value, window.location.href)
      return url.protocol === "https:" || url.origin === window.location.origin ? url.href : null
   } catch {
      return null
   }
}

/* ========================================
Story: all motion lives in a scope so it reverts cleanly
when the screen size or motion preference changes
======================================== */
function initStory() {
   const prologueWords = splitWords($("[data-split]"))

   createScope({
      mediaQueries: {
         md: "(min-width: 48rem)",
         lg: "(min-width: 75rem)",
         motion: "(prefers-reduced-motion: no-preference)",
      },
   }).add((scope) => {
      const { md, motion } = scope.matches
      if (!motion) return

      const cleanups = [heroScene(), hscroll()]

      prologue(prologueWords)
      reveals()
      clipFrames()
      parallax()
      mosaic(md)
      services()
      progressBar()

      return () => cleanups.forEach((cleanup) => cleanup && cleanup())
   })
}

// Hero: an intro on load, then scroll opens the window into the scene
function heroScene() {
   const hero = $("[data-hero]")

   createTimeline({ defaults: { ease: "outExpo", duration: 1400 } })
      .add("[data-hero-scene]", { opacity: [0, 1], duration: 1800, ease: "outQuad" }, 0)
      .add("[data-hero-frame]", { opacity: [0, 1], scale: [0.94, 1] }, 250)
      .add(".hero__title .word > span", { y: ["110%", "0%"], delay: stagger(110) }, 350)
      .add("[data-hero-fade]", { opacity: [0, 1], delay: stagger(200) }, 900)

   // --t drives the window, title, frame and caption in CSS
   const state = { t: 0 }
   animate(state, {
      t: [0, 1],
      ease: "linear",
      onRender: () => hero.style.setProperty("--t", state.t.toFixed(4)),
      autoplay: onScroll({ target: hero, enter: "top top", leave: "bottom bottom", sync: 0.6 }),
   })

   return () => hero.style.removeProperty("--t")
}

// Prologue: words light up as you read down
function prologue(words) {
   if (!words.length) return
   animate(words, {
      opacity: [0.15, 1],
      duration: 400,
      delay: stagger(60),
      ease: "linear",
      autoplay: onScroll({ target: words[0].parentElement, enter: "bottom top", leave: "40% bottom", sync: 0.5 }),
   })
}

// Section headers and single elements rise in once
function reveals() {
   $$("[data-reveal-group]").forEach((group) => {
      animate(group.children, {
         opacity: [0, 1],
         y: [32, 0],
         duration: 1200,
         delay: stagger(110),
         ease: "outExpo",
         autoplay: onScroll({ target: group, enter: "85% top", repeat: false }),
      })
   })

   $$("[data-reveal]").forEach((el) => {
      animate(el, {
         opacity: [0, 1],
         y: [40, 0],
         duration: 1200,
         ease: "outExpo",
         autoplay: onScroll({ target: el, enter: "88% top", repeat: false }),
      })
   })
}

// Photos are uncovered from the bottom like a print being pulled from a tray
function clipFrames() {
   $$(".frame[data-clip]").forEach((frame) => {
      animate(frame, {
         clipPath: ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"],
         duration: 1600,
         ease: "inOutQuart",
         autoplay: onScroll({ target: frame, enter: "90% top", repeat: false }),
      })
   })
}

// Images drift slightly slower than the page inside their frames
function parallax() {
   $$("[data-parallax]").forEach((img) => {
      const frame = img.closest(".frame")
      animate(img, {
         y: ["-6%", "6%"],
         ease: "linear",
         autoplay: onScroll({ target: frame, enter: "bottom top", leave: "top bottom", sync: true }),
      })
   })
}

// Places: pinned horizontal journey; scrolling down moves the track sideways
function hscroll() {
   const section = $("[data-hscroll]")
   const track = $("[data-hscroll-track]")
   const places = $$(".place", track)

   const sticky = $(".hscroll__sticky", section)
   const distance = () => Math.max(0, track.scrollWidth - window.innerWidth)
   // sticky is 100svh, which stays put when a phone's address bar shows/hides
   const setHeight = () => section.style.setProperty("--hscroll-h", `${distance() + sticky.offsetHeight}px`)
   setHeight()

   animate(places, {
      opacity: [0, 1],
      duration: 1200,
      delay: stagger(120),
      ease: "outQuad",
      autoplay: onScroll({ target: section, enter: "70% top", repeat: false }),
   })

   const move = animate(track, {
      x: () => -distance(),
      ease: "linear",
      autoplay: onScroll({ target: section, enter: "top top", leave: "bottom bottom", sync: 0.6 }),
   })

   let lastWidth = window.innerWidth
   const onResize = () => {
      if (window.innerWidth === lastWidth) return
      lastWidth = window.innerWidth
      setHeight()
      move.refresh()
   }
   window.addEventListener("resize", onResize, { passive: true })

   return () => {
      window.removeEventListener("resize", onResize)
      section.style.removeProperty("--hscroll-h")
   }
}

// Mosaic tiles settle in, staggered by column
function mosaic(md) {
   const cols = md ? 4 : 2
   $$(".mosaic__item").forEach((item, i) => {
      animate(item, {
         opacity: [0, 1],
         scale: [0.94, 1],
         duration: 1300,
         delay: (i % cols) * 90,
         ease: "outExpo",
         autoplay: onScroll({ target: item, enter: "92% top", repeat: false }),
      })
   })
}

// Service cards rise in, staggered across each row
function services() {
   const cols = window.matchMedia("(min-width: 75rem)").matches ? 4 : window.matchMedia("(min-width: 48rem)").matches ? 2 : 1
   $$("[data-services] .service").forEach((card, i) => {
      animate(card, {
         opacity: [0, 1],
         y: [48, 0],
         duration: 1300,
         delay: (i % cols) * 130,
         ease: "outExpo",
         autoplay: onScroll({ target: card, enter: "90% top", repeat: false }),
      })
   })
}

// Reading progress line under the header
function progressBar() {
   animate("[data-progress]", {
      scaleX: [0, 1],
      ease: "linear",
      autoplay: onScroll({ target: document.body, enter: "top top", leave: "bottom bottom", sync: true }),
   })
}

// Wrap each word in a span (textContent only, never innerHTML)
function splitWords(el) {
   if (!el) return []
   const words = el.textContent.trim().split(/\s+/)
   el.textContent = ""
   words.forEach((word, i) => {
      const span = document.createElement("span")
      span.className = "w"
      span.textContent = word
      el.append(span)
      if (i < words.length - 1) el.append(" ")
   })
   return $$(".w", el)
}
