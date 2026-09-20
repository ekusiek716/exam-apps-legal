/**
 * サポートページのお問い合わせフォーム受信用 Google Apps Script。
 *
 * スプレッドシートに紐づくスクリプト（拡張機能 > Apps Script）として貼り付け、
 * ウェブアプリとしてデプロイする。設定手順は docs/contact-form-setup.md を参照。
 *
 * 受け取るフォーム項目（support.md の name 属性と一致させること）:
 *   type    用件の種別
 *   app     対象アプリ
 *   message お問い合わせ内容（必須）
 *   email   返信用メールアドレス（任意）
 *   ts      フォーム表示時刻（ミリ秒。ボット判定に使用）
 */

/** スプレッドシート内のシート名。存在しなければ自動作成する。 */
var SHEET_NAME = 'contact';

/** 保存する最大文字数。超えた分は切り詰める。 */
var MAX_LENGTH = {
  type: 50,
  app: 50,
  message: 2000,
  email: 200
};

/** フォーム表示から送信までがこの秒数未満なら破棄する。 */
var MIN_ELAPSED_SECONDS = 3;

var HEADERS = ['受信日時', '種別', '対象アプリ', '本文', '返信先メール'];

function doPost(e) {
  try {
    var params = (e && e.parameter) || {};

    // ハニーポット。人間が触らない項目に入力があれば黙って成功を返す。
    if (trim_(params.company) !== '') {
      return json_({ ok: true });
    }

    var message = clamp_(params.message, MAX_LENGTH.message);
    if (message === '') {
      return json_({ ok: false, error: 'empty_message' });
    }

    var ts = Number(params.ts);
    if (ts && isFinite(ts)) {
      var elapsed = (Date.now() - ts) / 1000;
      if (elapsed < MIN_ELAPSED_SECONDS) {
        return json_({ ok: false, error: 'too_fast' });
      }
    }

    var email = clamp_(params.email, MAX_LENGTH.email);
    if (email !== '' && email.indexOf('@') === -1) {
      email = '';
    }

    var sheet = getSheet_();
    // 想定外の項目は読まない（既知のキーだけを順に書き込む）。
    sheet.appendRow([
      new Date(),
      clamp_(params.type, MAX_LENGTH.type),
      clamp_(params.app, MAX_LENGTH.app),
      message,
      email
    ]);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: 'server_error' });
  }
}

/** 動作確認用。ブラウザで /exec を開くと JSON が返る。 */
function doGet() {
  return json_({ ok: true, status: 'ready' });
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function trim_(value) {
  return value === undefined || value === null ? '' : String(value).trim();
}

function clamp_(value, max) {
  var text = trim_(value);
  if (text.length > max) {
    text = text.slice(0, max);
  }
  return neutralizeFormula_(text);
}

/**
 * スプレッドシートでは `=` `+` `-` `@` で始まる文字列が数式として評価される。
 * 送信内容は外部からの入力なので、先頭にシングルクォートを付けて
 * 必ず文字列として扱わせる（表示上はシングルクォートは出ない）。
 */
function neutralizeFormula_(text) {
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

/**
 * ContentService は独自ヘッダを設定できないため、CORS は Apps Script 側の
 * 既定の応答に任せる。フォーム側は Content-Type を
 * application/x-www-form-urlencoded（単純リクエスト）で送り、
 * プリフライト（OPTIONS）が発生しないようにしている。
 */
function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
