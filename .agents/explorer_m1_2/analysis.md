# Modernized Chart.js Analytics Specification for `views/dashboard.ejs`

**Target File**: `Landing Page Work/tiffany-webb-crm/views/dashboard.ejs`  
**Milestone**: M1 (Full Dashboard UI/UX & AJAX Redesign)  
**Author**: `explorer_m1_2`  
**Date**: 2026-08-30  

---

## 1. Executive Summary & Design Vision

The Tiffany Webb CRM Leads Dashboard requires executive-grade visual analytics that reflect the brand's luxury aesthetic (**Deep Forest Sage `#1A2721`**, **Deep Ink `#14130E`**, **Warm Ivory `#FBF6EA`**, **Regal Gold `#C8A24C`**, and **Emerald `#0E6B54`**).

Legacy chart implementation suffered from:
1. Out-of-palette neon/purple/red colors (`#a84747`, `#885794`, `#e58e73`).
2. Vulnerable unescaped JSON injection (`const chartData = <%- chartData %>;`), creating XSS attack vectors and crashing the dashboard if `chartData` is malformed.
3. Lack of fallback handling when the database has 0 leads or empty sources.
4. Rigid non-reactive chart instances that do not update when leads are deleted via AJAX.

This specification details the complete Chart.js 4.x architecture, configuration, anti-XSS serialization, responsive layout, dynamic gradients, center metric overlays, and zero-reload refresh hooks.

---

## 2. Chart.js 4.x CDN Inclusion & Setup

### 2.1 CDN Script Tag
To ensure standard Chart.js 4.x global availability (`window.Chart`) without build-step bundlers, include the pinned UMD bundle:

```html
<!-- Chart.js 4.x UMD Bundle -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
```

### 2.2 Global Theming & Defaults
Configure Chart.js defaults once upon initialization to enforce brand typography and dark luxury tooltip styling:

```javascript
// Initialize Chart.js Brand Theming Defaults
if (typeof Chart !== 'undefined') {
    Chart.defaults.color = 'rgba(251, 246, 234, 0.7)'; // Warm Ivory Muted
    Chart.defaults.font.family = "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif";
    Chart.defaults.font.size = 12;
    
    // Luxury Glassmorphic Tooltips
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(20, 19, 14, 0.95)'; // Deep Ink
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(200, 162, 76, 0.35)';   // Regal Gold Border
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.titleColor = '#FBF6EA';                     // Warm Ivory
    Chart.defaults.plugins.tooltip.titleFont = { 
        family: "'Plus Jakarta Sans', sans-serif", 
        weight: '600', 
        size: 13 
    };
    Chart.defaults.plugins.tooltip.bodyColor = '#F3EAD6';                      // Cream
    Chart.defaults.plugins.tooltip.bodyFont = { 
        family: "'Space Mono', monospace", 
        size: 12 
    };
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.boxPadding = 6;
    Chart.defaults.plugins.tooltip.usePointStyle = true;
}
```

---

## 3. Safe `chartData` Ingestion & Anti-XSS Architecture

### 3.1 Security & Robustness Problem
In Express EJS templates, embedding `<%- chartData %>` directly into a JavaScript `<script>` block exposes the application to:
1. **Cross-Site Scripting (XSS)**: If lead source or stage names contain malicious characters or `</script>` tags, the parser breaks out of the script tag and executes arbitrary JS.
2. **Fatal Syntax Errors**: If `chartData` is `null`, `undefined`, or malformed, the script terminates immediately, killing all subsequent event listeners (search, tab switching, delete modals).

### 3.2 Safe Payload Embedding Pattern
In `views/dashboard.ejs`, inject the serialized JSON into a non-executable `<script type="application/json">` container with HTML tag sanitization:

```html
<!-- Safe Ingest: Non-executable JSON container with escaped script tags -->
<script id="crm-chart-payload" type="application/json"><%- (typeof chartData === 'string' ? chartData : JSON.stringify(chartData || {})).replace(/</g, '\\u003c') %></script>
```

### 3.3 Robust Parsing & Fallback Extraction
In the client-side charting script:

