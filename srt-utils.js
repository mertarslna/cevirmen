/**
 * srt-utils.js
 * SRT Çevirmen & Karşılaştırıcı — Ortak Yardımcı Fonksiyonlar
 *
 * Bu dosya tüm sayfalarda (index.html, compare.html, extractor.html) paylaşılan
 * saf (yan etkisiz) utility fonksiyonlarını içerir.
 * storage.js'den SONRA, diğer sayfa scriptlerinden ÖNCE yüklenmelidir.
 */

// ── TIRNAK & KARAKTER TEMİZLEME ───────────────────────────────────────────

/**
 * Tipografik/akıllı tırnak ve benzer Unicode karakterleri standart ASCII
 * karşılıklarına çevirir.
 * @param {string} text
 * @returns {string}
 */
function cleanQuotes(text) {
    if (!text) return text;
    return text
        .replace(/[''´`′＇՚ʻʼʽ‛]/g, "'")
        .replace(/[""„‟＂]/g, '"')
        .replace(/[？⸮]/g, '?')
        .replace(/[！﹗]/g, '!')
        .replace(/…/g, '...');
}

// ── SRT ZAMAN DAMGASI ─────────────────────────────────────────────────────

/**
 * SRT zaman damgası dizisini milisaniyeye çevirir.
 * Hem "HH:MM:SS,mmm --> ..." hem de tek timestamp formatlarını destekler.
 * @param {string} timeStr  — Örn: "00:01:23,456 --> 00:01:25,789"
 * @returns {number} Milisaniye cinsinden başlangıç zamanı
 */
function srtTimeToMs(timeStr) {
    const start = (timeStr || '').split('-->')[0].trim();
    const m = start.match(/^(\d+):(\d+):(\d+)[,.](\d+)/);
    if (!m) return 0;
    return (+m[1]) * 3600000 + (+m[2]) * 60000 + (+m[3]) * 1000 + (+m[4]);
}

/**
 * Altyazı dizisini başlangıç zamanına göre yerinde (in-place) sıralar ve
 * index'leri 1'den başlayarak günceller.
 * Her iki altyazı formatını destekler:
 *   - { time: "..." }    (index.html / extractor.html formatı)
 *   - { rawTime: "..." } (compare.html formatı)
 * @param {Array} subs
 * @returns {Array} Sıralanmış dizi (aynı referans)
 */
function sortSubsByTime(subs) {
    subs.sort(function (a, b) {
        const aTime = a.rawTime !== undefined ? a.rawTime : a.time;
        const bTime = b.rawTime !== undefined ? b.rawTime : b.time;
        return srtTimeToMs(aTime) - srtTimeToMs(bTime);
    });
    subs.forEach(function (s, i) { s.index = i + 1; });
    return subs;
}

// ── XSS KORUMASI ──────────────────────────────────────────────────────────

/**
 * Bir metni HTML içeriğine güvenli biçimde yerleştirmek için encode eder.
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Bir metni HTML attribute değeri olarak güvenli biçimde yerleştirmek için encode eder.
 * @param {string} str
 * @returns {string}
 */
function escapeAttr(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;');
}
