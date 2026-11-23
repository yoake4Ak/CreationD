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
const showBefore =
    document.getElementById("showBefore");

// 変換後の表示切替
const showAfter =
    document.getElementById("showAfter");

// =====================
// 音部変換用
// ト音記号 → ヘ音記号
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

function convertTrebleToBass(xmlText) {

    const doc =
        new DOMParser().parseFromString(
            xmlText,
            "application/xml"
        );

    // 音符位置を移動
    const pitches =
        doc.getElementsByTagName("pitch");

    for (const pitch of pitches) {

        const stepEl =
            pitch.getElementsByTagName("step")[0];

        const octaveEl =
            pitch.getElementsByTagName("octave")[0];

        if (!stepEl || !octaveEl) {
            continue;
        }

        const oldIndex =
            pitchToIndex(
                stepEl.textContent,
                Number(octaveEl.textContent)
            );

        const result =
            indexToPitch(
                oldIndex + CLEF_SHIFT
            );

        stepEl.textContent = result.step;
        octaveEl.textContent = result.octave;
    }

    // 音部記号をヘ音記号へ変更
    const clefs =
        doc.getElementsByTagName("clef");

    for (const clef of clefs) {

        clef.replaceChildren();

        const sign =
            doc.createElement("sign");
        sign.textContent = "F";

        const line =
            doc.createElement("line");
        line.textContent = "4";

        clef.appendChild(sign);
        clef.appendChild(line);
    }

    return new XMLSerializer()
        .serializeToString(doc);
}

// 変換前ボタンが押されたら変換前の楽譜を表示する
showBefore.addEventListener("click", function () {

    beforeScore.style.display = "block";
    afterScore.style.display = "none";

});

// 変換後ボタンが押されたら変換後の楽譜を表示する
showAfter.addEventListener("click", function () {

    beforeScore.style.display = "none";
    afterScore.style.display = "block";

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

    // =====================
    // 変換前表示
    // =====================
    await beforeOsmd.load(xmlText);
    beforeOsmd.render();

    // =====================
    // 音部変換
    // =====================
    const convertedXml =
        convertTrebleToBass(xmlText);

    // =====================
    // 変換後表示
    // =====================
    await afterOsmd.load(convertedXml);
    afterOsmd.render();

});