```javascript
/**
 * Safely parses the embedded JSON payload from #crm-chart-payload.
 * Returns valid data schema with fallbacks on any error.
 */
function getSafeChartData() {
    try {
        const payloadEl = document.getElementById('crm-chart-payload');
        if (!payloadEl || !payloadEl.textContent.trim()) {
            return {
                sourceData: {},
                funnelData: { new: 0, qualified: 0, proposal_sent: 0, booked: 0 }
            };
        }
        const parsed = JSON.parse(payloadEl.textContent);
        return {
            sourceData: (parsed && typeof parsed.sourceData === 'object' && parsed.sourceData !== null) 
                ? parsed.sourceData 
                : {},
            funnelData: (parsed && typeof parsed.funnelData === 'object' && parsed.funnelData !== null) 
                ? parsed.funnelData 
                : { new: 0, qualified: 0, proposal_sent: 0, booked: 0 }
        };
    } catch (err) {
        console.warn('[CRM Analytics] Error parsing chartData payload. Using fallback defaults:', err);
        return {
            sourceData: {},
            funnelData: { new: 0, qualified: 0, proposal_sent: 0, booked: 0 }
        };
    }
}
```

---

## 4. Chart 1: Lead Sources Doughnut Chart

### 4.1 Specification & Design Requirements
- **Inner Cutout**: `72%` (`cutout: '72%'`), creating a sleek modern ring.
- **Palette**: Luxury Brand Palette:
  1. `#C8A24C` (Regal Gold)
  2. `#0E6B54` (Emerald)
  3. `#1A2721` (Deep Forest Sage)
  4. `#D9A23A` (Mustard Gold)
  5. `#C15427` (Burnt Terracotta)
  6. `#23211B` (Charcoal Elevated)
- **Borders & Spacing**: Dark ink segment separator (`borderColor: '#14130E'`, `borderWidth: 2`, `spacing: 2`, `borderRadius: 4`).
- **Center Metric Display**: Absolute HTML overlay inside the relative canvas wrapper showing the total number of inquiries in bold Fraunces/Gold with an ivory label.
- **Custom Tooltip**: Shows source name, lead count, and percentage share.
- **Ivory Legend**: Bottom-aligned with circular dot indicators and warm ivory text.

### 4.2 Code Implementation
```javascript
const LUXURY_PALETTE = [
    '#C8A24C', // Regal Gold
    '#0E6B54', // Emerald
    '#1A2721', // Deep Forest Sage
    '#D9A23A', // Mustard Gold
    '#C15427', // Burnt Terracotta
    '#23211B'  // Charcoal Elevated
];

/**
 * Initializes or updates the Lead Sources Doughnut Chart.
 */
function renderLeadSourcesChart(sourceData) {
    const canvas = document.getElementById('sourceChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (window.crmCharts?.sourceChart instanceof Chart) {
        window.crmCharts.sourceChart.destroy();
    }

    const rawLabels = Object.keys(sourceData || {});
    const rawValues = Object.values(sourceData || {});
    const totalLeads = rawValues.reduce((sum, v) => sum + (Number(v) || 0), 0);

    // Update Center Overlay Stat
    const centerTotalEl = document.getElementById('sourceChartTotal');
    if (centerTotalEl) {
        centerTotalEl.textContent = totalLeads;
    }

    // Format human-readable labels (e.g., 'lead_form' -> 'Lead Form')
    const formattedLabels = rawLabels.map(label => 
        label.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    );

    // Fallback: If no sources logged yet, render subtle placeholder ring
    const isDataEmpty = totalLeads === 0 || rawValues.length === 0;
    const chartLabels = isDataEmpty ? ['No Sources Yet'] : formattedLabels;
    const chartDataValues = isDataEmpty ? [1] : rawValues;
    const chartColors = isDataEmpty 
        ? ['rgba(251, 246, 234, 0.08)'] 
        : LUXURY_PALETTE.slice(0, rawValues.length);

    window.crmCharts = window.crmCharts || {};
    window.crmCharts.sourceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: chartLabels,
            datasets: [{
                data: chartDataValues,
                backgroundColor: chartColors,
                borderColor: '#14130E',
                borderWidth: isDataEmpty ? 1 : 2,
                hoverBorderColor: isDataEmpty ? '#14130E' : '#C8A24C',
                hoverBorderWidth: isDataEmpty ? 1 : 2,
                hoverOffset: isDataEmpty ? 0 : 6,
                borderRadius: isDataEmpty ? 0 : 4,
                spacing: isDataEmpty ? 0 : 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 900
            },
            plugins: {
                legend: {
                    display: !isDataEmpty,
                    position: 'bottom',
                    labels: {
                        color: '#FBF6EA',
                        font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: '500' },
                        boxWidth: 10,
                        boxHeight: 10,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 14
                    }
                },
                tooltip: {
                    enabled: !isDataEmpty,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const pct = totalLeads > 0 ? Math.round((value / totalLeads) * 100) : 0;
                            return `  ${label}: ${value} (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}
