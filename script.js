// ============================================
// CONFIGURATION - All alpaca styles
// ============================================

const ASSETS_PATH = 'assets';

const STYLE_CONFIG = {
    background: {
        name: 'Background',
        icon: '🌅',
        folder: 'backgrounds',
        items: ['blue50', 'blue60', 'blue70', 'darkblue30', 'darkblue50', 'darkblue70',
                'green50', 'green60', 'green70', 'grey40', 'grey70', 'grey80',
                'red50', 'red60', 'red70', 'yellow50', 'yellow60', 'yellow70'],
        // Approximate colors for swatches (no preview image needed for flat backgrounds)
        swatches: {
            blue50: '#7ab5f5', blue60: '#5a9fe8', blue70: '#3a89db',
            darkblue30: '#a0b8d8', darkblue50: '#4a6ea8', darkblue70: '#2a4e88',
            green50: '#7acc7a', green60: '#5ab85a', green70: '#3aa43a',
            grey40: '#c0c0c0', grey70: '#8a8a8a', grey80: '#6a6a6a',
            red50: '#f07a7a', red60: '#e05a5a', red70: '#d03a3a',
            yellow50: '#f5d070', yellow60: '#e8c050', yellow70: '#dbb030'
        },
        default: 'blue50'
    },
    neck: {
        name: 'Neck',
        icon: '🦙',
        folder: 'neck',
        items: ['default', 'bend-forward', 'bend-backward', 'thick'],
        default: 'default'
    },
    hair: {
        name: 'Hair',
        icon: '💇',
        folder: 'hair',
        items: ['default', 'bang', 'curls', 'elegant', 'quiff', 'short'],
        default: 'default'
    },
    eyes: {
        name: 'Eyes',
        icon: '👀',
        folder: 'eyes',
        items: ['default', 'angry', 'naughty', 'panda', 'smart', 'star'],
        default: 'default'
    },
    ears: {
        name: 'Ears',
        icon: '👂',
        folder: 'ears',
        items: ['default', 'tilt-backward', 'tilt-forward'],
        default: 'default'
    },
    mouth: {
        name: 'Mouth',
        icon: '😊',
        folder: 'mouth',
        items: ['default', 'astonished', 'eating', 'laugh', 'tongue'],
        default: 'default'
    },
    leg: {
        name: 'Leg',
        icon: '🦵',
        folder: 'leg',
        items: ['default', 'bubble-tea', 'cookie', 'game-console', 'tilt-backward', 'tilt-forward'],
        default: 'default'
    },
    accessory: {
        name: 'Accessory',
        icon: '🎀',
        folder: 'accessories',
        items: ['headphone', 'earings', 'flower', 'glasses', 'none'],
        default: 'headphone'
    }
};

const NOSE_PATH = `${ASSETS_PATH}/nose.png`;
const LAYER_ORDER = ['background', 'neck', 'leg', 'ears', 'hair', 'eyes', 'mouth', 'accessory'];
const CATEGORIES = Object.keys(STYLE_CONFIG);

// ============================================
// STATE
// ============================================

let currentSelections = {};
let currentCategory = 'background';
let isDownloading = false;
let toastTimer = null;

// ============================================
// HELPERS
// ============================================

function getImagePath(category, itemName) {
    if (itemName === 'none') return null;
    const config = STYLE_CONFIG[category];
    return `${ASSETS_PATH}/${config.folder}/${itemName}.png`;
}

