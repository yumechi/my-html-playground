// 基本的なWorkerスクリプト
// メインスレッドからのメッセージを受信して応答する

self.onmessage = function(e) {
    const message = e.data;

    // 受信したメッセージを処理
    if (typeof message === 'string') {
        // 簡単な文字列処理
        const response = `Workerからの応答: "${message}" を受信しました (処理時刻: ${new Date().toLocaleTimeString('ja-JP')})`;

        // 少し処理時間をシミュレート
        setTimeout(() => {
            self.postMessage(response);
        }, 500);

    } else if (typeof message === 'object' && message !== null) {
        // オブジェクトの場合の処理
        const response = {
            original: message,
            processed: true,
            timestamp: Date.now(),
            workerInfo: 'basic-worker.js'
        };

        self.postMessage(JSON.stringify(response, null, 2));

    } else {
        // その他のデータ型
        self.postMessage(`受信したデータ型: ${typeof message}, 値: ${message}`);
    }
};

// エラーハンドリング
self.onerror = function(error) {
    console.error('Worker内でエラーが発生:', error);
};

// Worker開始時のログ
console.log('Basic Worker が開始されました');

// 定期的にハートビートを送信（オプション）
let heartbeatInterval = setInterval(() => {
    self.postMessage('🔄 Workerは正常に動作中です');
}, 10000);

// Workerが終了する前のクリーンアップ
self.addEventListener('beforeunload', function() {
    clearInterval(heartbeatInterval);
    console.log('Basic Worker が終了します');
});