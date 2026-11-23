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
