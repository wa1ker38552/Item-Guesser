
function getImages() {
    request("/api/new").then(data => {
        currentImage = data.image
        dquery("#gameImage").src = currentImage
    })
    request("/api/new").then(data => {queue = data.image})
}

function formatTime(ms) {
    let minutes = String(Math.floor(ms / 60000)).padStart(2, '0');
    let seconds = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
    let milliseconds = String(Math.floor((ms % 1000) / 10)).padStart(2, '0');
    return `${minutes}:${seconds}:${milliseconds}`;
}

const socket = io();
var currentImage
var score = 0
var queue
var finished = false
window.onload = function() {
    const input = dquery("#gameInput")
    input.focus()
    getImages()
    setTimeout(function() {
        startTime = Date.now()
        interval = setInterval(function() {
            if (finished) {
                const endTime = formatTime(Date.now() - startTime)
                dquery("#gameContainer").remove()
                dquery(".content").innerHTML = `
                <div style='text-align: center'>
                    <h1>Game Over<h1>
                    <h3>Game Mode: Sprint ${amount}<h3>
                    <br>
                    <h1 class="final-score">Time: ${endTime}</h1>
                    <br>
                    <div class='horizontal-container' style='justify-content: center'>
                        <a href='/game/sprint${amount}'>Retry</a>
                    </div>
                </div>
                `
                clearInterval(interval)
            }
            
            dquery("#gameTimer").textContent = formatTime(Date.now() - startTime)
        }, 10)
    }, 500)

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
                        score ++
                    }

                    if (score == amount) {
                        finished = true
                        return
                    }

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