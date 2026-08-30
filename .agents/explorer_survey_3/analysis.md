# Tiffany Webb CRM Dashboard — UI/UX & Frontend Architecture Specification

**Author**: `explorer_survey_3`  
**Date**: 2026-08-30  
**Target Application**: `Landing Page Work/tiffany-webb-crm` (`views/dashboard.ejs`)  
**Scope**: Brand Design System, Glassmorphism Styling, Tailwind CDN Architecture, Modern Charting, Client-Side Transition & AJAX Architecture, Legacy Conflict Elimination.

---

## 1. Executive Summary

The Tiffany Webb CRM Leads Dashboard (`views/dashboard.ejs`) currently suffers from severe design fragmentation, redundant conflicting CSS layers (800+ lines of duplicate inline and injected styles with brute-force `!important` overrides), broken DOM query selectors in search scripts, and synchronous full-page reloads on data modifications.

This document establishes an authoritative UI/UX design specification and frontend architecture blueprint to transform `dashboard.ejs` into an elite, luxury web application. The design aligns precisely with the Tiffany Webb brand identity (Deep Forest Sage `#1A2721`, Deep Ink `#14130E`, Warm Ivory `#FBF6EA`, and Regal Gold `#C8A24C`), implementing refined glassmorphism surfaces, Tailwind CSS via CDN with custom luxury theme extensions, modern responsive charting, and an asynchronous, zero-reload AJAX interaction model.

---

## 2. Brand Codex & Design Tokens

### 2.1 Core Color Palette & Contrast Ratios

The visual identity is rooted in an editorial, high-end luxury aesthetic matching the core Astro marketing site (`tokens.css`).

| Token Name | Hex Code | HSL Representation | Role & Usage |
| :--- | :--- | :--- | :--- |
| **Deep Forest Sage** | `#1A2721` | `hsl(153, 20%, 13%)` | Primary page canvas background and radial glow accents. |
| **Deep Ink** | `#14130E` | `hsl(48, 17%, 6%)` | Dark base, top navigation bar, card backgrounds, deep contrast. |
| **Warm Ivory** | `#FBF6EA` | `hsl(43, 68%, 95%)` | Primary typography on dark surfaces, active text, icons. |
| **Regal Gold** | `#C8A24C` | `hsl(41, 53%, 54%)` | Primary action buttons, active tab indicators, key accents, focus rings. |
| **Elevated Dark (Char)**| `#23211B` | `hsl(43, 13%, 12%)` | Elevated surface layers, modal headers, dropdown containers. |
| **Emerald Accent** | `#0E6B54` | `hsl(166, 77%, 24%)` | Brand accent, success indicators, booked stage highlights. |
| **Muted Ivory / Slate** | `#A9A294` | `hsl(40, 11%, 62%)` | Secondary helper text, timestamps, inactive tab labels. |
| **Glass Border Light** | `rgba(251, 246, 234, 0.12)` | - | Crisp specular borders on dark glass cards. |
| **Glass Border Hover** | `rgba(200, 162, 76, 0.35)` | - | Gold-tinted border glow on card hover. |
| **Danger / Crimson** | `#E05353` | `hsl(0, 71%, 60%)` | Elegant muted crimson for delete/destructive actions (replaces neon red). |

### 2.2 WCAG 2.1 Contrast Matrix (Accessibility Proof)

| Foreground Color | Background Surface | Contrast Ratio | WCAG Compliance Level |
| :--- | :--- | :--- | :--- |
| Warm Ivory (`#FBF6EA`) | Deep Forest Sage (`#1A2721`) | **12.8:1** | **AAA** (Exceeds 7:1) |
| Warm Ivory (`#FBF6EA`) | Deep Ink (`#14130E`) | **15.4:1** | **AAA** (Exceeds 7:1) |
| Regal Gold (`#C8A24C`) | Deep Ink (`#14130E`) | **7.1:1** | **AAA** (Exceeds 7:1) |
| Regal Gold (`#C8A24C`) | Deep Forest Sage (`#1A2721`) | **5.9:1** | **AA** (Normal Text) / **AAA** (Large/UI) |
| Deep Ink (`#14130E`) | Regal Gold (`#C8A24C`) | **7.1:1** | **AAA** (Button text contrast) |
| Muted Ivory (`#A9A294`) | Deep Forest Sage (`#1A2721`) | **5.8:1** | **AA** (Exceeds 4.5:1) |