function formatLabel(str) {
    return str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function initializeState() {
    CATEGORIES.forEach(cat => {
        currentSelections[cat] = STYLE_CONFIG[cat].default;
    });
}

// ============================================
// TOAST NOTIFICATION
// ============================================

function showToast(message, duration = 2500) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

// ============================================
// RENDERING
// ============================================

function renderAlpaca() {
    const canvas = document.getElementById('alpaca-canvas');
    if (!canvas) return;

    canvas.innerHTML = '';

    LAYER_ORDER.forEach(category => {
        const itemName = currentSelections[category];
        if (!itemName) return;

        const imgPath = getImagePath(category, itemName);
        if (!imgPath) return;

        const img = document.createElement('img');
        img.src = imgPath;
        img.className = `layer layer-${category}`;
        img.alt = `${category}: ${itemName}`;
        img.loading = 'eager';
        img.onerror = () => {
            console.warn(`Missing asset: ${imgPath}`);
            img.style.display = 'none';
        };
        canvas.appendChild(img);
    });

    // Nose is always present
    const nose = document.createElement('img');
    nose.src = NOSE_PATH;
    nose.className = 'layer layer-nose';
    nose.alt = 'nose';
    nose.onerror = () => { nose.style.display = 'none'; };
    canvas.appendChild(nose);
}

function renderStyleButtons() {
    const grid = document.getElementById('style-grid');
    const titleEl = document.getElementById('panel-title');
    const countEl = document.getElementById('panel-count');
    if (!grid) return;

    const config = STYLE_CONFIG[currentCategory];
    if (!config) return;

    if (titleEl) titleEl.textContent = `Choose ${config.name}`;
    if (countEl) countEl.textContent = `${config.items.length} options`;

    grid.innerHTML = '';

    config.items.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'style-btn';
        btn.setAttribute('role', 'radio');
        btn.setAttribute('aria-checked', currentSelections[currentCategory] === item ? 'true' : 'false');
        btn.title = formatLabel(item);

        if (currentSelections[currentCategory] === item) {
            btn.classList.add('active');
        }

        // Use swatch for backgrounds, thumbnail image for others
        const isBackground = currentCategory === 'background';
        const hasSwatch = isBackground && config.swatches?.[item];

        if (hasSwatch) {
            const swatch = document.createElement('div');
            swatch.className = 'style-swatch';
            swatch.style.backgroundColor = config.swatches[item];
            swatch.setAttribute('aria-hidden', 'true');
            btn.appendChild(swatch);
        } else if (item !== 'none') {
            const thumb = document.createElement('img');
            thumb.className = 'style-thumb';
            thumb.src = getImagePath(currentCategory, item);
            thumb.alt = '';
            thumb.loading = 'lazy';
            thumb.onerror = () => {
                // fallback: just hide the broken img
                thumb.style.display = 'none';
            };
            btn.appendChild(thumb);
        } else {
            // 'none' option
            const placeholder = document.createElement('div');
            placeholder.style.cssText = 'width:48px;height:48px;border-radius:50%;background:var(--cream-dark);display:flex;align-items:center;justify-content:center;font-size:1.3rem;';
            placeholder.textContent = '∅';
            btn.appendChild(placeholder);
        }

        const label = document.createElement('span');
        label.textContent = formatLabel(item);
        btn.appendChild(label);

        btn.addEventListener('click', () => setStyle(currentCategory, item));
        grid.appendChild(btn);
    });
}

function renderLookChips() {
    const container = document.getElementById('look-chips');
    if (!container) return;

    container.innerHTML = '';

    CATEGORIES.forEach(cat => {
        const val = currentSelections[cat];
        const config = STYLE_CONFIG[cat];

        const chip = document.createElement('button');
        chip.className = 'look-chip';
        chip.title = `Click to edit ${config.name}`;
        chip.setAttribute('aria-label', `${config.name}: ${formatLabel(val)}. Click to edit.`);

        chip.innerHTML = `
            <span class="chip-cat">${config.name.toLowerCase()}</span>
            <span>${config.icon} ${formatLabel(val)}</span>
        `;

        chip.addEventListener('click', () => {
            switchCategory(cat);
            chip.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });

        container.appendChild(chip);
    });
}

function setStyle(category, itemName) {
    if (!STYLE_CONFIG[category]) return;
    currentSelections[category] = itemName;
    renderAlpaca();
    renderStyleButtons();
    renderLookChips();
}

// ============================================
// CATEGORY SWITCHING
// ============================================

