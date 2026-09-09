/**
 * sidebar.js
 * SRT Çevirmen & Karşılaştırıcı — Ortak Sidebar & Dosya Ağacı Fonksiyonları
 *
 * Bu dosya tüm sayfalarda yinelenen sidebar toggle/resize, dosya ağacı kurma
 * ve dosya yükleme yardımcı fonksiyonlarını içerir.
 *
 * Bağımlılıklar:
 *   - srt-utils.js (cleanQuotes, escapeHTML vb. bu dosyadan önce yüklenmeli)
 *   - Her sayfanın global `sidebarOpen` değişkeni
 *   - Her sayfanın global `fileStore` değişkeni
 *   - Her sayfanın global `loadFilesWithPaths()` fonksiyonu
 *   - Her sayfanın global `collapsedFolders` Set değişkeni
 *
 * Kullanım:
 *   DOMContentLoaded içinde `initSidebarResizer()` çağrılmalıdır.
 *   Sidebar ilk genişliği için sayfa içindeki inline IIFE korunmalıdır
 *   (layout flash'ı önlemek amacıyla DOM oluşturulur oluşturulmaz çalışır).
 */

// ── SIDEBAR DURUM DEĞİŞKENLERİ ────────────────────────────────────────────

/** Sidebar'ın mevcut genişliği (px veya rem string). localStorage'dan başlatılır. */
let currentSidebarWidth = localStorage.getItem('sidebarWidth') || '22rem';

/** Sidebar sürükle-boyutlandırma işlemi devam ediyor mu? */
let isResizing = false;

// ── SIDEBAR TOGGLE ─────────────────────────────────────────────────────────

/**
 * Sidebar'ı aç veya kapat.
 * Global `sidebarOpen` değişkenini okur ve günceller.
 */
function toggleSidebar() {
    const sb = document.getElementById('file-sidebar');
    const resizer = document.getElementById('sidebar-resizer');

    // Sadece toggle animasyonu için geçişi etkinleştir
    sb.classList.add('sidebar-transition');

    sidebarOpen = !sidebarOpen;
    localStorage.setItem('sidebarOpen', sidebarOpen);

    if (sidebarOpen) {
        sb.classList.remove('sidebar-collapsed');
        resizer.classList.remove('hidden');
        sb.style.width = currentSidebarWidth;
    } else {
        currentSidebarWidth = sb.style.width || '22rem';
        sb.classList.add('sidebar-collapsed');
        resizer.classList.add('hidden');
    }

    // Animasyon bittikten sonra geçişi temizle; boyutlandırma anında olsun
    setTimeout(() => {
        sb.classList.remove('sidebar-transition');
    }, 300);
}

// ── SIDEBAR YENİDEN BOYUTLANDIRMA ─────────────────────────────────────────

/**
 * Sidebar sürükle-bırak boyutlandırma event listener'larını bağlar.
 * DOMContentLoaded içinde bir kez çağrılmalıdır.
 */
function initSidebarResizer() {
    const resizer = document.getElementById('sidebar-resizer');
    const sidebar = document.getElementById('file-sidebar');
    if (!resizer || !sidebar) return;

    resizer.addEventListener('mousedown', () => {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
        document.body.classList.add('select-none'); // Metin seçimini engelle
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        // Fare X konumundan sidebar'ın sol kenarını çıkar
        const sidebarRect = sidebar.getBoundingClientRect();
        let newWidth = e.clientX - sidebarRect.left;

        // Min / max kısıtlamaları
        if (newWidth < 150) newWidth = 150;
        if (newWidth > 600) newWidth = 600;

        sidebar.style.width = newWidth + 'px';
        currentSidebarWidth = newWidth + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
            document.body.classList.remove('select-none');
            localStorage.setItem('sidebarWidth', currentSidebarWidth);
        }
    });
}

// ── DOSYA AĞACI ───────────────────────────────────────────────────────────

