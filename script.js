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

//ハ音の変換パターン（未調整）
function convertFromAlto(xmlText, target) {

    const doc = new DOMParser().parseFromString(xmlText,"application/xml");

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

//ヘ音の変換パターン（未調整）
function convertFromBass(xmlText, target) {

    const doc = new DOMParser().parseFromString(xmlText,"application/xml");

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
    // 変換後の楽譜を画像に変換
    const canvas = await html2canvas(afterScore, {scale: 1,backgroundColor: "#ffffff"});
    // PDF作成用のライブラリjsPDFを準備
    const { jsPDF } = window.jspdf;
    //A4縦向き,mm単位の用紙設定
    const pdf = new jsPDF({orientation: "portrait",unit: "mm",format: "a4"});
    // A4用紙のサイズを保存
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    //余白の設定
    const margin = 12;
    //楽譜自体の横幅
    const imgWidth = pageWidth - margin * 2;
    //解像度倍率設定
    const scale = imgWidth / canvas.width;
    // 1ページ分の縦幅
    const sliceHeight = (pageHeight - margin * 2) / scale -60;
    //切り取り開始位置
    let position = 0;

    while (position < canvas.height){// 1ページ縦幅と残りの全体縦幅を比較
        const currentHeight = Math.min(sliceHeight,canvas.height - position);
        // 1ページ分の画像を入れるキャンバスを作成
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        //縦の長さの小数点以下切り上げ
        pageCanvas.height = Math.ceil(currentHeight);
        //描画可能状態に変更
        const ctx = pageCanvas.getContext("2d");
        //切り取り
        ctx.drawImage(canvas,0, position,canvas.width,
             currentHeight,0, 0,canvas.width, currentHeight);
        // 切り取った画像をPNG形式に変換
        const imgData = pageCanvas.toDataURL("image/jpng",0.8);
        // PDFに画像を貼り付け
        pdf.addImage(imgData,"JPNG",margin,margin,imgWidth,currentHeight * scale);
        
        //オクターブ表示
        if (position === 0) {
            pdf.setFontSize(15);
            pdf.setTextColor(0, 0, 0);

            const octaveLabel = getOctaveLabel(sourceClef.value,targetClef.value);

            pdf.text(octaveLabel, 22, 55);
        }
        // 次の切り取り位置へ移動
        position += currentHeight;
        // 画像が残っていれば次のページを追加
        if (position < canvas.height) {
            pdf.addPage();
        }
    }
    // PDFを保存
    pdf.save("変換後の楽譜.pdf");
}

// PDF出力ボタンを取得
const fileOutput = document.getElementById("fileOutput");

// ボタンが押されたらPDF出力
fileOutput.addEventListener("click", exportPDF);



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