function switchCategory(category) {
    if (!STYLE_CONFIG[category]) return;
    currentCategory = category;

    document.querySelectorAll('.category-btn').forEach(btn => {
        const isActive = btn.dataset.category === category;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    renderStyleButtons();
}

// ============================================
// RANDOMIZE
// ============================================

function randomizeAlpaca() {
    CATEGORIES.forEach(cat => {
        const items = STYLE_CONFIG[cat].items;
        currentSelections[cat] = items[Math.floor(Math.random() * items.length)];
    });

    renderAlpaca();
    renderStyleButtons();
    renderLookChips();
    showToast('🎲 New random alpaca!');
}

// ============================================
// CANVAS COMPOSER (shared by download + copy)
// ============================================

async function composeCanvas() {
    const container = document.getElementById('alpaca-canvas');
    const layers = container.querySelectorAll('.layer');
    const rect = container.getBoundingClientRect();

    const w = rect.width;
    const h = rect.height;

    if (w === 0 || h === 0) throw new Error('Container has no dimensions');

    const offscreen = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    offscreen.width = w * dpr;
    offscreen.height = h * dpr;

    const ctx = offscreen.getContext('2d');
    ctx.scale(dpr, dpr);

    for (const layer of layers) {
        const loaded = layer.complete && layer.naturalWidth > 0;
        if (!loaded) {
            await new Promise(resolve => {
                layer.onload = resolve;
                layer.onerror = resolve;
                setTimeout(resolve, 1500); // fallback timeout
            });
        }
        if (layer.naturalWidth > 0) {
            ctx.drawImage(layer, 0, 0, w, h);
        }
    }

    return offscreen;
}

// ============================================
// DOWNLOAD
// ============================================

async function downloadAlpaca() {
    if (isDownloading) return;
    isDownloading = true;

    const btn = document.getElementById('download-btn');
    btn.classList.add('loading');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span class="btn-icon">⏳</span><span>Saving…</span>';
    btn.disabled = true;

    try {
        const canvas = await composeCanvas();
        const link = document.createElement('a');
        link.download = `alpaca-licious-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('📸 Saved! Check your downloads.');
    } catch (err) {
        console.error('Download failed:', err);
        showToast('❌ Could not save image, please try again.');
    } finally {
        isDownloading = false;
        btn.classList.remove('loading');
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

// ============================================
// COPY TO CLIPBOARD
// ============================================

async function copyToClipboard() {
    if (isDownloading) return;
    isDownloading = true;

    const btn = document.getElementById('copy-btn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '⏳';
    btn.disabled = true;

    try {
        const canvas = await composeCanvas();

        // Use Clipboard API if available
        if (navigator.clipboard?.write) {
            canvas.toBlob(async (blob) => {
                try {
                    const item = new ClipboardItem({ 'image/png': blob });
                    await navigator.clipboard.write([item]);
                    showToast('📋 Copied to clipboard!');
                } catch {
                    showToast('❌ Clipboard not supported. Try Save PNG.');
                }
            }, 'image/png');
        } else {
            showToast('❌ Clipboard not supported. Try Save PNG.');
        }
    } catch (err) {
        console.error('Copy failed:', err);
        showToast('❌ Could not copy image.');
    } finally {
        setTimeout(() => {
            isDownloading = false;
            btn.classList.remove('loading');
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }, 800);
    }
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

function setupKeyboard() {
    document.addEventListener('keydown', (e) => {
        // Skip if focused on an input/button to avoid fighting with accessibility
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const hint = document.getElementById('keyboard-hint');

        switch (e.key.toLowerCase()) {
            case 'r':
                randomizeAlpaca();
                if (hint) hint.textContent = '🎲 Randomized!';
                break;
            case 'd':
                downloadAlpaca();
                if (hint) hint.textContent = '📸 Saving…';
                break;
            case 'c':
                copyToClipboard();
                if (hint) hint.textContent = '📋 Copying…';
                break;
            case 'arrowleft': {
                e.preventDefault();
                const idx = CATEGORIES.indexOf(currentCategory);
                const prev = CATEGORIES[(idx - 1 + CATEGORIES.length) % CATEGORIES.length];
                switchCategory(prev);
                if (hint) hint.textContent = `← ${STYLE_CONFIG[prev].name}`;
                break;
            }
            case 'arrowright': {
                e.preventDefault();
                const idx = CATEGORIES.indexOf(currentCategory);
                const next = CATEGORIES[(idx + 1) % CATEGORIES.length];
                switchCategory(next);
                if (hint) hint.textContent = `→ ${STYLE_CONFIG[next].name}`;
                break;
            }
        }

        // Clear hint after delay
        if (hint && e.key !== 'Tab') {
            clearTimeout(hint._timer);
            hint._timer = setTimeout(() => { hint.textContent = ''; }, 1800);
        }
    });
}

// ============================================
// PRELOAD
// ============================================

function preloadImages() {
    const urls = [];
    CATEGORIES.forEach(cat => {
        const config = STYLE_CONFIG[cat];
        config.items.forEach(item => {
            if (item !== 'none') urls.push(getImagePath(cat, item));
        });
    });
    urls.push(NOSE_PATH);

    // Stagger preloading to not block initial render
    urls.forEach((src, i) => {
        setTimeout(() => {
            const img = new Image();
            img.src = src;
        }, i * 20);
    });
}

// ============================================
// INIT
// ============================================

function init() {
    initializeState();
    renderAlpaca();
    renderStyleButtons();
    renderLookChips();

    document.getElementById('randomize-btn')?.addEventListener('click', randomizeAlpaca);
    document.getElementById('download-btn')?.addEventListener('click', downloadAlpaca);
    document.getElementById('copy-btn')?.addEventListener('click', copyToClipboard);

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => switchCategory(btn.dataset.category));
    });

    setupKeyboard();
    preloadImages();
}

init();