/**
 * Global `fileStore` nesnesinden iç içe klasör ağacı nesnesi oluşturur.
 * Sonuç `renderFileList` tarafından `sortTree` ile birlikte kullanılır.
 * @returns {Object} Kök ağaç düğümü
 */
function buildFileTree() {
    const root = { name: '', fullPath: '', type: 'folder', children: {} };
    Object.keys(fileStore).forEach(key => {
        const entry = fileStore[key];
        const parts = key.split('/');
        let current = root;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isFile = (i === parts.length - 1);
            const currentPath = current.fullPath ? current.fullPath + '/' + part : part;
            if (isFile) {
                current.children[part] = {
                    name: part,
                    fullPath: key,
                    type: 'file',
                    key: key,
                    subtitlesCount: entry.subtitles ? entry.subtitles.length : 0
                };
            } else {
                if (!current.children[part]) {
                    current.children[part] = { name: part, fullPath: currentPath, type: 'folder', children: {} };
                }
                current = current.children[part];
            }
        }
    });
    return root;
}

/**
 * Ağaç düğümünü özyinelemeli olarak sıralar: klasörler önce, ardından dosyalar;
 * her iki grup Türkçe'ye duyarlı doğal sıralama ile.
 * @param {Object} node  — buildFileTree() çıktısı
 * @returns {Array} Sıralanmış çocuk düğümler
 */
function sortTree(node) {
    if (node.type !== 'folder' || !node.children) return [];
    const keys = Object.keys(node.children);
    const list = keys.map(k => {
        const child = node.children[k];
        if (child.type === 'folder') child.sortedChildren = sortTree(child);
        return child;
    });
    list.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name, 'tr', { numeric: true, sensitivity: 'base' });
    });
    return list;
}

// ── DOSYA YÜKLEME YARDIMCILARI ────────────────────────────────────────────

/**
 * Sürükle-bırak ile gelen FileSystemEntry listesini özyinelemeli olarak tarar;
 * bulunan .srt dosyalarını `fileObjs` dizisine ekler.
 * @param {FileSystemEntry[]} entries
 * @param {{ file: File, path: string }[]} fileObjs  — Sonuç biriktirilir
 */
async function readEntriesRecursively(entries, fileObjs) {
    for (const entry of entries) {
        if (entry.isFile && entry.name.endsWith('.srt')) {
            await new Promise((resolve) => {
                entry.file(f => {
                    const relPath = entry.fullPath.startsWith('/')
                        ? entry.fullPath.substring(1)
                        : entry.fullPath;
                    fileObjs.push({ file: f, path: relPath });
                    resolve();
                });
            });
        } else if (entry.isDirectory) {
            const dirReader = entry.createReader();
            const childEntries = await readAllDirectoryEntries(dirReader);
            await readEntriesRecursively(childEntries, fileObjs);
        }
    }
}

/**
 * `readEntries` API'si batch halinde döndürdüğünden, boş sonuç gelene kadar
 * tüm kayıtları biriktirir.
 * @param {FileSystemDirectoryReader} dirReader
 * @returns {Promise<FileSystemEntry[]>}
 */
function readAllDirectoryEntries(dirReader) {
    return new Promise((resolve) => {
        let entries = [];
        function readBatch() {
            dirReader.readEntries((results) => {
                if (!results.length) {
                    resolve(entries);
                } else {
                    entries = entries.concat(Array.from(results));
                    readBatch();
                }
            }, () => resolve(entries));
        }
        readBatch();
    });
}

/**
 * <input type="file"> onchange olayını işler.
 * Her sayfanın kendi global `loadFilesWithPaths()` fonksiyonunu çağırır.
 * @param {Event} event
 */
function handleFilesFromInput(event) {
    const rawFiles = [...event.target.files].filter(f => f.name.endsWith('.srt'));
    if (!rawFiles.length) return;
    const fileObjs = rawFiles.map(f => ({
        file: f,
        path: f.webkitRelativePath || f.name
    }));
    loadFilesWithPaths(fileObjs);
    event.target.value = '';
}
