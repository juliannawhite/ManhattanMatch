window.onload = function () { 
    var map = document.getElementById('map');
    //KTOWN Harold Square
    // Flatiron
    // define paths
    var pathIDs = [];
    var paths = map.querySelectorAll('path');
    paths.forEach(function(path) {
        var id = path.getAttribute('id');
        pathIDs.push(id);
    });
    shuffleArray(pathIDs);
    
    var numCorrect = 0;
    var numStruggled = 0;
    var numFailed = 0;
    var countClicks = 0;
    var totalSeconds = 0;
    var curr = 0;
    var intervalId = setInterval(updateTimer, 1000);
    var timerDisplay = document.getElementById('timer');
    var NeighbAsked = document.getElementById("currNeighb");
    var numCorrectSpot = document.getElementById("numCorrect");
    var numSoFar = document.getElementById("numSoFar");
    var allNumTotal = document.querySelectorAll('.numTotal');
    var tooltip = document.createElement('div');
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;
    var shareButton = document.getElementById('share');
    var close = document.getElementById("closeModal");
    var open = document.getElementById("help");
    var refresh = document.getElementById("refresh");
    var modal = document.getElementById("modal");
    
    if (screenWidth > 600) {
            createToolTip("Click on <span id='changeName'>" + pathIDs[0] + "</span>");
    }
    
    document.getElementById("numTotal").innerHTML = pathIDs.length;
    allNumTotal.forEach(function(div) {div.textContent = pathIDs.length;});
    NeighbAsked.innerHTML = pathIDs[0];
    document.getElementById('redo').onclick = function() {location.reload();};
    shareButton.addEventListener('click', () => share());
    open.onclick = openModal;
    close.onclick = closeModal;
    refresh.onclick = function() {location.reload();};
    
    function openModal() {
        console.log("open");
        clearInterval(intervalId);
        modal.style.display = "block";
    }
    
    function closeModal() {
        console.log("close");
        intervalId = setInterval(updateTimer, 1000);
        modal.style.display = "none";
    }
    

    
    // Fisher-Yates shuffle algorithm
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    function update(valid) { // 1 = current, 0 == wrong
        curr += 1;
        NeighbAsked.innerHTML = pathIDs[curr];
        if (screenWidth > 600) {
            updateTooltipContent(pathIDs[curr]);
        }
        
        countClicks = 0;
        if (curr == pathIDs.length) { // 3 for testing
            end();
        }
        if (valid) {
            numCorrectSpot.innerHTML = numCorrect+numStruggled;
            numSoFar.innerHTML = curr + 1;
        }
    }
    
    function color(path) {
        if (countClicks == 1) {
            path.style.fill = "#c7eaca";
            numCorrect += 1;
        } else if (countClicks == 2) {
            path.style.fill = "#eef4b3";
            numStruggled += 1;
        } else {
            path.style.fill = "#eef4b3"; //"#f2d7b8" - if we want to go back to orange - else combine else if and else
            numStruggled += 1;
        } 
    }
    
    function wrong() {
        if (countClicks + 1 >= 4) {
            document.getElementById(pathIDs[curr]).style.fill = "#eac7c7";
            numFailed += 1;
            update(0);
        }
    }

    function createToolTip(content) {
        tooltip = document.createElement('div');
        tooltip.id = 'tooltip';
        tooltip.innerHTML = content;
        document.body.appendChild(tooltip);
        
        document.getElementById("top").addEventListener("mouseenter", function() {
            tooltip.style.visibility = 'hidden';
        });
        document.getElementById("top").addEventListener("mouseleave", function() {
            tooltip.style.visibility = 'visible';
        });
    }
    
    function updateTooltipContent(content) {
        document.getElementById("changeName").innerHTML = content;
    }
    
    function share() {
        var toCopyContent = document.getElementById('toCopy').innerText;    
        var clipboardTextarea = document.getElementById('clipboardTextarea');
        clipboardTextarea.value = toCopyContent;
        clipboardTextarea.select();
        clipboardTextarea.setSelectionRange(0, 99999);
        document.execCommand('copy');
        clipboardTextarea.blur();
        window.getSelection().removeAllRanges();
        shareButton.textContent = "Copied!";
        setTimeout(function() {
            shareButton.textContent = "Share";
        }, 2500);
    }

    function end() {
        var finished = document.getElementById('finished');
        finished.style.display = "block";
        document.getElementById("desc").style.display = "none";
        if (screenWidth > 600) {
            var removeTooltip = document.getElementById("tooltip");
            removeTooltip.parentNode.removeChild(removeTooltip);
        }
        clearInterval(intervalId);        
        var allTime = document.querySelectorAll('.myTime');
        allTime.forEach(function(div) {
            div.textContent = makeTimeReadable(totalSeconds);
        });        
        document.getElementById("myGood").innerHTML = numCorrect;
        document.getElementById("myMid").innerHTML = numStruggled;
        document.getElementById("myBad").innerHTML = numFailed;
        
        map.style.transform = 'scale(0.6)';
        map.style.marginBottom = '-120px';
        map.style.marginTop = '-110px';
    }
    
    function popup(name, valid, event) {
        var popup = document.createElement('div');
        if (valid == "valid") {
            return;
            popup.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #6ca571;"></i>' + name;
        } else {
            popup.innerHTML = '<i class="fa-solid fa-circle-xmark" style="color: #b77070"></i>' + name;
        }
        
        popup.style.position = "absolute";
        popup.style.left = event.clientX + 'px';
        popup.style.top = event.clientY + 'px';
        popup.className = valid;
        popup.classList.add('popup');
        document.body.appendChild(popup);
        
        setTimeout(function() {
            popup.classList.add('hide');
        }, 500);
        
        setTimeout(function() {
        document.body.removeChild(popup);
    }, 1500);
    }
    
    map.addEventListener('click', function(event) {
        if (curr == pathIDs.length) {
            return;
        }
        countClicks += 1;
        var mouseX = event.clientX - map.getBoundingClientRect().left;
        var mouseY = event.clientY - map.getBoundingClientRect().top;        
        var clickedPath = event.target.closest('path');
        if (!clickedPath) return;
        var svgPoint = map.createSVGPoint();
        svgPoint.x = mouseX;
        svgPoint.y = mouseY;
        var isPointInFill = clickedPath.isPointInFill(svgPoint);
        if (isPointInFill && clickedPath.id == pathIDs[curr]) {
            color(clickedPath);
            update(1);
            popup(clickedPath.id, "valid", event)
        } else {
            wrong();
            popup(clickedPath.id, "notValid", event)
        } 
    }); 
    
    document.addEventListener('mousemove', function(event) {
    var mouseX = event.clientX;
    var mouseY = event.clientY;
        
    if (mouseX >= 0 && mouseX <= screenWidth && mouseY >= 0 && mouseY <= screenHeight) {
        tooltip.style.display = 'block';
        tooltip.style.left = mouseX + 10 + 'px';
        tooltip.style.top = mouseY + 'px';
    } else {
        tooltip.style.display = 'none';
    }
        
});
    
    function updateTimer() {
        var hours = Math.floor(totalSeconds / 3600);
        var minutes = Math.floor((totalSeconds % 3600) / 60);
        var seconds = totalSeconds % 60;

        if (hours > 0) {
            var formattedTime = 
            (hours < 10 ? "0" + hours : hours) + ":" +
            (minutes < 10 ? "0" + minutes : minutes) + ":" +
            (seconds < 10 ? "0" + seconds : seconds);
        } else if (minutes > 0) {
            var formattedTime = 
            (minutes < 10 ? "0" + minutes : minutes) + ":" +
            (seconds < 10 ? "0" + seconds : seconds);
        }
        else {
            var formattedTime = ":" +
            (seconds < 10 ? "0" + seconds : seconds);
        }
        timerDisplay.textContent = formattedTime;
        totalSeconds++;
    }   
    
    function makeTimeReadable(totalSeconds) {
        var hours = Math.floor(totalSeconds / 3600);
        var minutes = Math.floor((totalSeconds % 3600) / 60);
        var seconds = totalSeconds % 60;
        var readableTime = "";
        if (hours > 0) {
            readableTime += hours + " hour" + (hours > 1 ? "s" : "") + " ";
        }
        if (minutes > 0) {
            readableTime += minutes + " minute" + (minutes > 1 ? "s" : "") + " ";
        }
        if (seconds > 0) {
            readableTime += seconds + " second" + (seconds > 1 ? "s" : "");
        }
        return readableTime.trim();
    }
}