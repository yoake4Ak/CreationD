// file選択ボタン取得
const fileInput =
    document.getElementById("fileInput");

// 変換前のxml楽譜の表示エリア取得
const beforeScore =
    document.getElementById("beforeScore");

// 変換後のxml楽譜の表示エリア取得
const afterScore =
    document.getElementById("afterScore");

// 変換前のOSMD準備
const beforeOsmd =
    new opensheetmusicdisplay.OpenSheetMusicDisplay("beforeScore");

// 変換後のOSMD準備
const afterOsmd =
    new opensheetmusicdisplay.OpenSheetMusicDisplay("afterScore");

// 変換前の表示切替
const showBefore = document.getElementById("showBefore");

//変換元
const sourceClef =
    document.getElementById("sourceClef");

//変換先
const targetClef = document.getElementById("targetClef");

let currentXml = "";

// =====================
// 音部変換用
// =====================

const STEPS = ["C", "D", "E", "F", "G", "A", "B"];

const CLEF_SHIFT = -6;

function pitchToIndex(step, octave) {
    return octave * 7 + STEPS.indexOf(step);
}

function indexToPitch(index) {

    let octave = Math.floor(index / 7);
    let stepIndex = index % 7;

    if (stepIndex < 0) {
        stepIndex += 7;
        octave--;
    }

    return {
        step: STEPS[stepIndex],
        octave: octave
    };
}

//ト音の変換パターン(完成済み)
function convertFromTreble(xmlText, target) {

    const doc = new DOMParser().parseFromString(xmlText,"application/xml");

    let sign = "G";
    let line = "2";
    let octaveShift = 0;
    //
    if (target === "alto") {
        sign = "C";
        line = "3";
        octaveShift = -1;
    }
    //ヘ音
    if (target === "bass") {
        sign = "F";
        line = "4";
        octaveShift = -2;
    }

    const clefs = doc.getElementsByTagName("clef");

    for (const clef of clefs) {

        clef.replaceChildren();

        const signEl = doc.createElement("sign");

        signEl.textContent = sign;

        const lineEl = doc.createElement("line");

        lineEl.textContent = line;

        clef.appendChild(signEl);
        clef.appendChild(lineEl);
    }

    const octaves = doc.getElementsByTagName("octave");

    for (const octave of octaves) {

        octave.textContent = Number(octave.textContent) + octaveShift;
    }

    return new XMLSerializer()
        .serializeToString(doc);
}

//ハ音の変換パターン（未調整）
function convertFromAlto(xmlText, target) {

    const doc = new DOMParser().parseFromString(xmlText,"application/xml");

    let sign = "G";
    let line = "2";
    let octaveShift = 0;
    //
    if (target === "alto") {
        sign = "C";
        line = "3";
        octaveShift = -1;
    }
    //ヘ音
    if (target === "bass") {
        sign = "F";
        line = "4";
        octaveShift = -2;
    }

    const clefs = doc.getElementsByTagName("clef");

    for (const clef of clefs) {

        clef.replaceChildren();

        const signEl = doc.createElement("sign");

        signEl.textContent = sign;

        const lineEl = doc.createElement("line");

        lineEl.textContent = line;

        clef.appendChild(signEl);
        clef.appendChild(lineEl);
    }

    const octaves = doc.getElementsByTagName("octave");

    for (const octave of octaves) {

        octave.textContent = Number(octave.textContent) + octaveShift;
    }

    return new XMLSerializer()
        .serializeToString(doc);
}

//ヘ音の変換パターン（未調整）
function convertFromBass(xmlText, target) {

    const doc = new DOMParser().parseFromString(xmlText,"application/xml");

    let sign = "G";
    let line = "2";
    let octaveShift = 0;
    //
    if (target === "alto") {
        sign = "C";
        line = "3";
        octaveShift = -1;
    }
    //ヘ音
    if (target === "bass") {
        sign = "F";
        line = "4";
        octaveShift = -2;
    }

    const clefs = doc.getElementsByTagName("clef");

    for (const clef of clefs) {

        clef.replaceChildren();

        const signEl = doc.createElement("sign");

        signEl.textContent = sign;

        const lineEl = doc.createElement("line");

        lineEl.textContent = line;

        clef.appendChild(signEl);
        clef.appendChild(lineEl);
    }

    const octaves = doc.getElementsByTagName("octave");

    for (const octave of octaves) {

        octave.textContent = Number(octave.textContent) + octaveShift;
    }

    return new XMLSerializer()
        .serializeToString(doc);
}

// 変換前ボタンが押されたら変換前の楽譜を表示する
// 左のプルダウンに変更があったときに楽譜を表示
sourceClef.addEventListener("change", function() {
    beforeScore.style.display = "block";//変換前表示
    afterScore.style.display = "none";//変換後非表示
  
});



// MXLファイルが選択されたときの処理
fileInput.addEventListener("change", async function (e) {

    // 選択されたファイルを取得する
    const file = e.target.files[0];

    // MXLファイルをZIPとして解凍する
    const zip =
        await JSZip.loadAsync(file);

    // META-INF以外のXMLファイルを探す
    const xmlName =
        Object.keys(zip.files).find(
            name =>
                name.endsWith(".xml") &&
                !name.includes("META-INF")
        );

    // 楽譜本体のXMLを文字列として取得する
    const xmlText =
        await zip.files[xmlName].async("string");
        currentXml = xmlText;
    console.log(xmlText);

    // =====================
    // 変換前表示
    // =====================
    await beforeOsmd.load(xmlText);
    beforeOsmd.render();

});

//プルダウンごとの音部変換・表示の起動処理
// =====================
// 音部変換
sourceClef.addEventListener("change", async function() {
    // 楽譜が読み込まれていない場合は終了
    if (!currentXml) return;

    //ト音が選択された場合
    if (sourceClef.value === "treble") {

        const convertedXml =convertFromTreble(currentXml,targetClef.value);
        //変換後表示
        await afterOsmd.load(convertedXml);
        afterOsmd.render();//楽譜描画

    }

    //ハ音が選択された場合
    if (sourceClef.value === "alto") {

        const convertedXml =convertFromAlto(currentXml,targetClef.value);
        //変換後表示
        await afterOsmd.load(convertedXml);
        afterOsmd.render();

    }

    //ヘ音が選択された場合
    if (sourceClef.value === "bass") {

        const convertedXml =convertFromBass(currentXml,targetClef.value);
        //変換後表示
        await afterOsmd.load(convertedXml);
        afterOsmd.render();

    }

});

targetClef.addEventListener("change",async function () {

        if (!currentXml) return;
        
        // ト音が選択された場合
        if (sourceClef.value === "treble") {

        const convertedXml = convertFromTreble(currentXml,targetClef.value);

        await afterOsmd.load(convertedXml);

        afterOsmd.render();

        beforeScore.style.display = "none";
        afterScore.style.display = "block";
        }

        // ハ音が選択された場合
        if (sourceClef.value === "alto") {

        const convertedXml = convertFromAlto(currentXml,targetClef.value);

        await afterOsmd.load(convertedXml);

        afterOsmd.render();

        beforeScore.style.display = "none";
        afterScore.style.display = "block";
        }

        // ヘ音が選択された場合
        if (sourceClef.value === "bass") {

        const convertedXml = convertFromBass(currentXml,targetClef.value);

        await afterOsmd.load(convertedXml);

        afterOsmd.render();

        beforeScore.style.display = "none";
        afterScore.style.display = "block";
        }
    }
);