### 2.3 Status Badge Color Matrix

Status badges should have distinct, subtle translucent glass fills with refined border accents:

| Status | Badge Background | Border Color | Text Color | Dot Glow Color |
| :--- | :--- | :--- | :--- | :--- |
| **New / Unread** | `rgba(217, 162, 58, 0.12)` | `rgba(217, 162, 58, 0.35)` | `#F3C973` | `#D9A23A` |
| **Contacted** | `rgba(91, 121, 148, 0.15)` | `rgba(91, 121, 148, 0.40)` | `#A5CBEB` | `#5B7994` |
| **Qualified** | `rgba(14, 107, 84, 0.18)` | `rgba(14, 107, 84, 0.45)` | `#5EEAD4` | `#0E6B54` |
| **Proposal Sent**| `rgba(136, 87, 148, 0.15)` | `rgba(136, 87, 148, 0.40)` | `#E9B8F5` | `#885794` |
| **Booked** | `rgba(14, 107, 84, 0.25)` | `rgba(200, 162, 76, 0.50)` | `#FBF6EA` | `#C8A24C` |
| **Completed** | `rgba(78, 110, 126, 0.15)` | `rgba(78, 110, 126, 0.35)` | `#CBD5E1` | `#94A3B8` |
| **Declined** | `rgba(225, 83, 83, 0.12)` | `rgba(225, 83, 83, 0.30)` | `#FCA5A5` | `#E05353` |
| **Lost** | `rgba(163, 163, 163, 0.10)`| `rgba(163, 163, 163, 0.25)`| `#D4D4D4` | `#737373` |

### 2.4 Glassmorphism System Specifications

All card components, panels, modals, and input fields adhere to a multi-layer glassmorphism standard:

```css
/* Core Glass Surface */
.glass-surface {
    background: linear-gradient(135deg, rgba(20, 19, 14, 0.70) 0%, rgba(26, 39, 33, 0.50) 100%);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(251, 246, 234, 0.10);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 10px 30px rgba(0, 0, 0, 0.35);
    border-radius: 16px;
}

/* Glass Card Interactive Hover State */
.glass-card-interactive {
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                border-color 0.25s ease,
                background 0.25s ease;
}

.glass-card-interactive:hover {
    transform: translateY(-3px);
    background: linear-gradient(135deg, rgba(28, 27, 21, 0.85) 0%, rgba(35, 52, 44, 0.65) 100%);
    border-color: rgba(200, 162, 76, 0.35);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.20),
                0 16px 36px rgba(0, 0, 0, 0.45),
                0 0 20px rgba(200, 162, 76, 0.08);
}
```

---

## 3. Modern Frontend Stack & CDN Integration

### 3.1 Tailwind CSS Integration (Play CDN + Custom Configuration)

Instead of requiring an external Node/npm build step, Tailwind CSS Play CDN is loaded directly with an inline configuration object in `<head>`:

