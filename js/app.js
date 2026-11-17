const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');

    //开场动画

    document.querySelector('.text').addEventListener('mouseover', function () {
        this.style.opacity = '0';
        document.querySelector('#container').style.opacity = '1';
        document.querySelector('#button').style.opacity = '1';
        canvas.classList.add('show');
        document.querySelector('.navbar').style.opacity = '1';

        setTimeout(resizeCanvasToFitAndRedraw, 100);
    });


    const openingText = document.querySelector('.text');

    openingText.addEventListener('transitionend', function (e) {
        if (e.propertyName === 'opacity' && getComputedStyle(this).opacity === '0') {
            this.style.display = 'none';
            this.style.pointerEvents = 'none';
        }
    });

    //canvas功能


    document.querySelector('#clear').addEventListener('click', () => {
        droppedImages.length = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    })

    document.querySelectorAll('img[draggable="true"]').forEach(img => {
        img.addEventListener('dragstart', function (e) {
            e.dataTransfer.setData('text/plain', img.src);

            const dragCanvas = document.createElement('canvas');
            dragCanvas.width = img.clientWidth;
            dragCanvas.height = img.clientHeight;

            const ctx = dragCanvas.getContext('2d');
            ctx.drawImage(img, 0, 0, dragCanvas.width, dragCanvas.height);

            e.dataTransfer.setDragImage(dragCanvas, dragCanvas.width / 2, dragCanvas.height / 2);
        });
    });


    // 允许放置
    canvas.addEventListener('dragover', function (e) {
        e.preventDefault();
    });

    const droppedImages = [];
    let renderedBuffer = null

    // 处理放置到 canvas 上
    canvas.addEventListener('drop', function (e) {
        e.preventDefault();

        const src = e.dataTransfer.getData('text/plain');
        const img = new Image();
        img.src = src;

        const canvasRect = canvas.getBoundingClientRect();
        const x = e.clientX - canvasRect.left;
        const y = e.clientY - canvasRect.top;

        img.onload = function () {
            const draggedImg = [...document.querySelectorAll('img[draggable="true"]')].find(i => i.src.includes(src));
            if (!draggedImg) return;

            const name = draggedImg.getAttribute('data-name');
            const imgRect = draggedImg.getBoundingClientRect();
            const displayWidth = imgRect.width;
            const displayHeight = imgRect.height;

            const scaleX = canvas.width / canvasRect.width;
            const scaleY = canvas.height / canvasRect.height;

            const drawWidth = displayWidth * scaleX;
            const drawHeight = displayHeight * scaleY;
            const drawX = x * scaleX - drawWidth / 2;
            const drawY = y * scaleY - drawHeight / 2;

            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

            const imageObj = new Image();
            imageObj.src = src;

            droppedImages.push({
                name,
                src,
                x: drawX,
                y: drawY,
                width: drawWidth,
                height: drawHeight,
                imageObj
            });

        };
    });

    //canvas内拖动更新位置
    let selectedImage = null;
    let offsetX = 0, offsetY = 0;

    canvas.addEventListener('mousedown', function (e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        for (let i = droppedImages.length - 1; i >= 0; i--) {
            const img = droppedImages[i];
            if (x >= img.x && x <= img.x + img.width &&
                y >= img.y && y <= img.y + img.height) {
                selectedImage = img;
                offsetX = x - img.x;
                offsetY = y - img.y;
                manualSelectedImage = img;

                console.log("🖱️ selected:", img.name);
                break;
            }
        }
    });

    canvas.addEventListener('mousemove', function (e) {
        if (selectedImage) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            selectedImage.x = x - offsetX;
            selectedImage.y = y - offsetY;

            redrawCanvas();
        }
    });

    canvas.addEventListener('mouseup', function () {
        selectedImage = null;
    });



    // 页内切换功能
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelectorAll('.nav-link').forEach(item => {
                item.classList.remove('active');
            });
            this.classList.add('active');
            document.querySelectorAll('.page-section').forEach(section => {
                section.style.display = 'none';
            });
            const targetId = this.getAttribute('data-target');
            document.getElementById(targetId).style.display = 'block';
        });
    });

    // mute bottom and volume slider
    const muteBtn = document.getElementById("mute-btn");
    const volumeSlider = document.getElementById("volume-slider");
    let isMuted = false;
    const allAudios = document.querySelectorAll("audio");

    muteBtn.addEventListener("click", () => {
        isMuted = !isMuted;
        allAudios.forEach(audio => {
            audio.muted = isMuted;
        });
        let b1 = document.querySelector("#mute-btn");

        if (isMuted) {
            b1.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
            class="bi bi-mic-mute" viewBox="0 0 16 16">
            <path d="M13 8c0 .564-.094 1.107-.266 1.613l-.814-.814A4 4 0 0 0 12 8V7a.5.5 0 0 1 1 0zm-5 4c.818 0 1.578-.245 2.212-.667l.718.719a5 5 0 0 1-2.43.923V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 1 0v1a4 4 0 0 0 4 4m3-9v4.879l-1-1V3a2 2 0 0 0-3.997-.118l-.845-.845A3.001 3.001 0 0 1 11 3" />
            <path d="m9.486 10.607-.748-.748A2 2 0 0 1 6 8v-.878l-1-1V8a3 3 0 0 0 4.486 2.607m-7.84-9.253 12 12 .708-.708-12-12z" />
        </svg>
    `;
        } else {
            b1.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
            class="bi bi-mic-fill" viewBox="0 0 16 16">
            <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0z" />
            <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5" />
        </svg>
    `;
        }

    });

    volumeSlider.addEventListener("input", () => {
        const volume = parseFloat(volumeSlider.value);

        if (isMuted) {
            isMuted = false;
            allAudios.forEach(audio => audio.muted = false);

            // 切换按钮图标
            document.querySelector("#mute-btn").innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                 class="bi bi-mic-fill" viewBox="0 0 16 16">
                <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0z" />
                <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5" />
            </svg>
        `;
        }

        // 设置音量
        allAudios.forEach(audio => {
            audio.volume = volume;
        });
    });

    window.addEventListener("DOMContentLoaded", () => {
        const initialVolume = parseFloat(volumeSlider.value);
        allAudios.forEach(audio => {
            audio.volume = initialVolume;
        });
    });

//修改在canvas上也可以拖动重新调整位置
    function redrawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const item of droppedImages) {
            ctx.drawImage(item.imageObj, item.x, item.y, item.width, item.height);
        }
        }

    canvas.addEventListener('mousemove', function (e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        let hovering = false;
        for (let i = droppedImages.length - 1; i >= 0; i--) {
            const img = droppedImages[i];
            if (
                x >= img.x && x <= img.x + img.width &&
                y >= img.y && y <= img.y + img.height
            ) {
                hovering = true;
                break;
            }
        }

        if (selectedImage) {
            canvas.style.cursor = 'grabbing';
        } else if (hovering) {
            canvas.style.cursor = 'default';
        } else {
            canvas.style.cursor = 'default';
        }

        if (selectedImage) {
            selectedImage.x = x - offsetX;
            selectedImage.y = y - offsetY;
            redrawCanvas();
        }
    });


    function resizeCanvasToFitAndRedraw() {
        const canvas = document.getElementById('myCanvas');
        const ctx = canvas.getContext('2d');

        const rect = canvas.getBoundingClientRect();
        const oldWidth = canvas.width;
        const oldHeight = canvas.height;

        // 暂存当前尺寸
        const oldDroppedImages = droppedImages.map(item => ({ ...item }));

        // 设置新尺寸（⚠️ 会清空画布）
        canvas.width = rect.width;
        canvas.height = rect.height;

        // 计算缩放比例（旧 → 新）
        const scaleX = canvas.width / oldWidth;
        const scaleY = canvas.height / oldHeight;

        // 更新坐标并重绘
        droppedImages.length = 0; // 清空原有记录
        for (const item of oldDroppedImages) {
            const img = new Image();
            img.src = item.src;
            const newX = item.x * scaleX;
            const newY = item.y * scaleY;
            const newWidth = item.width * scaleX;
            const newHeight = item.height * scaleY;

            img.onload = function () {
                ctx.drawImage(img, newX, newY, newWidth, newHeight);
                droppedImages.push({
                    name: item.name,
                    src: item.src,
                    x: newX,
                    y: newY,
                    width: newWidth,
                    height: newHeight
                });
            };
        }
    }


    window.addEventListener('DOMContentLoaded', () => {
        resizeCanvasToFitAndRedraw();
        const initialVolume = parseFloat(volumeSlider.value);
        allAudios.forEach(audio => {
            audio.volume = initialVolume;
        });
    });

    window.addEventListener('resize', () => {
        resizeCanvasToFitAndRedraw();
    });


    // 点击图片试听
    const audioMap = {
        "山峰": "bianzhongloop1",
        "小船": "diziloop1",
        "花树": "guqinloop1",
        "松树": "pipaloop1",
        "竹子": "shengloop1",
        "水中亭": "zhengloop1"
    };

    let currentAudio = null;

    document.querySelectorAll('.image-column img').forEach(img => {

        img.addEventListener('dragstart', function (e) {
            e.dataTransfer.setData('text/plain', img.src);
        });

        img.addEventListener('click', async function () {
            await Tone.start();

            const name = img.getAttribute('data-name');
            const audioId = audioMap[name];
            const audio = document.getElementById(audioId);

            if (!audio) {
                console.warn(`cannot find loop:${audioId}`);
                return;
            }
            if (currentAudio === audio && !audio.paused) {
                audio.pause();
                audio.currentTime = 0;
                currentAudio = null;
            } else {
                if (currentAudio && currentAudio !== audio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                }
                currentAudio = audio;
                currentAudio.play();
            }
        });
    });


    //wikipedia API
    async function searchWikipedia() {
        const raw = document.getElementById("searchInput").value.trim();
        if (!raw) return;

        const suggestUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(raw)}&limit=1&format=json&origin=*`;

        try {
            const suggestRes = await fetch(suggestUrl);
            const suggestData = await suggestRes.json();

            if (!suggestData[1] || suggestData[1].length === 0) {
                throw new Error("No matching article found.");
            }

            const bestMatch = suggestData[1][0];  // 获取最相关的标题
            const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestMatch)}`;

            const summaryRes = await fetch(summaryUrl);
            const summaryData = await summaryRes.json();

            const container = document.getElementById("resultContainer");
            container.innerHTML = `
            <div class="result">
                <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(summaryData.title)}" target="_blank">${summaryData.title}</a>
                <p>${summaryData.extract}</p>

            </div>
        `;
        } catch (error) {
            document.getElementById("resultContainer").innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
        }
    }


    // Allow pressing Enter to search
    document.getElementById("searchInput").addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            searchWikipedia();
        }
    });

    //Homepage wiki
    document.addEventListener('DOMContentLoaded', function () {
        const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');

        popoverTriggerList.forEach(trigger => {
            const keyword = trigger.getAttribute('data-wiki');  // 获取关键词

            if (!keyword) return;

            const popover = new bootstrap.Popover(trigger, {
                html: true,
                trigger: 'click',
                placement: 'right',
                content: 'Loading...',
                customClass: 'wiki-popover'
            });

            // 鼠标移入时加载维基百科数据
            trigger.addEventListener('mouseenter', async () => {
                try {
                    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(keyword)}`;
                    const response = await fetch(url);
                    if (!response.ok) throw new Error("No info found");

                    const data = await response.json();

                    const summaryHtml = `

                    <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">
                        <strong>${data.title}</strong>
                    </div>
                    <div>
                        ${data.extract}
                    </div><br>
                    <div style="margin-top: 8px; font-size: 12px;"><a href="https://en.wikipedia.org/wiki/${encodeURIComponent(data.title)}" target="_blank" style="color: #007bff; text-decoration: underline;">👉 Click here to view the full Wikipedia article</a></div>
                   `;


                    popover.setContent({
                        '.popover-body': summaryHtml
                    });

                } catch (err) {
                    popover.setContent({
                        '.popover-body': `<span style="color:red;">Failed to load</span>`
                    });
                }
            });
        });
    });


