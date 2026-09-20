---
title: お問い合わせ
---

# お問い合わせ

資格試験トレーニングアプリ群へのご質問・不具合のご報告の窓口です。

## お問い合わせの前に

よくあるご質問（学習データの引き継ぎ、購入の復元、買い切りの対象範囲、解約・返金など）は[サポートページのFAQ](./)にまとめています。先にご確認いただくと解決が早い場合があります。

{% assign contact_endpoint = site.contact_form_endpoint | default: "" %}
{% if contact_endpoint != "" %}
## お問い合わせフォーム

アプリ名・端末機種・OSバージョンを本文に添えていただけると、確認がスムーズです。

<form id="contact-form" class="contact-form" novalidate>
  <p class="contact-field">
    <label for="contact-type">用件の種別（必須）</label>
    <select id="contact-type" name="type" required>
      <option value="不具合・エラー">不具合・エラー</option>
      <option value="購入・課金・復元">購入・課金・復元</option>
      <option value="学習データ・引き継ぎ">学習データ・引き継ぎ</option>
      <option value="問題内容の誤りの報告">問題内容の誤りの報告</option>
      <option value="ご要望">ご要望</option>
      <option value="その他">その他</option>
    </select>
  </p>

  <p class="contact-field">
    <label for="contact-app">対象アプリ（必須）</label>
    <select id="contact-app" name="app" required>
      <option value="電工2種トレ">電工2種トレ</option>
      <option value="電工1種トレ">電工1種トレ</option>
      <option value="応用情報トレ">応用情報トレ</option>
      <option value="ITパスポートトレ">ITパスポートトレ</option>
      <option value="基本情報トレ">基本情報トレ</option>
      <option value="HCD基礎検定トレ">HCD基礎検定トレ</option>
      <option value="社労士トレ">社労士トレ</option>
      <option value="歯科衛生士国試トレ">歯科衛生士国試トレ</option>
      <option value="FPトレ">FPトレ</option>
      <option value="管理栄養士国試トレ">管理栄養士国試トレ</option>
      <option value="宅建トレ">宅建トレ</option>
      <option value="いずれでもない・分からない">いずれでもない・分からない</option>
    </select>
  </p>

  <p class="contact-field">
    <label for="contact-message">お問い合わせ内容（必須・2000文字まで）</label>
    <textarea id="contact-message" name="message" rows="8" maxlength="2000" required aria-describedby="contact-message-help"></textarea>
    <span id="contact-message-help" class="contact-help">氏名・住所・電話番号など、返信に不要な個人情報は入力しないでください。</span>
  </p>

  <p class="contact-field">
    <label for="contact-email">返信用メールアドレス（任意）</label>
    <input type="email" id="contact-email" name="email" autocomplete="email" aria-describedby="contact-email-help">
    <span id="contact-email-help" class="contact-help">返信が必要な場合のみご入力ください。未入力の場合は返信できません。</span>
  </p>

  <p class="contact-hp" aria-hidden="true">
    <label for="contact-company">この欄は入力しないでください</label>
    <input type="text" id="contact-company" name="company" tabindex="-1" autocomplete="off">
  </p>

  <input type="hidden" name="ts" id="contact-ts" value="">

  <p><button type="submit" id="contact-submit">送信する</button></p>

  <p id="contact-status" class="contact-status" role="status" aria-live="polite"></p>
</form>

<noscript>
  <p>お使いの環境ではフォームをご利用いただけません。下記のメールアドレスまでご連絡ください。</p>
</noscript>