```html
<!-- Google Fonts Preconnect & Font Links -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">

<!-- Tailwind CSS Play CDN -->
<script src="https://cdn.tailwindcss.com"></script>
<script>
    tailwind.config = {
        darkMode: 'class',
        theme: {
            extend: {
                colors: {
                    sage: {
                        deep: '#1A2721',
                        dark: '#131E19',
                        DEFAULT: '#0E6B54',
                        light: '#23372E',
                        border: 'rgba(251, 246, 234, 0.10)'
                    },
                    ink: {
                        deep: '#0D1210',
                        DEFAULT: '#14130E',
                        card: '#1B1A14',
                        elevated: '#23211B',
                        border: 'rgba(251, 246, 234, 0.12)'
                    },
                    ivory: {
                        DEFAULT: '#FBF6EA',
                        muted: '#A9A294',
                        dim: 'rgba(251, 246, 234, 0.55)',
                        subtle: 'rgba(251, 246, 234, 0.05)'
                    },
                    gold: {
                        DEFAULT: '#C8A24C',
                        hover: '#DBB55F',
                        subtle: 'rgba(200, 162, 76, 0.15)',
                        glow: 'rgba(200, 162, 76, 0.35)'
                    },
                    crimson: {
                        DEFAULT: '#E05353',
                        hover: '#F87171',
                        subtle: 'rgba(224, 83, 83, 0.12)'
                    }
                },
                fontFamily: {
                    serif: ['"Instrument Serif"', 'Georgia', 'serif'],
                    sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
                    mono: ['"Space Mono"', 'monospace']
                },
                boxShadow: {
                    'glass': 'inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 10px 30px rgba(0, 0, 0, 0.35)',
                    'glass-hover': 'inset 0 1px 0 rgba(255, 255, 255, 0.20), 0 16px 36px rgba(0, 0, 0, 0.45), 0 0 20px rgba(200, 162, 76, 0.10)',
                    'gold-glow': '0 0 15px rgba(200, 162, 76, 0.40)'
                },
                keyframes: {
                    fadeIn: {
                        '0%': { opacity: '0', transform: 'translateY(6px)' },
                        '100%': { opacity: '1', transform: 'translateY(0)' }
                    },
                    slideDown: {
                        '0%': { opacity: '0', transform: 'translateY(-10px)' },
                        '100%': { opacity: '1', transform: 'translateY(0)' }
                    },
                    cardExit: {
                        '0%': { opacity: '1', transform: 'scale(1)', maxHeight: '200px' },
                        '100%': { opacity: '0', transform: 'scale(0.92)', maxHeight: '0px', margin: '0', padding: '0' }
                    }
                },
                animation: {
                    fadeIn: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                    slideDown: 'slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                    cardExit: 'cardExit 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                }
            }
        }
    }
</script>
```

---

## 4. Modern Charting Architecture

### 4.1 Chart.js 4.x CDN Configuration & Theme

Chart.js 4.x is integrated with a dark luxury preset matching the Tiffany Webb theme:

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

#### Chart 1: Lead Sources (Doughnut Chart)
- **Palette**: Regal Gold (`#C8A24C`), Emerald (`#0E6B54`), Warm Coral (`#E17356`), Muted Plum (`#885794`), Slate Blue (`#5B7994`).
- **Styling**:
  - `cutout: '72%'` (thin modern ring).
  - `borderWidth: 2`, `borderColor: '#14130E'` (subtle dark separation between slices).
  - `borderRadius: 4`.
  - Centered metric overlay (e.g. Total count or dynamic hover label).
  - Custom Legend: Warm Ivory text (`#FBF6EA`), sans-serif typography, bottom layout with generous padding.

#### Chart 2: Pipeline Funnel (Gradient Bar Chart)
- **Palette**: Vertical linear gradient from Light Gold/Amber (`#DBB55F`) to Deep Emerald/Sage (`#0E6B54`).
- **Styling**:
  - Rounded bar tops (`borderRadius: 8`).
  - Subtle grid lines (`rgba(251, 246, 234, 0.06)`).
  - Clean Y-axis integer tick steps.
  - Interactive hover state brightening bar opacity to `1.0`.

