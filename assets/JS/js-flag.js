// Runs before first paint: marks JS as available so animation start states apply.
// If the story module never finishes loading, drop the flag so no content stays hidden.
(function () {
    var root = document.documentElement
    root.classList.add("js")
    setTimeout(function () {
        if (!root.classList.contains("story-ready")) root.classList.remove("js")
    }, 4000)
})()
