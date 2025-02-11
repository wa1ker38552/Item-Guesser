
function getImages() {
    request("/api/new").then(data => {
        currentImage = data.image
        dquery("#gameImage").src = currentImage
    })
    request("/api/new").then(data => {queue = data.image})
}

const socket = io();
var currentImage
var score = 0
var queue
var timer = 30
window.onload = function() {
    const input = dquery("#gameInput")
    getImages()
    interval = setInterval(function() {
        if (timer == 0) {
            dquery("#gameContainer").remove()
            dquery(".content").innerHTML = `
            <div style='text-align: center'>
                <h1>Game Over<h1>
                <h3>Game Mode: 30s<h3>
                <br>
                <h1 class="final-score">Score: ${score}</h1>
                <br>
                <div class='horizontal-container' style='justify-content: center'>
                    <a href='/'>Retry</a>
                </div>
            </div>
            `
            clearInterval(interval)
        }
        dquery("#gameTimer").textContent = timer
        timer --
    }, 1000)

    input.onchange = function(e) {
        input.style.borderColor = ""
        fetch("/api/validate", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                image: currentImage,
                guess: input.value
            })
        })
            .then(response => response.json())
            .then(response => {
                if (response.success) {
                    if (response.solution) {
                        gameSimilarity.innerHTML = `Solution was <b>${response.solution}</b>`
                    } else {
                        gameSimilarity.innerHTML = "&#8203;"
                    }
                    score += response.score

                    dquery("#gameScore").textContent = score
                    input.value = ""
                    currentImage = queue
                    dquery("#gameImage").src = currentImage
                    request("/api/new").then(data => {
                        queue = data.image
                    })
                } else {
                    setTimeout(function() {
                        input.style.borderColor = "red"
                    }, 200)
                    input.select()
                    dquery("#gameSimilarity").textContent = Math.round(response.similarity * 100) / 100
                }
            })
    }
}