```

---

## 5. Chart 2: Pipeline Funnel Bar Chart

### 5.1 Specification & Design Requirements
- **Rounded Gradient Bars**:
  - Vertical canvas gradient transitioning from **Regal Gold (`#C8A24C`)** at the top cap down to **Deep Emerald (`#0E6B54`)** at the base.
  - Border radius on top caps: `borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 }`.
  - Max bar thickness: `36px` to maintain balanced proportions on wide screens.
- **Labels & Pipeline Stages**:
  1. `New Inquiry` (`funnelData.new || 0`)
  2. `Qualified` (`funnelData.qualified || 0`)
  3. `Proposal Sent` (`funnelData.proposal_sent || 0`)
  4. `Booked` (`funnelData.booked || 0`)
- **Dark Clean Gridlines**:
  - Y-Axis: Soft subtle ivory gridlines (`rgba(251, 246, 234, 0.06)`), integer step increments, monospace ivory ticks (`Space Mono`).
  - X-Axis: No vertical gridlines, ivory stage titles (`Plus Jakarta Sans`), subtle bottom baseline border (`rgba(251, 246, 234, 0.12)`).
- **Custom Tooltip**:
  - Displays Stage Name, Lead Volume, and Conversion Insight.

### 5.2 Code Implementation
```javascript
/**
 * Initializes or updates the Pipeline Funnel Bar Chart.
 */
function renderPipelineFunnelChart(funnelData) {
    const canvas = document.getElementById('funnelChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (window.crmCharts?.funnelChart instanceof Chart) {
        window.crmCharts.funnelChart.destroy();
    }

    // Dynamic Canvas Gradient: Gold (top) to Emerald (bottom)
    const gradient = ctx.createLinearGradient(0, 0, 0, 220);
    gradient.addColorStop(0, '#C8A24C'); // Regal Gold
    gradient.addColorStop(1, '#0E6B54'); // Deep Emerald

    const funnelStages = [
        { key: 'new', label: 'New Inquiry' },
        { key: 'qualified', label: 'Qualified' },
        { key: 'proposal_sent', label: 'Proposal Sent' },
        { key: 'booked', label: 'Booked' }
    ];

    const labels = funnelStages.map(s => s.label);
    const dataValues = funnelStages.map(s => Number(funnelData?.[s.key]) || 0);
    const maxVal = Math.max(...dataValues, 1);

    window.crmCharts = window.crmCharts || {};
    window.crmCharts.funnelChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Leads in Stage',
                data: dataValues,
                backgroundColor: gradient,
                hoverBackgroundColor: '#D9A23A', // Mustard highlight on hover
                borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 },
                borderSkipped: 'bottom',
                maxBarThickness: 36
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 800,
                easing: 'easeOutQuart'
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#FBF6EA',
                        font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: '500' }
                    },
                    border: {
                        color: 'rgba(251, 246, 234, 0.12)'
                    }
                },
                y: {
                    beginAtZero: true,
                    suggestedMax: Math.max(maxVal + 1, 4),
                    ticks: {
                        color: 'rgba(251, 246, 234, 0.65)',
                        stepSize: 1,
                        precision: 0,
                        font: { family: "'Space Mono', monospace", size: 11 }
                    },
                    grid: {
                        color: 'rgba(251, 246, 234, 0.06)',
                        drawBorder: false
                    },
                    border: { display: false }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: function(items) {
                            return items[0]?.label || '';
                        },
                        label: function(context) {
                            const count = context.parsed.y || 0;
                            return `  Stage Volume: ${count} lead${count === 1 ? '' : 's'}`;
                        }
                    }
                }
            }
        }
    });
}
```

