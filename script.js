//file選択ボタン取得
const fileInput =
    document.getElementById("fileInput");

//変換前のxml楽譜の表示エリア取得
const beforeScore =
    document.getElementById("beforeScore");

//変換後のxml楽譜の表示エリア取得
const afterScore =
    document.getElementById("afterScore");

//変換前のOSMD準備
const beforeOsmd = new opensheetmusicdisplay.OpenSheetMusicDisplay("beforeScore");

//変換後のOSMD準備
const afterosmd = new opensheetmusicdisplay.OpenSheetMusicDisplay("afterScore");

//変換前の表示切替
const showBefore =
    document.getElementById("showBefore");

//変換後の表示切替
const showAfter =
    document.getElementById("showAfter");

fileInput.addEventListener("change", async function(e) {

    const file = e.target.files[0];

    console.log(file);

    const zip =
        await JSZip.loadAsync(file);

    console.log(zip);

    console.log(Object.keys(zip.files));

    const xmlName = Object.keys(zip.files).find(name => name.endsWith(".xml") &&!name.includes("META-INF"));
    console.log(xmlName);
    
    const xmlText =
    await zip.files[xmlName].async("string");

    console.log(xmlText);

    console.log(beforeScore.clientWidth);

    await beforeOsmd.load(xmlText);

    beforeOsmd.render();
});