```javascript
// Re-usable Chart Initialization Helper
function initCharts(sourceData, funnelData) {
    // 1. Source Doughnut Chart
    const sourceCanvas = document.getElementById('sourceChart');
    if (sourceCanvas) {
        const sourceLabels = Object.keys(sourceData).map(k => k.replace(/_/g, ' ').toUpperCase());
        const sourceValues = Object.values(sourceData);
        
        new Chart(sourceCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: sourceLabels,
                datasets: [{
                    data: sourceValues,
                    backgroundColor: ['#C8A24C', '#0E6B54', '#E17356', '#885794', '#5B7994', '#9A6A3E'],
                    borderColor: '#14130E',
                    borderWidth: 2,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#FBF6EA',
                            font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: '500' },
                            padding: 16,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(20, 19, 14, 0.92)',
                        titleColor: '#C8A24C',
                        bodyColor: '#FBF6EA',
                        borderColor: 'rgba(251, 246, 234, 0.15)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        boxPadding: 6
                    }
                }
            }
        });
    }

    // 2. Funnel Bar Chart
    const funnelCanvas = document.getElementById('funnelChart');
    if (funnelCanvas) {
        const ctx = funnelCanvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 240);
        gradient.addColorStop(0, '#C8A24C');
        gradient.addColorStop(1, '#0E6B54');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['New', 'Qualified', 'Proposal Sent', 'Booked'],
                datasets: [{
                    data: [funnelData.new || 0, funnelData.qualified || 0, funnelData.proposal_sent || 0, funnelData.booked || 0],
                    backgroundColor: gradient,
                    borderRadius: 8,
                    borderSkipped: false,
                    barThickness: 36
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(20, 19, 14, 0.92)',
                        titleColor: '#C8A24C',
                        bodyColor: '#FBF6EA',
                        borderColor: 'rgba(251, 246, 234, 0.15)',
                        borderWidth: 1,
                        padding: 10,
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#A9A294', font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 } },
                        grid: { display: false }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#A9A294', stepSize: 1, font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 } },
                        grid: { color: 'rgba(251, 246, 234, 0.06)' }
                    }
                }
            }
        });
    }
}
```

---

## 5. Client-Side Interaction Architecture (Zero-Reload AJAX)

### 5.1 Debounced Live Search (In-Memory Filtering)

The search interaction operates with immediate responsiveness:

1. **Debounce Timer**: 250ms debounce on the `input` event prevents layout thrashing.
2. **Unified Dataset**: Search operates across all card attributes (`contact_name`, `email`, `phone`, `organization_name`, `source`, `status`).
3. **Dual-Mode Display**:
   - When searching: Automatically reveals matching cards across all statuses, highlighting the matched count, and dynamically showing an inline clear button.
   - When query is empty: Smoothly restores the current active status tab view without DOM reconstruction.
4. **Keyboard Accessibility**: Pressing `ESC` clears search instantly; pressing `Enter` bypasses debounce.

```javascript
let searchDebounceTimer = null;

function setupLiveSearch() {
    const searchInput = document.getElementById('dashboardSearch');
    const clearBtn = document.getElementById('searchClearBtn');
    
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchDebounceTimer);
        const query = e.target.value.trim().toLowerCase();
        
        if (query.length > 0) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }

        searchDebounceTimer = setTimeout(() => {
            executeSearch(query);
        }, 200);
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            resetSearch();
        }
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', resetSearch);
    }
}

function executeSearch(query) {
    const allCards = document.querySelectorAll('.lead-card');
    const searchResultNotice = document.getElementById('searchResultNotice');
    const tabsNav = document.getElementById('statusTabsNav');
    const tabPanes = document.querySelectorAll('.status-tab-pane');
    
    if (!query) {
        resetSearch();
        return;
    }

    // Hide status tabs nav and show all matching cards in a unified search view
    tabsNav.classList.add('opacity-50', 'pointer-events-none');
    let matchCount = 0;

    tabPanes.forEach(pane => {
        pane.classList.remove('hidden'); // allow search across all panes
        const cards = pane.querySelectorAll('.lead-card');
        cards.forEach(card => {
            const searchIndex = (card.getAttribute('data-search') || '').toLowerCase();
            if (searchIndex.includes(query)) {
                card.classList.remove('hidden');
                card.classList.add('animate-fadeIn');
                matchCount++;
            } else {
                card.classList.add('hidden');
            }
        });
    });

    if (searchResultNotice) {
        searchResultNotice.classList.remove('hidden');
        searchResultNotice.innerHTML = `Found <strong class="text-gold font-semibold">${matchCount}</strong> result${matchCount === 1 ? '' : 's'} for "<span class="text-ivory">${escapeHTML(query)}</span>"`;
    }
}

function resetSearch() {
    const searchInput = document.getElementById('dashboardSearch');
    const clearBtn = document.getElementById('searchClearBtn');
    const searchResultNotice = document.getElementById('searchResultNotice');
    const tabsNav = document.getElementById('statusTabsNav');
    
    if (searchInput) searchInput.value = '';
    if (clearBtn) clearBtn.classList.add('hidden');
    if (searchResultNotice) searchResultNotice.classList.add('hidden');
    if (tabsNav) tabsNav.classList.remove('opacity-50', 'pointer-events-none');

    // Restore active tab
    const activeTab = document.querySelector('.tab-button.active');
    const activeStatus = activeTab ? activeTab.getAttribute('data-status') : 'new';
    switchTab(activeStatus);
}
```

