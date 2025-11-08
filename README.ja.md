# chromite — Chrome 拡張メッセージング用ルーティングキット

Chromite は Chrome 拡張のメッセージングを、ルータ・クライアント・ロガーと
いった馴染みのあるプリミティブで整理できるようにするライブラリです。同じ
`onMessage` リスナーにコードを詰め込む代わりに、パスベースでコントローラを
切り出し、共通のクライアントやロガーを共有できます。

## 特長

- パスパターンとコントローラで拡張メッセージをルーティング。
- クライアント抽象化で構造化メッセージを安全に送信。
- 名前空間付きロガーで `console` 出力を装飾。
- TypeScript 型と最新ビルド成果物を同梱。

## インストール

```bash
npm install chromite
# or
yarn add chromite
```

Chromite は Manifest V3 をターゲットにしており、TypeScript との併用を推奨し
ます。

## クイックスタート

```ts
import { Router, Client, Logger, LogLevel } from "chromite";

const router = new Router();

router.on("/users/list", async () => {
  return { users: await Users.getAll() };
});

router.on("/users/{id}", async function () {
  const user = await Users.get(this.id);
  return { user };
});

router.onNotFound(() => ({ message: "Not found" }));

chrome.runtime.onMessage.addListener(router.listener());

const client = new Client(chrome.runtime);
const logger = Logger.get("chromite-demo", { level: LogLevel.INFO });

const users = await client.send("/users/list");
logger.info("Loaded users", users);
```

### Logger の使い方

```ts
// プロジェクト名ごとに同じロガーを使い回す
const logger = Logger.get("popup");

// すべてのロガーで閾値を上げる
Logger.setLevel(LogLevel.DEBUG);

// 絵文字とスタイルを共有設定で上書き
Logger.setEmoji(true, {
  [LogLevel.INFO]: "✨"
});
Logger.setStyle(true, {
  [LogLevel.ERROR]: "color:white; background-color:#d93025; font-weight:bold;"
});

logger.error("Failed to fetch", { status: 500 });
```

## コアコンセプト

- **Router**: パスを解析し、パラメータを解決してからコントローラへ委譲。
- **Client**: `chrome.runtime.sendMessage` を Promise ベースで安全に呼び出し。
- **Logger**: 名前空間とレベル付きで `console` 出力を整形。

## 開発フロー

- `npm run clean` — ビルド成果物を削除。
- `npm run build` — TypeScript をコンパイルして宣言ファイルを出力。
- `npm run lint` — `standard-with-typescript` による ESLint を実行。
- `npm run test` — Jest のユニットテストを実行。
- `npm run test:e2e` — デモ拡張を再ビルドし Puppeteer E2E を起動。

## コントリビュート

Chromite は日本語の Conventional Commits を採用し、レビュープロセスは
`AGENTS.md` にまとめています。PR 前には lint / test / test:e2e を実行し、結果
ログを添付してください。設定ファイルを更新した場合は変更点を PR 本文に記載
し、ドキュメントの整合性も確認してください。

## ライセンス

MIT © otiai10