---

## 6. HTML Structure for Analytics Section in `dashboard.ejs`

To ensure full responsive alignment, glassmorphic container aesthetics, and center-metric positioning:

```html
<!-- Modernized Analytics Section -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    <!-- Lead Sources Card -->
    <div class="bg-char/70 backdrop-blur-md border border-ivory/10 rounded-xl p-6 shadow-xl relative flex flex-col justify-between">
        <div class="flex items-center justify-between mb-4">
            <div>
                <h3 class="font-serif text-xl font-bold text-ivory tracking-wide">Lead Sources</h3>
                <p class="text-xs text-ivory/50 mt-0.5">Distribution across marketing channels</p>
            </div>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-gold/10 text-gold border border-gold/20">
                Live Distribution
            </span>
        </div>
        
        <div class="relative w-full h-[260px] flex items-center justify-center">
            <canvas id="sourceChart"></canvas>
            <!-- Center Metric Badge in 72% Cutout -->
            <div id="sourceChartCenter" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span id="sourceChartTotal" class="text-3xl font-serif font-bold text-gold tracking-tight leading-none">0</span>
                <span class="text-[10px] uppercase tracking-widest text-ivory/60 font-mono mt-1">Inquiries</span>
            </div>
        </div>
    </div>

    <!-- Pipeline Funnel Card -->
    <div class="bg-char/70 backdrop-blur-md border border-ivory/10 rounded-xl p-6 shadow-xl flex flex-col justify-between">
        <div class="flex items-center justify-between mb-4">
            <div>
                <h3 class="font-serif text-xl font-bold text-ivory tracking-wide">Pipeline Funnel</h3>
                <p class="text-xs text-ivory/50 mt-0.5">Active stage conversion flow</p>
            </div>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald/10 text-emerald border border-emerald/30">
                Stage Volume
            </span>
        </div>
        
        <div class="relative w-full h-[260px]">
            <canvas id="funnelChart"></canvas>
        </div>
    </div>
</div>
```

---

## 7. Dynamic Real-Time Update Mechanism (Zero-Reload Architecture)

When a lead is deleted (individually or in bulk) or added via AJAX without page reload:
1. Client-side state recalculates counts dynamically.
2. `window.refreshAnalyticsFromDOM()` updates the KPI metric cards and re-renders both Chart.js charts smoothly.

```javascript
/**
 * Dynamically recomputes chart data from DOM cards and refreshes charts without page reload.
 */
function refreshAnalyticsFromDOM() {
    const sourceCounts = {};
    const funnelCounts = { new: 0, qualified: 0, proposal_sent: 0, booked: 0 };

    // Scan existing lead cards in DOM
    const leadCards = document.querySelectorAll('.lead-card');
    leadCards.forEach(card => {
        const source = card.dataset.source || 'other';
        const status = card.dataset.status || 'new';

        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
        if (funnelCounts[status] !== undefined) {
            funnelCounts[status]++;
        }
    });

    // Re-render both charts
    renderLeadSourcesChart(sourceCounts);
    renderPipelineFunnelChart(funnelCounts);
}
```

---

## 8. Verification & Validation Protocol

To independently verify the implementation:

| Test Case | Scenario | Expected Result |
|---|---|---|
| **V1: Chart Initialization** | Standard dashboard page load with sample leads | Both charts render cleanly with luxury colors, 72% cutout on Doughnut, gold-to-emerald gradient on Bar chart, and center inquiries total. |
| **V2: Malformed / Empty JSON** | `chartData` passed as `"{}"`, `null`, or invalid JSON | No JavaScript crash; charts gracefully display fallback empty states ("No Sources Yet" ring, 0-value bars). |
| **V3: XSS Resistance** | Source string with `<script>alert(1)</script>` or quotes | `<script id="crm-chart-payload">` escapes tags (`\u003c`), JSON parsed safely without script injection. |
| **V4: Dynamic AJAX Recalculation** | Single or bulk delete lead card | Card animates out, `refreshAnalyticsFromDOM()` fires, Doughnut slices and Funnel bars smoothly animate down. |
| **V5: Responsive Resize** | Window resized from 1440px to 375px mobile | Canvas elements automatically resize within fixed 260px container without layout overflowing or clipping. |