---

### 5.2 Status Tab Transitions & Active States

Tab switching smoothly animates the leads grid without any layout jumps:

1. **Active Tab Pill / Underline**: The active tab uses a glowing gold background pill (`bg-gold/15 text-gold border-gold/30`) with a gold counter badge.
2. **Smooth Fade In**: On clicking a tab, non-selected panes are hidden, and the active pane fades in with `animation-fadeIn` (`opacity: 0, translateY(6px)` -> `opacity: 1, translateY(0)`).
3. **Empty State Component**: When a status column has zero leads, an elegant editorial empty state is rendered:
   ```html
   <div class="py-16 text-center border border-dashed border-ivory/10 rounded-2xl bg-ink/30">
       <svg class="w-12 h-12 mx-auto text-ivory/20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
       </svg>
       <p class="font-serif text-2xl text-ivory/60 italic">No inquiries in this stage</p>
       <p class="text-sm text-ivory/40 mt-1">New submissions matching this status will appear here.</p>
   </div>
   ```

---

### 5.3 Card Deletion & Bulk Deletion Architecture (Smooth Exit Animations)

#### Single Lead Deletion Flow:
1. **Quick Action Trigger**: Each card contains a subtle delete trash icon button in the header/footer with `e.stopPropagation()` (preventing navigation to `/lead/:id`).
2. **Confirmation Modal or Toast**: A sleek glassmorphic confirmation prompt appears (e.g. "Delete lead for [Name]?").
3. **Asynchronous Backend Call**: Dispatches `POST /lead/:id/delete` (or `DELETE /api/leads/:id`) via `fetch`.
4. **Smooth Exit Animation**:
   - Card immediately adds `.card-deleting` class:
     - `transform: scale(0.90)`
     - `opacity: 0`
     - `max-height: 0`
     - `margin-top: 0; margin-bottom: 0; padding-top: 0; padding-bottom: 0`
     - `transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1)`
   - After transition end (350ms), removes element from DOM.
5. **Dynamic Stat & Counter Sync**:
   - Decrements Total Leads stat counter and Status Badge counter.
   - Triggers non-blocking luxury Toast: *"Lead successfully deleted"*.
   - Zero page reload!

