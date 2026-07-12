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

// 모달 확인 버튼 - 원본 로직 유지
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

function toggleProfileType(val) {
    document.getElementById("colorPickerWrap").style.display = val === "initial" ? "flex" : "none";
    document.getElementById("imageUploadWrap").style.display = val === "image" ? "flex" : "none";
}

// ── 화자/대화 렌더링 ──────────────────────────────────────────
function renderSpeakers() {
    speakerListEl.innerHTML = "";
    speakers.forEach((s, i) => {
        const div = document.createElement("div");
        div.className = "speaker-item";
        div.innerHTML = `
            <div class="speaker-thumb" style="background:${s.color}">${s.image ? `<img src="${s.image}" />` : s.name.charAt(0)}</div>
            <div style="color:${s.nameColor}">${s.name}</div>
            <button onclick="editSpeaker(${i})">수정</button>
            <button onclick="deleteSpeaker(${i})">삭제</button>
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

function renderLines() {
    lineListEl.innerHTML = "";
    lines.forEach((l, i) => {
        const div = document.createElement("div");
        div.innerHTML = `${speakers[l.speakerIdx].name}: ${l.text} <button onclick="deleteLine(${i})">✕</button>`;
        lineListEl.appendChild(div);
    });
}

// ── 핵심 기능 ──────────────────────────────────────────
function renderCanvas() {
    const fontSize = parseInt(document.getElementById("fontSize").value) || 14;
    const profileSize = Math.round((fontSize / 14) * 44);
    
    dialogueListEl.innerHTML = "";
    lines.forEach((l) => {
        const s = speakers[l.speakerIdx];
        const item = document.createElement("div");
        item.style.display = "flex";
        item.style.marginBottom = document.getElementById("lineGap").value + "px";
        item.innerHTML = `
            <div style="width:${profileSize}px;height:${profileSize}px;background:${s.color};border-radius:50%;">${s.image ? `<img src="${s.image}" width="100%"/>` : s.name.charAt(0)}</div>
            <div style="font-size:${fontSize}px">${l.text}</div>
        `;
        dialogueListEl.appendChild(item);
    });
}

function deleteLine(idx) {
    lines.splice(idx, 1);
    renderLines();
    renderCanvas();
}

function stepVal(id, step) {
    const el = document.getElementById(id);
    el.value = parseInt(el.value) + step;
    renderCanvas();
}

document.getElementById("btnAddLine").addEventListener("click", () => {
    const text = document.getElementById("dialogueInput").value;
    lines.push({ speakerIdx: selSpeaker.value, text });
    renderLines();
    renderCanvas();
});

renderCanvas();
