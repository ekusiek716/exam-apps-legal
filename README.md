# exam-apps-legal

資格試験トレーニングアプリ群（電工2種トレ／電工1種トレ／応用情報トレ／ITパスポートトレ／基本情報トレ／HCD基礎検定トレ／社労士トレ／歯科衛生士国試トレ／FPトレ／管理栄養士国試トレ／宅建トレ／屋外広告士トレ）の
**利用規約・プライバシーポリシー・サポートページ**を GitHub Pages で公開するリポジトリです。

## 公開ページ

GitHub Pages（Jekyll 既定テーマ）でレンダリングしています。

| ページ | パス | URL |
|---|---|---|
| サポート（トップ） | `index.md` | https://ekusiek716.github.io/exam-apps-legal/ |
| お問い合わせ | `support.md` | https://ekusiek716.github.io/exam-apps-legal/support |
| プライバシーポリシー | `privacy.md` | https://ekusiek716.github.io/exam-apps-legal/privacy |
| 利用規約 | `terms.md` | https://ekusiek716.github.io/exam-apps-legal/terms |
| 特定商取引法に基づく表記 | `tokushoho.md` | https://ekusiek716.github.io/exam-apps-legal/tokushoho |

12アプリ共通の1ページ構成です（各ページ末尾の「対象アプリ」節で対象を列挙）。各アプリの収録範囲と出典は、アプリ内の試験案内・出典表示をご確認ください。

## 公開されているかを確かめる

GitHub Pages のビルドは非同期で、失敗しても手元では何も起きない。マージした本文が実際に
公開ページへ届いているかは、実URLを取りに行って確かめる。

```bash
node scripts/check-published-drift.mjs
```

各 markdown の本文行が、対応する公開ページのテキストに出ているかを見る（Jekyll のビルドを
ローカルで再現せずに済むよう、HTMLのバイト一致ではなく本文の含有で判定する）。
終了コードは 0 一致 / 1 未反映あり / 2 到達不能（＝未反映の証拠にはならない）。

`support.md` の問い合わせフォームのように Liquid の条件ブロック（`{% if %}`）で出し分けている
箇所は、設定次第で出ないのが正しいため検査の対象外にしている。

## drafts/ について

`drafts/` には、公開ページの元になった日本語ドラフト（プレースホルダ入り）を保管しています。

- `drafts/privacy-policy.md` / `drafts/terms-of-service.md` — 公開ページの原文ドラフト

> **注意:** これらはいずれも**弁護士レビュー前提のドラフト**です。ストア審査提出・本公開の前に、法務専門家によるレビューを受けてください。

### 特定商取引法に基づく表記（tokushoho）は公開済み

事業者氏名（奥野 圭祐）確定のため `tokushoho.md` としてページ化し、各ページからリンク済みです。

## お問い合わせフォーム

`support.md` のフォームは、`_config.yml` の `contact_form_endpoint`（Google Apps Script の Web App URL）が設定されているときだけ表示されます。未設定の間はメール窓口のみを掲載します。
受信用スクリプトは `tools/contact-form.gs`、設定手順（オーナー本人作業）は [`docs/contact-form-setup.md`](docs/contact-form-setup.md) を参照してください。

## 連絡先

- ekusiek716@gmail.com