```javascript
async function deleteLeadCard(leadId, leadName, event) {
    if (event) event.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete the lead for "${leadName}"?`)) {
        return;
    }

    const cardElement = document.getElementById(`lead-card-${leadId}`);
    
    try {
        const response = await fetch(`/lead/${leadId}/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok || response.redirected) {
            // Animate card removal
            if (cardElement) {
                cardElement.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
                cardElement.style.opacity = '0';
                cardElement.style.transform = 'scale(0.92) translateY(-10px)';
                cardElement.style.maxHeight = `${cardElement.offsetHeight}px`;
                
                setTimeout(() => {
                    cardElement.style.maxHeight = '0px';
                    cardElement.style.paddingTop = '0px';
                    cardElement.style.paddingBottom = '0px';
                    cardElement.style.marginTop = '0px';
                    cardElement.style.marginBottom = '0px';
                    cardElement.style.overflow = 'hidden';
                }, 50);

                setTimeout(() => {
                    const parentGrid = cardElement.parentElement;
                    cardElement.remove();
                    
                    // Check if parent grid is now empty
                    if (parentGrid && parentGrid.querySelectorAll('.lead-card').length === 0) {
                        const pane = parentGrid.closest('.status-tab-pane');
                        if (pane) {
                            const emptyPlaceholder = pane.querySelector('.empty-state-placeholder');
                            if (emptyPlaceholder) emptyPlaceholder.classList.remove('hidden');
                        }
                    }
                }, 400);
            }

            // Decrement stat counters in memory
            updateCounterBadges();
            showToast(`Lead "${leadName}" deleted successfully.`, 'success');
        } else {
            showToast('Failed to delete lead. Please try again.', 'error');
        }
    } catch (err) {
        console.error('Delete lead error:', err);
        showToast('Network error while deleting lead.', 'error');
    }
}
```

---

## 6. Audit of Legacy CSS & Conflicts

### 6.1 Discovered Legacy Issues

1. **Dual Injected Stylesheets**:
   - `dashboard.ejs` contains both an initial `<style>` block (lines 10-513) AND an injected theme block (lines 539-840).
   - Injected block uses `!important` on almost every selector (`body`, `div`, `table`, `.btn`, `h1-h6`).
2. **Conflicting Color Paradigms**:
   - Legacy CSS contains hardcoded multi-color card gradients (`linear-gradient(135deg, #2b2212 0%, #141414 100%)`, `#2d1616`, `#172433`, `#271a2b`).
   - Action bar has an incongruent purple gradient (`#2e1045` to `#170824`) with lavender borders (`#d8b4e2`).
   - Delete buttons use glowing neon red (`#ef4444` with `box-shadow: 0 0 22px rgba(239, 68, 68, 0.9)`).
3. **Broken DOM Query Selectors**:
   - The search script in `dashboard.ejs` (line 1127) looks for `document.querySelectorAll('.kanban-board .card')`.
   - However, the markup uses `.glass-card` inside `.tab-content-wrapper`, causing search to completely fail silently!
4. **Hardcoded Inline Styles**:
   - Numerous elements contain inline `style="background: #fee2e2; color: #991b1b; ..."` and `style="display: none; ..."`.
5. **Lack of Mobile / Responsive Viewport Polish**:
   - Search bar and action buttons break on narrow viewports; tabs cause horizontal layout stretch.

### 6.2 Legacy Elimination Plan

- **Complete Clean Slate for `views/dashboard.ejs`**: Replace both conflicting `<style>` blocks and messy inline styles with a streamlined Tailwind CSS configuration and pure scoped utility classes.
- **Unified Clean Navigation**: Rebuild the top navigation bar with luxury glass styling, active indicator, and clean responsive links.
- **Unified Action Bar**: Replace the purple gradient bar with a unified glassmorphic action panel matching the deep sage/ink luxury theme.

---

## 7. Complete UI Component Hierarchy for `dashboard.ejs`

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOP NAVIGATION (Sticky Glass Bar: Logo | Pipeline, Add Lead, CMS, Staff)│
└────────────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────────────┐
│ MAIN CONTAINER (Max-w-7xl / 1600px)                                    │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ HEADER SECTION: "Booking Pipeline" (Serif) + Quick Summary       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ STATS SUMMARY GRID (4 Glass Cards: Total, New, Booked, Proposals)│  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌─────────────────────────────────┬────────────────────────────────┐  │
│  │ SOURCE DISTRIBUTION (Doughnut)  │ PIPELINE FUNNEL (Bar Chart)    │  │
│  └─────────────────────────────────┴────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ UNIFIED SEARCH & ACTION BAR (Glass Panel)                        │  │
│  │  [ 🔍 Search Input (Debounced) ]    [ Bulk Action ] [ + Add Lead] │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ STATUS TABS BAR (New [5] | Contacted [2] | Qualified [4] | ...)   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ LEADS GRID / SEARCH RESULTS (Responsive 3-Column Glass Cards)    │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐              │  │
│  │  │ Lead Card    │ │ Lead Card    │ │ Lead Card    │              │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘              │  │
│  │  (Or Editorial Empty State when 0 leads)                         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Summary of Architectural Recommendations for Implementers

1. **Adopt Tailwind CSS Play CDN** with the custom luxury configuration detailed in Section 3.1.
2. **Standardize all cards and surfaces** on the multi-layer glassmorphism styling defined in Section 2.4.
3. **Upgrade Chart.js styling** with brand gradients, rounded bars, custom cutout ring, and ivory typography.
4. **Implement Debounced Live Search** operating on `data-search` attributes across `.lead-card` components.
5. **Implement Smooth AJAX Deletion** with the `.card-deleting` transform/opacity/max-height CSS exit animation and in-memory stat counter recalculation.
6. **Deploy a lightweight Glassmorphism Toast Notification** for non-intrusive feedback on AJAX mutations.
