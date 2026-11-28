## CreationD
創成Dチーム5
Gitコマンド
##　メインブランチを更新
git pull

## ブランチをメインに移動
git switch main

## ブランチを作って切り替える
git switch -c <ブランチ名>

## ブランチ名	用途
dev/login	新機能開発
fix/header	バグ修正

## コミットする
git add .
git commit -m "コメント"

## プッシュする
git push -u origin <ブランチ名>

＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
##アルゴリズム
ユーザーが MXL ファイルをアップロードする
MXL を展開して MusicXML データを取得する
楽譜内の音符情報を読み込む
変換前の音部記号と変換後の音部記号を取得する
音部記号の差から必要な音程シフト量を計算する
全ての音符について音高をシフトする
変換後の MusicXML を生成する
OpenSheetMusicDisplay で楽譜を描画する
楽譜を PDF として出力する

##口頭なら
本システムでは、まずアップロードされた MXL ファイルを展開して MusicXML を取得します。次に、ユーザーが選択した変換前後の音部記号から音程のずれを計算し、その差分だけ全ての音符の音高を変更します。変換後のデータを再描画し、最終的に PDF として保存できるようにしています。
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
## このプログラムは何をするもの？
回答例
MusicXML形式の楽譜を読み込み、ト音記号・ハ音記号・ヘ音記号に変換して表示するWebアプリです。また、変換後の楽譜をPDFとして出力できます。

## currentXml は何のため？
JavaScript
let currentXml = "";

回答例
読み込んだMusicXMLを保存する変数です。音部変換時に再度ファイルを読み込まなくても変換できるように保持しています。

## DOMParserを使う理由
JavaScript
const doc =
new DOMParser().parseFromString(
xmlText,
"application/xml"
);

回答例
MusicXMLは文字列なので、そのままではタグを書き換えられません。DOMParserでXMLをDOMオブジェクトに変換することで、clefタグやoctaveタグを編集できるようにしています。

## sign と line は何？
音部記号の種類と5線譜のライン

## octaveShift は何？
JavaScript
octaveShift

回答例
音の高さを補正するための値です。音部記号だけ変えると音の対応関係が変わってしまうため、octaveタグの値も変更しています。


## replaceChildrenは何をしている？
JavaScript
clef.replaceChildren();

回答例
clef要素の中身を全て削除しています。既存のsignやlineを消して、新しい音部記号情報を書き込むために使用しています。

## なぜ Object.keys を使う？
JavaScript
Object.keys(zip.files)

回答例
JSZipが管理しているZIP内のファイル情報はオブジェクトなので、ファイル名だけを取得するためにObject.keysを使用しています。


## findを使う理由
JavaScript
.find(...)
 

回答例
条件に一致する最初のファイルを取得するためです。MusicXML本体は1つなのでfindを使用しています。

## なぜMETA-INFを除外する？
JavaScript
!name.includes("META-INF")

回答例
MXLには楽譜本体以外に管理用XMLが存在します。container.xmlを誤って読み込まないよう除外しています。

## async / await を使う理由
JavaScript
await JSZip.loadAsync(file);

回答例
ファイル読込やZIP展開には時間がかかるため非同期処理になります。awaitを使うことで処理完了を待ってから次の処理を実行しています。

## OSMDとは？
JavaScript
new OpenSheetMusicDisplay(...)

回答例
OpenSheetMusicDisplayというライブラリです。MusicXMLをブラウザ上で楽譜として描画できます。

## PDF出力の流れ

回答例
OSMDが描画したSVGを取得
jsPDFを生成
SVGをPDFへ変換
オクターブ番号を記載
PDF保存

## なぜSVGをPDFへ変換する？
JavaScript
await pdf.svg(svg)

回答例
SVGはベクター形式なので、画像として貼り付けるよりも拡大しても劣化しません。そのため高品質なPDFを出力できます。
