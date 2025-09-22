# HTML Playground

HTML やブラウザの基礎的な機能を学習するためのサンプル集です。

## サンプル一覧

### 📊 IndexedDB サンプル
ブラウザ内蔵のデータベース IndexedDB を使用したCRUD操作のサンプル
- データベース初期化・管理
- サンプルデータ生成
- 検索機能（名前による絞り込み）
- 個別削除・全件削除
- TTL（有効期限）機能

### 💾 Web Storage サンプル
Local Storage と Session Storage を使用したデータ保存のサンプル
- データ保存・取得・削除
- JSONデータ処理
- ストレージ情報表示
- リアルタイム更新
- 永続的ストレージとセッション限定ストレージの違い

### ⚡ Web Workers サンプル
メインUIスレッドとは別のバックグラウンドスレッドでJavaScriptを実行するサンプル
- 基本的なWorker操作（開始・停止・メッセージ送受信）
- 重い計算処理のバックグラウンド実行
- 複数Workerの並列処理
- エラーハンドリング
- UI応答性の確認

### 🔧 Service Workers サンプル
ウェブアプリケーションとネットワークの間でプロキシとして動作するサンプル
- Service Worker登録・解除・更新
- キャッシュ操作（追加・削除・管理）
- ネットワークリクエストのインターセプト
- オフライン対応
- プッシュ通知機能

## 開発環境

### 必要な環境
- Node.js 18.0.0 以上（推奨: 24.x）
- npm または yarn

### 依存関係のインストール

```bash
npm install
```

### ローカルサーバーの起動

```bash
npm run serve
```

ブラウザで `http://localhost:8080` にアクセスしてサンプルを確認できます。

## テスト

### E2Eテストについて
このプロジェクトでは Playwright を使用した包括的なE2Eテストスイートを提供しています。

#### ブラウザのインストール
初回実行時のみ、Playwrightのブラウザをインストールしてください：

```bash
npm run install-browsers
```

#### テスト実行

##### 全てのテストを実行
```bash
npm test
```

##### Web Workers のテストのみ実行
```bash
npm run test:webworkers
```

##### Service Workers のテストのみ実行
```bash
npm run test:serviceworkers
```

##### ヘッド付きモードでテスト実行（ブラウザが表示される）
```bash
npm run test:headed
```

##### デバッグモードでテスト実行
```bash
npm run test:debug
```

### Podman/Docker環境でのテスト実行

ローカル環境の影響を受けずに安定したテストを実行するため、Podman環境でのテスト実行もサポートしています。

#### 前提条件
- Podmanがインストールされていること

#### 実行方法

##### 全てのテストをPodman環境で実行
```bash
npm run test:podman
# または直接実行
./scripts/test-podman.sh
```

##### イメージを再ビルドしてテスト実行
```bash
./scripts/test-podman.sh --build
```

##### 特定のテストファイルのみ実行
```bash
./scripts/test-podman.sh --file tests/index.spec.js
```

#### 利点
- ローカル環境に依存しない安定したテスト実行
- クリーンな環境での検証
- CI/CD環境との一貫性

#### テスト実行の流れ

1. **前提条件の確認**
   ```bash
   # Node.js 24以上がインストールされていることを確認
   node --version
   
   # 依存関係のインストール
   npm install
   
   # Playwrightブラウザのインストール（初回のみ）
   npm run install-browsers
   ```

2. **基本的なテスト実行**
   ```bash
   # 全テストを実行（推奨）
   npm test
   
   # 特定のテストファイルのみ実行
   npx playwright test tests/indexeddb.spec.js
   npx playwright test tests/storage.spec.js
   ```

3. **デバッグとトラブルシューティング**
   ```bash
   # ブラウザを表示してテスト実行
   npm run test:headed
   
   # デバッグモードで実行（ステップ実行可能）
   npm run test:debug
   ```

4. **コンテナ環境でのテスト実行**
   ```bash
   # Podman環境で全テスト実行
   npm run test:podman
   
   # 特定のテストファイルのみコンテナで実行
   ./scripts/test-podman.sh --file tests/indexeddb.spec.js
   ```

#### テスト内容

##### メインページテスト（8テストケース）
- ページタイトルと構造の確認
- 各サンプルページへのナビゲーション
- レスポンシブデザインの動作確認
- リンクの正常性確認

