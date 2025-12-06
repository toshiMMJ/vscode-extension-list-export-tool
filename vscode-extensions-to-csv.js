const fs = require("fs");
const path = require("path");
const os = require("os");

// VS Code の拡張機能ディレクトリ（共通）
const extDir = path.join(os.homedir(), ".vscode", "extensions");

// 除外リストを読み込む（第一引数で指定、なければ除外なし）
const excludeFile = process.argv[2];
const excludeNames = new Set(
    excludeFile && fs.existsSync(excludeFile)
        ? fs.readFileSync(excludeFile, "utf8").split("\n").map(s => s.trim()).filter(Boolean)
        : []
);

const items = fs.readdirSync(extDir).filter(item => item.includes("-"));

// LICENSEファイルからライセンス種別を推測する
function detectLicenseFromFile(extPath) {
    const licenseFiles = ["LICENSE", "LICENSE.txt", "LICENSE.md", "license", "license.txt", "license.md"];
    for (const name of licenseFiles) {
        const filePath = path.join(extPath, name);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, "utf8").toUpperCase();
            if (content.includes("MIT LICENSE") || content.includes("PERMISSION IS HEREBY GRANTED, FREE OF CHARGE")) return "MIT";
            if (content.includes("APACHE LICENSE") && content.includes("VERSION 2.0")) return "Apache-2.0";
            if (content.includes("BSD 3-CLAUSE") || content.includes("THREE-CLAUSE BSD")) return "BSD-3-Clause";
            if (content.includes("BSD 2-CLAUSE") || content.includes("TWO-CLAUSE BSD")) return "BSD-2-Clause";
            if (content.includes("GNU GENERAL PUBLIC LICENSE") && content.includes("VERSION 3")) return "GPL-3.0";
            if (content.includes("GNU GENERAL PUBLIC LICENSE") && content.includes("VERSION 2")) return "GPL-2.0";
            if (content.includes("GNU LESSER GENERAL PUBLIC LICENSE")) return "LGPL";
            if (content.includes("MOZILLA PUBLIC LICENSE")) return "MPL";
            if (content.includes("ISC LICENSE")) return "ISC";
            if (content.includes("UNLICENSE")) return "Unlicense";
        }
    }
    return "";
}

const results = items.map(dir => {
    const extPath = path.join(extDir, dir);
    const packageJsonPath = path.join(extPath, "package.json");
    if (!fs.existsSync(packageJsonPath)) return null;

    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    const id = pkg.publisher + "." + pkg.name;
    // displayNameがないか、%で始まる（未解決のローカライズキー）場合はidを使用
    const rawDisplayName = pkg.displayName;
    const displayName = (rawDisplayName && !rawDisplayName.startsWith("%")) ? rawDisplayName : id;

    // 除外リストに記載されているdisplayNameを除外
    if (excludeNames.has(displayName)) return null;

    // ライセンス取得（SEE LICENSE等の場合はLICENSEファイルから推測、判定できなければ空白）
    let license = pkg.license || "";
    if (!license || license.toUpperCase().includes("SEE ")) {
        license = detectLicenseFromFile(extPath);
    }

    return {
        displayName,
        id,
        version: pkg.version,
        license
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
console.log('"displayName","id","version","license"');

// CSVデータ出力（値をダブルクォートで囲み、内部のダブルクォートをエスケープ）
latestOnly.forEach(r => {
    const escape = (s) => '"' + String(s).replace(/"/g, '""') + '"';
    console.log(`${escape(r.displayName)},${escape(r.id)},${escape(r.version)},${escape(r.license)}`);
});