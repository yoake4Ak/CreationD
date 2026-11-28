// file選択ボタン取得
const fileInput = document.getElementById("fileInput");

// 変換前のxml楽譜の表示エリア取得
const beforeScore = document.getElementById("beforeScore");

// 変換後のxml楽譜の表示エリア取得
const afterScore = document.getElementById("afterScore");

// 変換前のOSMD準備
const beforeOsmd = new opensheetmusicdisplay.OpenSheetMusicDisplay("beforeScore");

// 変換後のOSMD準備
const afterOsmd =
    new opensheetmusicdisplay.OpenSheetMusicDisplay("afterScore", {
        pageFormat: "A4_P", autoResize: false, newPageFromXML: false
    });

//変換元
const sourceClef =
    document.getElementById("sourceClef");

//変換先
const targetClef = document.getElementById("targetClef");

let currentXml = "";

// =====================
// 音部変換用
// =====================

//ト音の変換パターン(完成済み)
function convertFromTreble(xmlText, target) {

    const doc = new DOMParser().parseFromString(xmlText, "application/xml");

    let sign = "G";
    let line = "2";
    let octaveShift = 0;//ト音
    //
    if (target === "alto") {
        sign = "C";
        line = "3";
        octaveShift = -1;//ハ音
    }
    //
    if (target === "bass") {
        sign = "F";
        line = "4";
        octaveShift = -2;//ヘ音
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

//ハ音の変換パターン
function convertFromAlto(xmlText, target) {

    const doc = new DOMParser().parseFromString(xmlText, "application/xml");

    let sign = "G";
    let line = "2";
    let octaveShift = 1;
    //
    if (target === "alto") {
        sign = "C";
        line = "3";
        octaveShift = 0;
    }
    //ヘ音
    if (target === "bass") {
        sign = "F";
        line = "4";
        octaveShift = -1;
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

//ヘ音の変換パターン
function convertFromBass(xmlText, target) {

    const doc = new DOMParser().parseFromString(xmlText, "application/xml");

    let sign = "G";
    let line = "2";
    let octaveShift = 2;
    //
    if (target === "alto") {
        sign = "C";
        line = "3";
        octaveShift = 1;
    }
    //ヘ音
    if (target === "bass") {
        sign = "F";
        line = "4";
        octaveShift = 0;
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

// PDFに表示するオクターブ変換量を検査
function getOctaveLabel(source, target) {

    if (source === "treble" && target === "alto") return "+1";
    if (source === "treble" && target === "bass") return "+2";

    if (source === "alto" && target === "treble") return "-1";
    if (source === "alto" && target === "bass") return "+1";

    if (source === "bass" && target === "treble") return "-2";
    if (source === "bass" && target === "alto") return "-1";

    return "0";
}

// PDF出力処理
async function exportPDF() {
    // OSMDが生成したページを取得
    const pages = [...afterScore.children];
    // PDF作成用のライブラリjsPDFを準備
    const { jsPDF } = window.jspdf;
    // A4縦向き、mm単位の用紙設定
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    // A4用紙のサイズ
    const pageWidth = pdf.internal.pageSize.getWidth();
    // 余白
    const margin = 12;
    // 楽譜の表示サイズ
    const imgWidth = pageWidth - margin * 2;
    // ページごとにSVGをPDFに追加
    for (let i = 0; i < pages.length; i++) {

        // SVGを取得
        const svg = pages[i].querySelector("svg");

        // SVGの縦横比を取得
        const viewBox = svg.viewBox.baseVal;
        const imgHeight = imgWidth * (viewBox.height / viewBox.width);

        // 2ページ目以降は新しいPDFページを追加
        if (i > 0) {
            pdf.addPage();
        }

        // SVGを直接PDFに変換
        await pdf.svg(svg, {
            x: margin,
            y: margin,
            width: imgWidth,
            height: imgHeight
        });

        //オクターブ表示
        if (i === 0) {
            pdf.setFontSize(15);
            pdf.setTextColor(0, 0, 0);

            const octaveLabel = getOctaveLabel(sourceClef.value, targetClef.value);

            pdf.text(octaveLabel, 22, 33);
        }
        console.log("SVG変換完了:", i + 1);
    }
    // PDFを保存
    pdf.save("変換後の楽譜.pdf");
};

// PDF出力ボタンを取得
const fileOutput = document.getElementById("fileOutput");

// ボタンが押されたらPDF出力
fileOutput.addEventListener("click", exportPDF);



// 変換前ボタンが押されたら変換前の楽譜を表示する
// 左のプルダウンに変更があったときに楽譜を表示
sourceClef.addEventListener("change", function () {
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
    beforeScore.style.display = "block";
    afterScore.style.display = "none";

    await beforeOsmd.load(xmlText);
    beforeOsmd.render();

});

targetClef.addEventListener("change", async function () {

    if (!currentXml) return;

    // ト音が選択された場合
    if (sourceClef.value === "treble") {

        const convertedXml = convertFromTreble(currentXml, targetClef.value);

        afterScore.style.display = "block";

        await afterOsmd.load(convertedXml);

        afterOsmd.render();

        beforeScore.style.display = "none";

    }

    // ハ音が選択された場合
    if (sourceClef.value === "alto") {

        const convertedXml = convertFromAlto(currentXml, targetClef.value);

        afterScore.style.display = "block";

        await afterOsmd.load(convertedXml);

        afterOsmd.render();

        beforeScore.style.display = "none";

    }

    // ヘ音が選択された場合
    if (sourceClef.value === "bass") {

        const convertedXml = convertFromBass(currentXml, targetClef.value);

        afterScore.style.display = "block";

        await afterOsmd.load(convertedXml);

        afterOsmd.render();

        beforeScore.style.display = "none";

    }
}
);

