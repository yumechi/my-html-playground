#!/bin/bash

# Podman環境でPlaywrightテストを実行するスクリプト

set -e

# カラー出力用の定数
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 関数: カラー出力
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 使用方法を表示
show_usage() {
    echo "使用方法: $0 [オプション]"
    echo ""
    echo "オプション:"
    echo "  --build      イメージを強制的に再ビルド"
    echo "  --headed     ヘッドありモードでテスト実行"
    echo "  --debug      デバッグモードでテスト実行"
    echo "  --file FILE  特定のテストファイルのみ実行"
    echo "  --help       このヘルプを表示"
    echo ""
    echo "例:"
    echo "  $0                              # 全テストを実行"
    echo "  $0 --build                      # イメージを再ビルドして全テストを実行"
    echo "  $0 --file tests/index.spec.js   # 特定のテストファイルのみ実行"
}

# デフォルト値
BUILD_FLAG=""
TEST_ARGS=""
IMAGE_NAME="html-playground-test"

# 引数を解析
while [[ $# -gt 0 ]]; do
    case $1 in
        --build)
            BUILD_FLAG="--no-cache"
            shift
            ;;
        --headed)
            TEST_ARGS="$TEST_ARGS --headed"
            shift
            ;;
        --debug)
            TEST_ARGS="$TEST_ARGS --debug"
            shift
            ;;
        --file)
            if [[ -n "$2" ]]; then
                TEST_ARGS="$TEST_ARGS $2"
                shift 2
            else
                print_error "--file オプションにはファイル名が必要です"
                exit 1
            fi
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            print_error "不明なオプション: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Podmanの存在確認
if ! command -v podman &> /dev/null; then
    print_error "Podmanがインストールされていません"
    exit 1
fi

print_info "Podman環境でPlaywrightテストを実行します..."

# Docker イメージをビルド
print_info "テスト用イメージをビルドしています..."
if podman build $BUILD_FLAG -f Dockerfile.test -t $IMAGE_NAME .; then
    print_success "イメージビルド完了"
else
    print_error "イメージビルドに失敗しました"
    exit 1
fi

# テスト結果格納用ディレクトリを作成
mkdir -p test-results
mkdir -p playwright-report

# コンテナでテストを実行
print_info "コンテナ内でテストを実行しています..."
echo "実行コマンド: podman run --rm -v \$(pwd)/test-results:/app/test-results -v \$(pwd)/playwright-report:/app/playwright-report $IMAGE_NAME $TEST_ARGS"

if podman run --rm \
    -v "$(pwd)/test-results:/app/test-results" \
    -v "$(pwd)/playwright-report:/app/playwright-report" \
    --security-opt seccomp=unconfined \
    --security-opt apparmor=unconfined \
    $IMAGE_NAME $TEST_ARGS; then
    print_success "テスト実行完了"
    
    # テスト結果の確認
    if [[ -f "test-results/results.json" ]]; then
        print_info "テスト結果ファイルが生成されました: test-results/results.json"
    fi
    
    if [[ -d "playwright-report" ]]; then
        print_info "HTMLレポートが生成されました: playwright-report/"
        print_info "レポートを確認するには: npx playwright show-report"
    fi
else
    print_error "テスト実行に失敗しました"
    exit 1
fi

print_success "Podman環境でのテスト実行が完了しました"