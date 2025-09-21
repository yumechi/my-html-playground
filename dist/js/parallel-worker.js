// 並列処理用Workerスクリプト
// 複数のWorkerインスタンスで並列実行される

self.onmessage = function(e) {
    const { workerId, taskCount, startValue } = e.data;

    if (typeof workerId !== 'number' || typeof taskCount !== 'number' || typeof startValue !== 'number') {
        self.postMessage({
            type: 'error',
            workerId: workerId || 0,
            data: { message: '無効なパラメータです' }
        });
        return;
    }

    console.log(`並列Worker ${workerId} 開始: ${startValue} から ${taskCount} 個のタスクを処理`);

    let result = 0;
    const endValue = startValue + taskCount;

    // 各Workerで異なる計算を実行
    for (let i = startValue; i < endValue; i++) {
        // Worker IDに基づいて異なる計算を実行
        switch (workerId % 4) {
            case 0:
                // 平方根の合計
                result += Math.sqrt(i + 1);
                break;
            case 1:
                // 立方根の合計
                result += Math.cbrt(i + 1);
                break;
            case 2:
                // 対数の合計
                result += Math.log(i + 1);
                break;
            case 3:
                // 三角関数の合計
                result += Math.sin(i) + Math.cos(i);
                break;
        }

        // より重い処理をシミュレート
        if (i % 1000 === 0) {
            // 素数チェック
            isPrimeOptimized(i);
        }

        // 進捗報告（少ない頻度で）
        if (i % Math.floor(taskCount / 10) === 0) {
            self.postMessage({
                type: 'progress',
                workerId: workerId,
                data: {
                    current: i - startValue,
                    total: taskCount,
                    percentage: ((i - startValue) / taskCount) * 100
                }
            });
        }
    }

    // 結果を送信
    self.postMessage({
        type: 'result',
        workerId: workerId,
        data: {
            result: result,
            taskCount: taskCount,
            startValue: startValue,
            endValue: endValue,
            completedAt: Date.now()
        }
    });

    console.log(`並列Worker ${workerId} 完了: 結果 ${result.toFixed(2)}`);
};

// 最適化された素数判定
function isPrimeOptimized(num) {
    if (num <= 1) return false;
    if (num === 2) return true;
    if (num % 2 === 0) return false;

    const sqrt = Math.sqrt(num);
    for (let i = 3; i <= sqrt; i += 2) {
        if (num % i === 0) return false;
    }
    return true;
}

// ユークリッドの互除法による最大公約数
function gcd(a, b) {
    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

// 階乗計算（小さい数値のみ）
function factorial(n) {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// エラーハンドリング
self.onerror = function(error) {
    console.error('並列Worker内でエラーが発生:', error);
    self.postMessage({
        type: 'error',
        workerId: -1,
        data: { message: error.message, filename: error.filename, lineno: error.lineno }
    });
};

console.log('並列Worker が初期化されました');