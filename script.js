// 상태
let speakers = [];
let lines = [];
let editingSpeakerIdx = null;

// DOM
const speakerListEl = document.getElementById("speakerList");
const selSpeaker = document.getElementById("selSpeaker");
const dialogueListEl = document.getElementById("dialogueList");
const lineListEl = document.getElementById("lineList");
const captureArea = document.getElementById("captureArea");
const modalOverlay = document.getElementById("modalOverlay");

// ── 화자 모달 ──────────────────────────────────────────
document.getElementById("btnAddSpeaker").addEventListener("click", () => {
    editingSpeakerIdx = null;
    document.getElementById("modalTitle").textContent = "화자 추가";
    document.getElementById("speakerName").value = "";
    document.getElementById("speakerColor").value = "#94a3b8";
    document.getElementById("speakerNameColor").value = "#1e293b";
    document.getElementById("speakerImage").value = "";
    document.querySelector('input[name="profileType"][value="initial"]').checked = true;
    toggleProfileType("initial");
    modalOverlay.classList.add("open");
});

document.getElementById("btnModalCancel").addEventListener("click", () => {
    modalOverlay.classList.remove("open");
});
modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.remove("open");
});

document.querySelectorAll('input[name="profileType"]').forEach(r => {
    r.addEventListener("change", () => toggleProfileType(r.value));
});

function toggleProfileType(val) {
    document.getElementById("colorPickerWrap").style.display = val === "initial" ? "flex" : "none";
    document.getElementById("imageUploadWrap").style.display = val === "image" ? "flex" : "none";
}

document.getElementById("btnModalConfirm").addEventListener("click", () => {
    const name = document.getElementById("speakerName").value.trim();
    if (!name) { alert("이름을 입력해주세요."); return; }

    const profileType = document.querySelector('input[name="profileType"]:checked').value;
    const color = document.getElementById("speakerColor").value;
    const nameColor = document.getElementById("speakerNameColor").value;
    const imageFile = document.getElementById("speakerImage").files[0];

    const finalize = (imageDataURL) => {
        const speaker = { name, color, nameColor, profileType, image: imageDataURL || null };
        if (editingSpeakerIdx !== null) {
            speakers[editingSpeakerIdx] = speaker;
        } else {
            speakers.push(speaker);
        }
        modalOverlay.classList.remove("open");
        renderSpeakers();
        renderSpeakerSelect();
        renderCanvas();
    };

    if (profileType === "image" && imageFile) {
        const reader = new FileReader();
        reader.onload = (e) => finalize(e.target.result);
        reader.readAsDataURL(imageFile);
    } else {
        finalize(null);
    }
});

window.editSpeaker = function(idx) {
    editingSpeakerIdx = idx;
    const s = speakers[idx];
    document.getElementById("modalTitle").textContent = "화자 수정";
    document.getElementById("speakerName").value = s.name;
    document.getElementById("speakerColor").value = s.color;
    document.getElementById("speakerNameColor").value = s.nameColor;
    document.querySelector(`input[name="profileType"][value="${s.profileType}"]`).checked = true;
    toggleProfileType(s.profileType);
    modalOverlay.classList.add("open");
}

window.deleteSpeaker = function(idx) {
    if (!confirm(`"${speakers[idx].name}" 화자를 삭제할까요?`)) return;
    lines = lines.filter(l => l.speakerIdx !== idx);
    lines = lines.map(l => ({ ...l, speakerIdx: l.speakerIdx > idx ? l.speakerIdx - 1 : l.speakerIdx }));
    speakers.splice(idx, 1);
    renderSpeakers();
    renderSpeakerSelect();
    renderLines();
    renderCanvas();
}

function renderSpeakers() {
    speakerListEl.innerHTML = "";
    speakers.forEach((s, i) => {
        const div = document.createElement("div");
        div.className = "speaker-item";
        div.innerHTML = `
            <div class="speaker-thumb" style="background:${s.color}">
                ${s.image ? `<img src="${s.image}" />` : getInitial(s.name)}
            </div>
            <div class="speaker-info" style="color:${s.nameColor}">${s.name}</div>
            <div class="speaker-actions">
                <button class="btn-icon" onclick="editSpeaker(${i})">✎</button>
                <button class="btn-icon del" onclick="deleteSpeaker(${i})">✕</button>
            </div>
        `;
        speakerListEl.appendChild(div);
    });
}

function renderSpeakerSelect() {
    selSpeaker.innerHTML = "";
    speakers.forEach((s, i) => {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = s.name;
        selSpeaker.appendChild(opt);
    });
}

// ── 대화 추가 ──────────────────────────────────────────
document.getElementById("btnAddLine").addEventListener("click", () => {
    const text = document.getElementById("dialogueInput").value.trim();
    if (!text) { alert("대화 내용을 입력해주세요."); return; }
    if (speakers.length === 0) { alert("먼저 화자를 추가해주세요."); return; }
    lines.push({ speakerIdx: parseInt(selSpeaker.value), text });
    document.getElementById("dialogueInput").value = "";
    renderLines();
    renderCanvas();
});

window.deleteLine = function(idx) {
    lines.splice(idx, 1);
    renderLines();
    renderCanvas();
}

window.moveLineUp = function(idx) {
    if (idx === 0) return;
    [lines[idx - 1], lines[idx]] = [lines[idx], lines[idx - 1]];
    renderLines();
    renderCanvas();
}

window.moveLineDown = function(idx) {
    if (idx === lines.length - 1) return;
    [lines[idx + 1], lines[idx]] = [lines[idx], lines[idx + 1]];
    renderLines();
    renderCanvas();
}

