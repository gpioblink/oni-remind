# 鬼リマインド

GitHubのissueから期限が近いものをリマインドしてくれるツールです

![image](https://user-images.githubusercontent.com/38032069/232654676-cebfa4d0-142f-4396-b550-0a5195f42f44.png)

# 使い方

## 期限を通知してくれるissue

「MM/DD タスク名」のように、月と日付から始まるissueについて期限を通知します。

## インストール方法

1. config配置用のリポジトリを別に作り、`notification-methods.yml`と`reminders.yml`を配置する (設定の例: https://github.com/gpioblink/oni-remind-config-skeleton )
1. このリポジトリをフォークする
1. フォークしたリポジトリの設定で、1で作ったリポジトリ名を`CONFIG_REPO_NAME`として環境変数に入れる (例: `gpioblink/oni-remind-config`)
1. フォークしたリポジトリの設定で、1で作ったリポジトリと、リマインドしたいリポジトリに権限のあるParsonal Access Tokenをつくり、`GH_PAT`としてシークレットに入れる。PATの権限はContentsとIssuesにRead-only Accessをつける
1. あとはcronで日付から始まるissueに対して、毎時に期限切れのタスクのリマインド、毎日9時と21時に締め切り間近のタスクのリマインドが行われるようになる