<style>
.contact-form .contact-field { margin-bottom: 1.2em; }
.contact-form label { display: block; font-weight: bold; margin-bottom: 0.3em; }
.contact-form select,
.contact-form input[type="email"],
.contact-form textarea {
  width: 100%;
  max-width: 34em;
  box-sizing: border-box;
  padding: 0.4em;
  font: inherit;
  border: 1px solid #ccc;
  border-radius: 3px;
  background-color: #fff;
  color: #393939;
}
.contact-form textarea { resize: vertical; }
.contact-form .contact-help { display: block; font-size: 0.85em; color: #6d6d6d; margin-top: 0.3em; }
.contact-form .contact-hp { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
.contact-form button { font: inherit; padding: 0.5em 1.4em; cursor: pointer; }
.contact-form .contact-status:empty { display: none; }
.contact-form .contact-status { padding: 0.6em 0.8em; border-left: 4px solid #ccc; background-color: #f6f6f6; }
.contact-form .contact-status.is-error { border-left-color: #b94a48; }
.contact-form .contact-status.is-success { border-left-color: #3a7d44; }
</style>

<script>
(function () {
  var form = document.getElementById('contact-form');
  if (!form) { return; }
  var endpoint = {{ contact_endpoint | jsonify }};
  var status = document.getElementById('contact-status');
  var submit = document.getElementById('contact-submit');
  var loadedAt = Date.now();
  document.getElementById('contact-ts').value = String(loadedAt);

  function setStatus(text, kind) {
    status.textContent = text;
    status.className = 'contact-status' + (kind ? ' is-' + kind : '');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (document.getElementById('contact-company').value !== '') { return; }
    if (Date.now() - loadedAt < 3000) {
      setStatus('送信が早すぎます。数秒おいてからもう一度お試しください。', 'error');
      return;
    }

    var message = document.getElementById('contact-message').value.trim();
    if (message === '') {
      setStatus('お問い合わせ内容を入力してください。', 'error');
      document.getElementById('contact-message').focus();
      return;
    }
    if (message.length > 2000) {
      setStatus('お問い合わせ内容は2000文字以内で入力してください。', 'error');
      document.getElementById('contact-message').focus();
      return;
    }

    var email = document.getElementById('contact-email').value.trim();
    if (email !== '' && email.indexOf('@') === -1) {
      setStatus('返信用メールアドレスの形式をご確認ください。', 'error');
      document.getElementById('contact-email').focus();
      return;
    }

    var body = new URLSearchParams();
    body.append('type', document.getElementById('contact-type').value);
    body.append('app', document.getElementById('contact-app').value);
    body.append('message', message);
    body.append('email', email);
    body.append('ts', document.getElementById('contact-ts').value);

    submit.disabled = true;
    setStatus('送信中です。しばらくお待ちください。');

    fetch(endpoint, { method: 'POST', body: body })
      .then(function (response) { return response.json(); })
      .then(function (result) {
        if (result && result.ok) {
          form.reset();
          setStatus('送信しました。内容を確認のうえ、返信が必要な場合はご記入のメールアドレスへご連絡します。', 'success');
        } else {
          setStatus('送信できませんでした。お手数ですが、下記のメールアドレスへご連絡ください。', 'error');
          submit.disabled = false;
        }
      })
      .catch(function () {
        setStatus('送信できませんでした。お手数ですが、下記のメールアドレスへご連絡ください。', 'error');
        submit.disabled = false;
      });
  });
})();
</script>
{% endif %}

## メールでのお問い合わせ

フォームをご利用いただけない場合や、フォームの送信に失敗した場合は、以下のメールアドレスまでご連絡ください。アプリ名・端末機種・OSバージョンを添えていただけると、対応がスムーズです。

- 連絡先メールアドレス: ekusiek716@gmail.com

## 返信について

個人で開発・運営しているため、返信までにお時間をいただく場合があります。また、内容によっては返信できないことがあります。返信をご希望の場合は、返信用メールアドレスのご記入をお願いします。

いただいた内容の取り扱いについては、[プライバシーポリシー](./privacy)をご確認ください。

## 関連ページ

- [サポート（FAQ）](./)
- [プライバシーポリシー](./privacy)
- [利用規約](./terms)
- [特定商取引法に基づく表記](./tokushoho)
