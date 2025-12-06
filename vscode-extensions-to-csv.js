const fs = require("fs");
const path = require("path");
const os = require("os");

// VS Code の拡張機能ディレクトリ（共通）
const extDir = path.join(os.homedir(), ".vscode", "extensions");

const items = fs.readdirSync(extDir).filter(item => item.includes("-"));

const results = items.map(dir => {
    const packageJsonPath = path.join(extDir, dir, "package.json");
    if (!fs.existsSync(packageJsonPath)) return null;

    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    // テーマを除外
    const categories = pkg.categories || [];
    if (categories.includes("Themes")) return null;

    return {
        displayName: pkg.displayName || "(no displayName)",
        id: pkg.publisher + "." + pkg.name,
        version: pkg.version
    };
}).filter(Boolean);

// 同じIDの拡張機能は最新バージョンのみ残す
const latestOnly = Object.values(
    results.reduce((acc, ext) => {
        const existing = acc[ext.id];
        if (!existing || compareVersions(ext.version, existing.version) > 0) {
            acc[ext.id] = ext;
        }
        return acc;
    }, {})
);

// バージョン比較関数（semver形式対応）
function compareVersions(a, b) {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const na = pa[i] || 0;
        const nb = pb[i] || 0;
        if (na > nb) return 1;
        if (na < nb) return -1;
    }
    return 0;
}

// CSVヘッダー出力
console.log('"displayName","id","version"');

// CSVデータ出力（値をダブルクォートで囲み、内部のダブルクォートをエスケープ）
latestOnly.forEach(r => {
    const escape = (s) => '"' + String(s).replace(/"/g, '""') + '"';
    console.log(`${escape(r.displayName)},${escape(r.id)},${escape(r.version)}`);
});