##### IndexedDB サンプルテスト（21テストケース）
- ページの正常読み込み
- データベース初期化・削除
- CRUD操作（作成・読み取り・更新・削除）
- サンプルデータ生成
- 検索機能（名前による絞り込み）
- TTL（有効期限）機能
- 期限切れデータの自動削除
- エラーハンドリング
- フォーム入力validation

##### Web Storage サンプルテスト（16テストケース）
- ページの正常読み込み
- Local Storage の基本操作
- Session Storage の基本操作
- JSONデータの保存・取得
- データ削除機能
- ストレージ情報表示
- エラーハンドリング
- ストレージの違いの確認

##### Web Workers テスト（11テストケース）
- ページの正常読み込み
- ブラウザサポート確認
- 基本的なWorker操作
- 重い計算処理（メインスレッド vs Worker比較）
- 並列Worker処理
- エラーハンドリング
- 無効データ送信時の処理
- UI応答性確認
- 複数Workerの独立動作
- 進捗表示機能
- ページ離脱時のクリーンアップ

##### Service Workers テスト（16テストケース）
- ページの正常読み込み
- ブラウザサポート確認
- Service Worker の登録・解除・更新
- キャッシュの追加・削除・管理
- ネットワークリクエスト
- オフライン状態シミュレーション
- 通知許可要求
- キャッシュサイズ表示
- 全キャッシュ削除
- デバッグ情報表示
- 複数リクエスト方法
- HTTPS警告表示
- 状態確認機能
- 全データ削除

**合計72テストケース**で全HTMLページの機能を包括的にカバーしています。

## 技術スタック

### フロントエンド
- **HTML5**: セマンティックなマークアップ
- **CSS3**: レスポンシブデザイン、Grid/Flexbox レイアウト
- **Vanilla JavaScript**: フレームワークを使わない純粋なJavaScript

### ブラウザAPI
- **IndexedDB**: クライアントサイドデータベース
- **Web Storage**: Local Storage / Session Storage
- **Web Workers**: バックグラウンドスレッド処理
- **Service Workers**: ネットワークプロキシ、PWA機能
- **Notifications API**: プッシュ通知
- **Cache API**: リソースキャッシュ管理

### テスト・開発ツール
- **Node.js 24**: JavaScript実行環境
- **Playwright**: E2Eテストフレームワーク
- **http-server**: 開発用HTTPサーバー
- **mise**: ランタイムバージョン管理

## ディレクトリ構成

```
my-html-playground/
├── dist/                      # 公開ファイル
│   ├── css/                  # スタイルシート
│   │   ├── index.css
│   │   ├── style.css
│   │   ├── storage-style.css
│   │   ├── webworkers-style.css
│   │   └── serviceworkers-style.css
│   ├── js/                   # Web Workers スクリプト
│   │   ├── basic-worker.js
│   │   ├── calculation-worker.js
│   │   ├── parallel-worker.js
│   │   └── error-worker.js
│   ├── index.html            # メインページ
│   ├── indexeddb-sample.html # IndexedDB サンプル
│   ├── storage-sample.html   # Web Storage サンプル
│   ├── webworkers-sample.html # Web Workers サンプル
│   ├── serviceworkers-sample.html # Service Workers サンプル
│   └── sw.js                 # Service Worker スクリプト
├── tests/                    # E2Eテスト
│   ├── webworkers.spec.js
│   └── serviceworkers.spec.js
├── CLAUDE.md                 # 開発ガイドライン
├── package.json              # npm設定・依存関係
├── playwright.config.js      # Playwrightテスト設定
└── README.md                 # このファイル
```

## GitHub Pages 対応

このプロジェクトは GitHub Pages での公開に対応しています。全てのパスが相対パスで設定されているため、サブディレクトリでの公開でも正常に動作します。

### デプロイ方法
1. GitHub リポジトリにプッシュ
2. GitHub Pages を有効化
3. `dist/` ディレクトリを公開ディレクトリに設定

## ブラウザサポート

### 対応ブラウザ
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

### 機能別サポート
- **IndexedDB**: 全モダンブラウザ対応
- **Web Storage**: 全モダンブラウザ対応
- **Web Workers**: 全モダンブラウザ対応
- **Service Workers**: HTTPS必須、全モダンブラウザ対応
- **Notifications API**: ユーザー許可必須

## ライセンス

MIT License

## 貢献

Issue や Pull Request を歓迎します。開発時は `CLAUDE.md` の規約に従ってください。