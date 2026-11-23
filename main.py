from music21 import converter,clef,interval#uv run python main.pyで実行,intervalで音程をいじれるようにする

score = converter.parse("d-diaokanon-baiorin-er-zhong-zou.mxl")#MXLファイルを読み込む

#score.show('text')#楽譜すべて表示
# 音符の移動設定を保存(ト音～へ音)
diatonic_shift_t_h = -15#開始地点も含むため＋１

# 音部記号をヘ音記号に変換
for part in score.parts:
    clefs = part.recurse().getElementsByClass('Clef')

    for old_clef in clefs:
        old_clef.activeSite.replace(old_clef, clef.BassClef())

#音符をすべて-2音＋オクターブ打消しの-12＋初期位置の-1
for part in score.parts:
    notes = part.recurse().getElementsByClass('Note')

    for note in notes:
        note.transpose(
            interval.GenericInterval(diatonic_shift_t_h),
            inPlace=True
)

# 変換した楽譜をMXL形式で保存
score.write('musicxml', fp='converted_score.mxl')


