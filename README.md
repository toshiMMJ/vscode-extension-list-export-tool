# VS Code Extension List Export Tool

A script that exports installed VS Code extensions to CSV format.

## Usage

```bash
node vscode-extensions-to-csv.js
```

To save to a file:

```bash
node vscode-extensions-to-csv.js > extensions.csv
```

To exclude extensions listed in a file:

```bash
node vscode-extensions-to-csv.js exclude.txt > extensions.csv
```

## Output Format

Outputs the following columns in CSV format:

| Column | Description |
|------|------|
| displayName | Extension display name |
| id | Extension ID (publisher.name) |
| version | Version number |

## Example Output

```csv
"displayName","id","version"
"Japanese Language Pack for VS Code","ms-ceintl.vscode-language-pack-ja","1.85.0"
"ESLint","dbaeumer.vscode-eslint","2.4.2"
```

## Features

- Theme extensions are automatically excluded
- When multiple versions of the same extension exist, only the latest version is output
- Optionally exclude extensions by displayName using an exclude file (one name per line)
- If displayName is not available, extension ID is used as displayName

---

# 日本語

インストール済みの VS Code 拡張機能一覧を CSV 形式で出力するスクリプト。

## 使い方

```bash
node vscode-extensions-to-csv.js
```

ファイルに保存する場合:

```bash
node vscode-extensions-to-csv.js > extensions.csv
```

除外リストを指定する場合:

```bash
node vscode-extensions-to-csv.js exclude.txt > extensions.csv
```

## 出力形式

CSV 形式で以下の列を出力:

| 列名 | 説明 |
|------|------|
| displayName | 拡張機能の表示名 |
| id | 拡張機能ID（publisher.name） |
| version | バージョン番号 |

## 出力例

```csv
"displayName","id","version"
"Japanese Language Pack for VS Code","ms-ceintl.vscode-language-pack-ja","1.85.0"
"ESLint","dbaeumer.vscode-eslint","2.4.2"
```

## 機能

- テーマ拡張機能は自動的に除外
- 同じ拡張機能の複数バージョンがある場合、最新バージョンのみ出力
- 除外ファイルを指定して、displayName で拡張機能を除外可能（1行に1つ）
- displayName が取得できない場合は拡張機能ID を displayName として使用