//Prompt generation
    function generateMusicPrompt() {
        const instrumentMap = {
            "山峰": "编钟",
            "小船": "笛子",
            "花树": "古琴",
            "松树": "琵琶",
            "竹子": "笙",
            "水中亭": "古筝"
        };

        const counts = {};
        for (const item of droppedImages) {
            counts[item.name] = (counts[item.name] || 0) + 1;
        }

        const descriptions = [];
        for (const [name, count] of Object.entries(counts)) {
            const instrument = instrumentMap[name];
            if (instrument && count > 0) {
                descriptions.push(`${instrument}${count}次`);
            }
        }

        const instrumentDescription = descriptions.join('、');

        const prompt = `一首中国传统民乐，一分钟左右，使用${instrumentDescription}，灵感来自中国山水画，无人声，无歌词。`;

        return prompt;
    }


    //loading

    // Spinner control functions
    function showPopup(text) {
        const overlay = document.getElementById("overlay");
        if (!overlay) {
            const newOverlay = document.createElement("div");
            newOverlay.id = "overlay";
            newOverlay.style.position = "fixed";
            newOverlay.style.top = "0";
            newOverlay.style.left = "0";
            newOverlay.style.width = "100%";
            newOverlay.style.height = "100%";
            newOverlay.style.display = "flex";
            newOverlay.style.alignItems = "center";
            newOverlay.style.justifyContent = "center";
            newOverlay.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
            newOverlay.style.zIndex = "9999";

            newOverlay.innerHTML = `
            <div class="popup" style="background: white; border-radius: 12px; box-shadow: 0 0 20px rgba(0,0,0,0.3); padding: 30px 50px; text-align: center;">
                <div class="spinner-border text-primary" id="spinner" role="status" style="width: 3rem; height: 3rem;">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p id="popup-text" style="font-size: 18px; font-weight: bold; color: #333; margin-top: 15px;">${text}</p>
            </div>`;
            document.body.appendChild(newOverlay);
        } else {
            document.getElementById("popup-text").textContent = text;
            document.getElementById("spinner").style.display = "inline-block";
            overlay.style.display = "flex";
        }
    }

    function updatePopupToDone(text) {
        document.getElementById("popup-text").textContent = text;
        document.getElementById("spinner").style.display = "none";
    }

    function hidePopupWithDelay() {
        setTimeout(() => {
            const overlay = document.getElementById("overlay");
            if (overlay) overlay.style.display = "none";
        }, 2000);
    }


    //generate music and use Mureka API


    let currentAudioUrl = null;
    let lastMusicTaskId = null;

    // One active task at a time; always restore controls after completion or errors.
    const composeButton = document.getElementById('compose');
    const downloadButton = document.getElementById('download');
    downloadButton.disabled = true;
    let isGenerating = false;

    async function requestMusic(url, options = {}) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 70000);
        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || `Request failed (${response.status}).`);
            return data;
        } catch (error) {
            if (error.name === 'AbortError') throw new Error('Request timed out. Check your connection and retry.');
            if (error instanceof TypeError) throw new Error('Cannot reach the local server. Start python server.py and open the local URL.');
            throw error;
        } finally {
            clearTimeout(timer);
        }
    }

    composeButton.addEventListener('click', async () => {
        if (isGenerating) return;
        if (!droppedImages.length) { alert('Please add a painting element first.'); return; }
        isGenerating = true;
        composeButton.disabled = true;
        downloadButton.disabled = true;
        showPopup('🎶 Generating music...');
        try {
            const data = await requestMusic('/api/music/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: generateMusicPrompt() })
            });
            if (!data.id) throw new Error('Music provider did not return a task ID. Check API compatibility.');
            lastMusicTaskId = data.id;
            const url = await pollUntilReady(lastMusicTaskId);
            currentAudioUrl = url;
            insertAudioPlayer(url);
        } catch (error) {
            alert(error.message || 'Music generation failed. Please retry.');
        } finally {
            hidePopupImmediately();
            isGenerating = false;
            composeButton.disabled = false;
            downloadButton.disabled = !currentAudioUrl;
        }
    });

    // download
    document.getElementById('download').addEventListener('click', () => {
        if (!currentAudioUrl) {
            alert("No audio available yet. Please wait until it's ready.");
            return;
        }

        const link = document.createElement("a");
        link.href = currentAudioUrl;
        link.download = "generated_music.mp3";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    function hidePopupImmediately() {
        const overlay = document.getElementById("overlay");
        if (overlay) overlay.style.display = "none";
    }

    // Stop after a bounded waiting period. Errors immediately return control to the user.
    async function pollUntilReady(taskId) {
        const deadline = Date.now() + 5 * 60 * 1000;
        while (Date.now() < deadline) {
            const result = await requestMusic(`/api/music/query/${encodeURIComponent(taskId)}`);
            if (result.status === 'succeeded') {
                const url = result.choices?.[0]?.url;
                if (!url || !/^https?:\/\//i.test(url)) throw new Error('Music provider returned no valid audio URL.');
                return url;
            }
            if (['failed', 'timeout', 'cancelled'].includes(result.status)) {
                throw new Error('Music generation failed or was cancelled. Please retry.');
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        throw new Error('Stopped waiting after five minutes. The remote task may still finish and incur usage.');
    }

//tools button
    document.getElementById('undo').addEventListener('click', () => {
        if (droppedImages.length === 0) return;

        droppedImages.pop(); // 移除最后一个图像
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空画布

        // 重新绘制剩余图像
        for (const item of droppedImages) {
            const img = new Image();
            img.src = item.src;
            img.onload = () => {
                ctx.drawImage(img, item.x, item.y, item.width, item.height);
            };
        }
    });

    document.getElementById('downloadCanvas').addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'painting.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    let manualSelectedImage = null;

    document.getElementById('zoomIn').addEventListener('click', () => {
        //  优先使用当前选中项，如果没有就默认最后一张
        const imageToZoom = manualSelectedImage || droppedImages[droppedImages.length - 1];

        if (imageToZoom) {
            imageToZoom.width *= 1.1;
            imageToZoom.height *= 1.1;
            redrawCanvas();

            // 每次都更新当前选中项
            manualSelectedImage = imageToZoom;
        } else {
            console.log("❌ No image to zoom in.");
        }
    });

    document.getElementById('zoomOut').addEventListener('click', () => {
        const imageToZoom = manualSelectedImage || droppedImages[droppedImages.length - 1];

        if (imageToZoom) {
            imageToZoom.width *= 0.9;
            imageToZoom.height *= 0.9;
            redrawCanvas();

            manualSelectedImage = imageToZoom;
        } else {
            console.log("❌ No image to zoom out.");
        }
    });

    document.getElementById('delete').addEventListener('click', () => {
        const imageToDelete = manualSelectedImage || droppedImages[droppedImages.length - 1];

        if (imageToDelete) {
            const index = droppedImages.indexOf(imageToDelete);
            if (index > -1) {
                droppedImages.splice(index, 1);
                redrawCanvas();

                // 删除后，自动选中最后一张（如果还有）
                manualSelectedImage = droppedImages[droppedImages.length - 1] || null;
            }
        } else {
            console.log("❌ No image to delete.");
        }
    });


    // insert player
    function insertAudioPlayer(url) {
        const container = document.getElementById("button");
        const old = document.getElementById("generated-audio-player-wrapper");
        if (old) old.remove();

        const wrapper = document.createElement("div");
        wrapper.className = "custom-player";
        wrapper.id = "generated-audio-player-wrapper";

        const audio = document.createElement("audio");
        audio.src = url;
        audio.id = "generated-audio-player";
        audio.autoplay = true;

        const currentTimeText = document.createElement("div");
        currentTimeText.className = "time-text";
        currentTimeText.textContent = "0:00";

        const totalTimeText = document.createElement("div");
        totalTimeText.className = "time-text";
        totalTimeText.textContent = "0:00";

        const progressSlider = document.createElement("input");
        progressSlider.type = "range";
        progressSlider.className = "progress-slider";
        progressSlider.min = 0;
        progressSlider.step = 0.01;
        progressSlider.value = 0;

        audio.addEventListener("loadedmetadata", () => {
            progressSlider.max = audio.duration;
            totalTimeText.textContent = formatTime(audio.duration);
        });

        audio.addEventListener("timeupdate", () => {
            progressSlider.value = audio.currentTime;
            currentTimeText.textContent = formatTime(audio.currentTime);
        });

        progressSlider.addEventListener("input", () => {
            audio.currentTime = progressSlider.value;
        });

        const playPauseBtn = document.createElement("button");
        playPauseBtn.className = "icon-button";
        const playIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M6 5.5v5l3.5-2.5L6 5.5z"/></svg>`;
        const pauseIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M5 5h2v6H5V5zm4 0h2v6H9V5z"/></svg>`;
        playPauseBtn.innerHTML = pauseIcon;

        playPauseBtn.onclick = () => {
            if (audio.paused) {
                audio.play();
                playPauseBtn.innerHTML = pauseIcon;
            } else {
                audio.pause();
                playPauseBtn.innerHTML = playIcon;
            }
        };

        const backBtn = document.createElement("button");
        backBtn.className = "icon-button";
        backBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M7 8l4-3v6L7 8zM4 5h1v6H4V5z"/></svg>`;
        backBtn.onclick = () => {
            audio.currentTime = Math.max(0, audio.currentTime - 10);
        };

        const forwardBtn = document.createElement("button");
        forwardBtn.className = "icon-button";
        forwardBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M9 8l-4 3V5l4 3zm3-3h-1v6h1V5z"/></svg>`;
        forwardBtn.onclick = () => {
            audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
        };

        const progressWrapper = document.createElement("div");
        progressWrapper.className = "progress-wrapper";
        progressWrapper.appendChild(currentTimeText);
        progressWrapper.appendChild(progressSlider);
        progressWrapper.appendChild(totalTimeText);

        wrapper.appendChild(audio);
        wrapper.appendChild(backBtn);
        wrapper.appendChild(playPauseBtn);
        wrapper.appendChild(forwardBtn);
        wrapper.appendChild(progressWrapper);

        container.insertAdjacentElement("beforebegin", wrapper);
    }

    function formatTime(sec) {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }


    window.addEventListener('load', () => {
        resizeCanvasToFitAndRedraw();
    });