function renderLines() {
    lineListEl.innerHTML = "";
    if (lines.length === 0) {
        lineListEl.innerHTML = '<div style="color:var(--muted);font-size:13px;text-align:center;padding:8px 0;">추가된 대화가 없어요</div>';
        return;
    }
    lines.forEach((l, i) => {
        const s = speakers[l.speakerIdx];
        if (!s) return;
        const div = document.createElement("div");
        div.className = "line-item";
        div.innerHTML = `
            <div class="line-speaker" style="color:${s.nameColor}">${s.name}</div>
            <div class="line-text">${l.text.replace(/\n/g, " ")}</div>
            <div class="line-actions">
                <button class="btn-icon" onclick="moveLineUp(${i})">↑</button>
                <button class="btn-icon" onclick="moveLineDown(${i})">↓</button>
                <button class="btn-icon del" onclick="deleteLine(${i})">✕</button>
            </div>
        `;
        lineListEl.appendChild(div);
    });
}

// ── 캔버스 렌더 ──────────────────────────────────────────
function renderCanvas() {
    const padding = parseInt(document.getElementById("padding").value) || 32;
    const bgColor = document.getElementById("bgColor").value;
    const fontFamily = document.getElementById("fontSelect")?.value || "system-ui";
    const fontSize = parseInt(document.getElementById("fontSize")?.value) || 14;
    const lineHeight = (fontSize * 1.65).toFixed(1);
    const gap = parseInt(document.getElementById("lineGap")?.value) || 20;
    
    // 가로폭 값 반영
    const cardWidth = parseInt(document.getElementById("cardWidth").value) || 440;
    const cardWidthVal = document.getElementById("cardWidthVal");
    if (cardWidthVal) cardWidthVal.textContent = cardWidth;

    captureArea.style.background = bgColor;
    captureArea.style.padding = `${padding}px`;
    captureArea.style.maxWidth = `${cardWidth}px`; // 가로폭 연동

    // 글자 크기에 비례하는 프로필 크기 계산 (글자 크기의 약 3.14배)
    const profileSize = Math.max(24, Math.round(fontSize * 3.14));
    const profileGap = Math.max(8, Math.round(fontSize * 0.85)); // 사진과 글자 사이 간격도 비례 조절

    captureArea.style.setProperty('--profile-size', `${profileSize}px`);
    captureArea.style.setProperty('--profile-gap', `${profileGap}px`);

    dialogueListEl.innerHTML = "";
    dialogueListEl.style.fontFamily = fontFamily;

    lines.forEach((l) => {
        const s = speakers[l.speakerIdx];
        if (!s) return;

        const item = document.createElement("div");
        item.className = "dialogue-item";
        item.style.marginBottom = `${gap}px`;
        item.style.gap = `var(--profile-gap)`; // 동적 간격 적용

        const circle = document.createElement("div");
        circle.className = "profile-circle";
        circle.style.background = s.color;
        circle.style.width = `var(--profile-size)`;  // 동적 크기 적용
        circle.style.height = `var(--profile-size)`; // 동적 크기 적용
        
        if (s.image) {
            circle.innerHTML = `<img src="${s.image}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
        } else {
            circle.textContent = getInitial(s.name);
            circle.style.fontSize = `${Math.max(10, Math.round(profileSize * 0.32))}px`; // 이니셜 폰트도 비례 조절
        }

        const content = document.createElement("div");
        content.className = "dialogue-content";

        const nameEl = document.createElement("div");
        nameEl.className = "speaker-name";
        nameEl.style.color = s.nameColor;
        nameEl.style.fontSize = `${Math.max(11, fontSize - 2)}px`;
        nameEl.textContent = s.name;

        const textEl = document.createElement("div");
        textEl.className = "dialogue-text";
        textEl.style.fontSize = `${fontSize}px`;
        textEl.style.lineHeight = `${lineHeight}px`;
        textEl.textContent = l.text;

        content.appendChild(nameEl);
        content.appendChild(textEl);
        item.appendChild(circle);
        item.appendChild(content);
        dialogueListEl.appendChild(item);
    });

    const items = dialogueListEl.querySelectorAll(".dialogue-item");
    if (items.length > 0) items[items.length - 1].style.marginBottom = "0";
}

function getInitial(name) {
    return name.charAt(0).toUpperCase();
}

// ── 설정 변경 이벤트 ──────────────────────────────────────
["bgColor", "padding", "fontSelect", "fontSize", "lineGap", "cardWidth"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener("input", renderCanvas);
        el.addEventListener("change", renderCanvas);
    }
});

window.stepVal = function(id, step) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = (parseInt(el.value) || 0) + step;
    renderCanvas();
}

// ── 저장 / 복사 ──────────────────────────────────────────
function captureCanvas(callback) {
    const originalPadding = captureArea.style.padding;
    html2canvas(captureArea, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 2
    }).then(canvas => {
        captureArea.style.padding = originalPadding;
        callback(canvas);
    }).catch(() => {
        captureArea.style.padding = originalPadding;
    });
}

document.getElementById("btnSave").addEventListener("click", () => {
    captureCanvas(canvas => {
        const dataURL = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `dialogue_${Date.now()}.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});

document.getElementById("btnCopy").addEventListener("click", () => {
    captureCanvas(canvas => {
        canvas.toBlob(blob => {
            if (!blob) { alert("이미지 변환 실패"); return; }
            const item = new ClipboardItem({ "image/png": blob });
            navigator.clipboard.write([item])
                .then(() => alert("이미지가 클립보드에 복사되었습니다!"))
                .catch(() => alert("복사 실패. 저장 버튼을 사용해주세요."));
        }, "image/png");
    });
});

// ── 초기 렌더 ──────────────────────────────────────────
renderCanvas();
