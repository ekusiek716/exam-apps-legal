# AGENTS.md — exam-apps-legal

このリポジトリは、資格試験トレーニングアプリ群の利用規約、プライバシーポリシー、特定商取引法に基づく表記、サポートページを GitHub Pages で公開する。

## 文書の扱い

- 公開対象は `index.md` / `privacy.md` / `terms.md` / `tokushoho.md`。`drafts/` は弁護士レビュー前提の原文ドラフトであり、公開ページと同一とはみなさない。
- 対象アプリ名、連絡先、データ保存・バックアップ、課金・購入復元、返金、外部サービスの説明は、関連する全公開ページで矛盾させない。
- 実質的な法務方針、事業者情報、価格・課金、個人情報の取扱いを変更するときは、オーナーの明示確認を得る。法務専門家による確認が必要な内容を、AIの判断だけで確定しない。
- 実在の個人情報、秘密情報、未公開の契約情報を追加しない。
- Markdown の front matter、相対リンク、GitHub Pages での公開パスを保つ。

## 確認項目

- `git diff --check`
- 公開4ページ間の対象アプリ、連絡先、関連リンク、データ・課金説明の整合
- `README.md` と公開ページの説明の整合
- 変更したリンクと front matter の妥当性

<!-- BEGIN:codex-pr-review-guidelines -->
## Codex PR Review Guidelines

Codex code review is expected to run on pull requests for this repository after the repository is enabled in ChatGPT Codex Code review settings. If an immediate review is needed, comment `@codex review` on the pull request.

When reviewing, prioritize P0/P1 issues: accidental disclosure of personal or confidential data, materially incorrect privacy or payment statements, broken public links, inconsistent operator/contact information, and changes that could mislead users about storage, backup, subscriptions, refunds, or external services.

Respect the distinction between published pages and `drafts/`. Reviewers should identify which checks were performed and must not recommend merge when substantive legal changes lack explicit owner confirmation or required specialist review.
<!-- END:codex-pr-review-guidelines -->
