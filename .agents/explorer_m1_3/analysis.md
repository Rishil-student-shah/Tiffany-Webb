# Client-Side JavaScript Architecture Specification: Zero-Reload AJAX Dashboard

**Agent:** `explorer_m1_3`  
**Milestone:** M1 — Full Dashboard UI/UX & AJAX Redesign  
**Target View:** `Landing Page Work/tiffany-webb-crm/views/dashboard.ejs`  
**Date:** 2026-08-30  

---

## 1. Executive Summary & Problem Diagnosis

The current implementation of `views/dashboard.ejs` suffers from severe client-side JavaScript breakages, clunky page reloads, and jarring DOM mutations:

1. **Broken Search Selectors & Runtime TypeErrors:**
   - Lines 1127–1150 in `views/dashboard.ejs` query `.kanban-board .card` and `.kanban-wrapper`.
   - In actual DOM markup, cards are rendered as `.glass-card` within `#kanban-wrapper.tab-content-wrapper`.
   - Consequently, `performSearch()` searches 0 cards, and `clearSearch()` attempts `kanbanWrapper.style.display = 'block'` where `kanbanWrapper` is `null`, throwing an unhandled `TypeError`.
   - No debouncing exists; typing triggers either no action or clunky full resets.

2. **Forced Full-Page Reloads on Deletions:**
   - Bulk deletion (`bulkDelete()`) calls `fetch('/api/leads/bulk-delete')` and immediately invokes `window.location.reload()`, destroying application state and scroll position.
   - Single lead deletion is absent from lead cards on the dashboard, requiring navigation to `/lead/:id` and a form POST that redirects back to `/dashboard`.

3. **Abrupt Tab Pane Switching:**
   - `showTab()` abruptly toggles inline `style.display = 'none'` / `'block'` without animation, leading to layout snapping and a disjointed user experience.

4. **Lack of Feedback Architecture:**
   - Success and error states rely entirely on server-rendered query string banners (`?success=...`, `?error=...`) or native browser `alert()` popups.

This document specifies the complete **Zero-Reload AJAX Architecture** for `views/dashboard.ejs`, including:
- **Instant 200ms Debounced Live Search** with multi-term token matching and empty-state feedback.
- **Smooth Animated Status Tab Navigation** with cross-fade/slide-up transitions, active gold indicators, and URL state sync.
- **Smooth AJAX Card Exit Animations** for single and bulk deletions with real-time KPI and badge counter reconciliation.
- **Lightweight Luxury Toast Notification System** in Gold/Ivory/Emerald/Burnt tones.

---

## 2. Architectural Overview & State Machine

```
                              ┌──────────────────────────────────────┐
                              │         CRM State Manager            │
                              │ - activeTab: 'new' | 'contacted'...  │
                              │ - searchQuery: string                │
                              │ - leadCounters: { [status]: count }  │
                              │ - kpiCounters: { total, new, etc. }  │
                              └──────────────────┬───────────────────┘
                                                 │
            ┌────────────────────────────────────┼────────────────────────────────────┐
            ▼                                    ▼                                    ▼
┌───────────────────────┐            ┌───────────────────────┐            ┌───────────────────────┐
│   Live Search Engine  │            │  Status Tab Switcher  │            │  AJAX Deletion Engine │
│ - 200ms Debounce      │            │ - Cross-Fade / Slide  │            │ - Fetch API Requests  │
│ - Multi-Token Match   │            │ - Active Gold Capsule │            │ - Exit Keyframe Anim  │
│ - In-Place Visibility │            │ - URL Sync (?status=) │            │ - Counter Decrements  │
│ - Empty Banner State  │            │ - ARIA Accessibility  │            │ - Chart Re-calc Hooks │
└───────────┬───────────┘            └───────────┬───────────┘            └───────────┬───────────┘
            │                                    │                                    │
            └────────────────────────────────────┼────────────────────────────────────┘
                                                 ▼
                              ┌──────────────────────────────────────┐
                              │       Luxury Toast Dispatcher        │
                              │ - Success (Emerald/Gold)             │
                              │ - Error (Burnt Terracotta)           │
                              │ - Auto-Dismiss Progress Bar          │
                              └──────────────────────────────────────┘
```

---

## 3. Detailed Component Specifications

### 3.1 Live Debounced Search Architecture

#### DOM Contract & Data Attributes
Every lead card in `views/dashboard.ejs` must be rendered with standard data attributes:
```html
<div class="lead-card group relative ..." 
     data-lead-card="true" 
     data-lead-id="<%= lead.id %>" 
     data-lead-status="<%= lead.status %>"
     data-lead-name="<%= lead.contact_name || '' %>"
     data-lead-email="<%= lead.email || '' %>"
     data-lead-phone="<%= lead.phone || '' %>"
     data-lead-org="<%= lead.organization_name || '' %>"
     data-lead-source="<%= lead.source || '' %>"
     data-search="<%= [
       lead.contact_name, 
       lead.email, 
       lead.phone, 
       lead.organization_name, 
       lead.source ? lead.source.replace('_', ' ') : '', 
       lead.event_type
     ].filter(Boolean).join(' ').toLowerCase() %>">
  <!-- Card Content -->
</div>
```

#### Search Algorithm & Token Matching
- The user query is trimmed, converted to lower-case, and split by whitespace into individual search tokens:
  ```javascript
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  ```
- A lead card matches if **every** token is present in its `data-search` attribute:
  ```javascript
  const isMatch = tokens.every(token => cardSearchString.includes(token));
  ```
- This enables powerful multi-field queries such as `"Corporate Tiffany"` or `"555 Wedding"`.

#### In-Place Card Visibility & Empty State
- Matching cards stay visible; non-matching cards receive class `is-search-hidden`:
  ```css
  .is-search-hidden {
    display: none !important;
  }
  ```
- **Active Tab Counter Update**: When filtering, calculate visible matches within the currently active status tab:
  ```javascript
  const visibleCardsInTab = activePane.querySelectorAll('[data-lead-card]:not(.is-search-hidden)').length;
  ```
- **Empty State Banner**: If `visibleCardsInTab === 0` and `totalCardsInTab > 0`:
  - Show `#tab-search-empty-${status}` containing:
    - Fraunces serif headline: *"No Matching Leads Found"*
    - Text: *"No inquiries in <%= status %> match '${query}'"*
    - Action button: *"Clear Search"*

---

### 3.2 Smooth Status Tabs Architecture

#### 8 Pipeline Stages
`new` (New Inquiry), `contacted` (Contacted), `qualified` (Qualified), `proposal_sent` (Proposal Sent), `booked` (Booked), `completed` (Completed), `declined` (Declined), `lost` (Lost).

#### State Transition Lifecycle (Fade-In + Slide-Up)
1. **User Interaction**: Click on `#tab-btn-${status}` or call `switchTab(status)`.
2. **Button State**:
   - Deactivate all tab buttons: remove `text-[#C8A24C]`, `bg-[#C8A24C]/10`, `border-[#C8A24C]`; add `text-ivory/60 hover:text-ivory`.
   - Activate selected tab button: add `text-[#C8A24C]`, `bg-[#C8A24C]/10`, `border-[#C8A24C]`, `shadow-[0_0_15px_rgba(200,162,76,0.15)]`.
   - Update ARIA attributes (`aria-selected="true"`).
3. **Pane Transition**:
   - Currently active pane starts exit animation: `opacity: 0; transform: translateY(-4px); transition: all 120ms ease-in;`.
   - After 120ms: Set old pane to `display: none`.
   - Set target pane to `display: block; opacity: 0; transform: translateY(8px);`.
   - In next animation frame (`requestAnimationFrame`): Set target pane to `opacity: 1; transform: translateY(0); transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);`.
4. **URL Synchronization**:
   - Update browser URL query without reloading: `history.replaceState(null, '', '?status=' + status)`.
5. **Search Query Retention**:
   - If `#searchInput` contains an active query, immediately evaluate card visibility in the newly revealed pane.

---

### 3.3 Smooth AJAX Deletions Architecture

#### 1. Single Lead Card Deletion
- **Trigger**: Luxury trash icon button on each lead card:
  ```html
  <button type="button" 
          class="lead-delete-btn p-1.5 rounded-lg text-ivory/40 hover:text-burnt hover:bg-burnt/10 transition-colors"
          data-lead-id="<%= lead.id %>" 
          data-lead-name="<%= lead.contact_name || 'Inquiry' %>" 
          data-lead-status="<%= lead.status %>"
          onclick="handleSingleLeadDelete(event, '<%= lead.id %>', '<%= lead.status %>', '<%= (lead.contact_name || 'Inquiry').replace(/'/g, \"\\'\") %>')"
          title="Delete Lead">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
  </button>
  ```
- **Modal Confirmation**:
  - Open luxury confirmation modal `#crmConfirmModal` with customized copy: *"Are you sure you want to permanently delete lead for **[Lead Name]**?"*
- **Asynchronous Execution & Animation**:
  ```javascript
  // 1. Inflight UI protection
  cardElement.classList.add('is-deleting');

  // 2. Network Request
  const response = await fetch(`/lead/${leadId}/delete`, {
      method: 'POST',
      headers: { 'Accept': 'application/json, text/html' }
  });

  if (!response.ok) throw new Error('Deletion failed on server');

  // 3. Smooth DOM Exit Animation
  cardElement.classList.add('card-exit-animation');

  // 4. Cleanup after animation (350ms)
  setTimeout(() => {
      cardElement.remove();
      decrementTabBadge(status);
      decrementKpiMetrics(status);
      checkTabEmptyState(status);
      window.refreshAnalyticsFromDOM?.();
      CRMToast.success(`Lead for "${leadName}" was removed.`);
  }, 350);
  ```

#### 2. Bulk Lead Deletion
- **Triggers**:
  - Global "Delete All Leads" in action bar (`bulkDelete('all')`).
  - Pane-specific "Delete All" in status column header (`bulkDelete(status)`).
- **Confirmation Modal**:
  - Modal `#crmConfirmModal` displays warning badge and explicit impact description.
- **Asynchronous Execution & Batch Animation**:
  ```javascript
  const response = await fetch('/api/leads/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || 'Bulk deletion failed');

  // Staggered exit animation across matching cards
  const targetCards = status === 'all' 
      ? document.querySelectorAll('[data-lead-card]') 
      : document.querySelectorAll(`#tab-pane-${status} [data-lead-card]`);

  targetCards.forEach((card, index) => {
      setTimeout(() => {
          card.classList.add('card-exit-animation');
      }, Math.min(index * 20, 200));
  });

  setTimeout(() => {
      targetCards.forEach(c => c.remove());
      if (status === 'all') {
          document.querySelectorAll('.tab-badge-count').forEach(b => b.textContent = '0');
          resetAllKpiMetrics();
          statuses.forEach(s => checkTabEmptyState(s));
      } else {
          setTabBadgeCount(status, 0);
          recalculateKpisAfterBulk(status);
          checkTabEmptyState(status);
      }
      window.refreshAnalyticsFromDOM?.();
      CRMToast.success(data.message || 'Leads deleted successfully.');
  }, 400);
  ```

---

### 3.4 Luxury Toast Notification System

#### Specification
- Standalone vanilla JS singleton `window.CRMToast`.
- Positioned in bottom-right viewport (`fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none`).
- Master Design System alignment:
  - Background: Deep Ink `#14130E` (96% opacity) with `backdrop-blur-xl`.
  - Border: 1px `rgba(251, 246, 234, 0.12)`.
  - Inner top specular highlight: `inset 0 1px 0 rgba(251, 246, 234, 0.15)`.
  - Text: Warm Ivory `#FBF6EA`.
  - Fonts: Space Mono for category pill, Inter for message.
  - Progress bar: 2px colored progress line indicating remaining display time.

#### Semantic Color Tokens
| Variant | Accent Hex | Border Color | Icon |
|---|---|---|---|
| `success` | `#0E6B54` (Emerald) / `#C8A24C` (Gold) | `rgba(14, 107, 84, 0.4)` | Circular Checkmark |
| `error` | `#C15427` (Burnt Terracotta) | `rgba(193, 84, 39, 0.5)` | Hexagonal Alert |
| `info` | `#1C6E7A` (Teal Blue) | `rgba(28, 110, 122, 0.4)` | Info Circle |
| `warning` | `#D9A23A` (Mustard Gold) | `rgba(217, 162, 58, 0.4)` | Triangle Warning |

---

## 4. Production-Ready Client-Side JavaScript Code

Below is the complete, drop-in client-side JavaScript architecture to be placed inside `views/dashboard.ejs` before `</body>`:

```html
<!-- LUXURY CONFIRMATION MODAL -->
<div id="crmConfirmModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md opacity-0 pointer-events-none transition-opacity duration-200" role="dialog" aria-modal="true">
    <div class="relative w-full max-w-md bg-[#14130E] border border-ivory/15 rounded-2xl p-6 shadow-2xl transform scale-95 transition-transform duration-200" id="crmConfirmModalCard">
        <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-xl bg-burnt/15 border border-burnt/30 flex items-center justify-center flex-shrink-0 text-burnt" id="crmConfirmModalIcon">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
            </div>
            <div class="flex-1">
                <h3 class="font-serif text-xl font-semibold text-ivory tracking-wide" id="crmConfirmModalTitle">Confirm Action</h3>
                <p class="mt-2 text-sm text-ivory/70 leading-relaxed font-sans" id="crmConfirmModalMessage">Are you sure you want to proceed?</p>
            </div>
        </div>
        <div class="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-ivory/10">
            <button type="button" id="crmConfirmCancelBtn" class="px-4 py-2 rounded-xl text-sm font-sans text-ivory/80 hover:text-ivory hover:bg-white/5 transition-all">Cancel</button>
            <button type="button" id="crmConfirmActionBtn" class="px-5 py-2 rounded-xl text-sm font-sans font-medium bg-burnt hover:bg-[#a33f18] text-white shadow-lg shadow-burnt/20 transition-all">Delete</button>
        </div>
    </div>
</div>

<!-- TOAST CONTAINER -->
<div id="crmToastContainer" class="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full" aria-live="polite"></div>

<!-- STYLES FOR ANIMATIONS -->
<style>
    /* Card Exit Smooth Slide and Scale Collapse */
    .card-exit-animation {
        transform: scale(0.92) translateY(10px) !important;
        opacity: 0 !important;
        max-height: 0 !important;
        margin-top: 0 !important;
        margin-bottom: 0 !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
        border-width: 0 !important;
        overflow: hidden !important;
        pointer-events: none !important;
        transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    
    .card-enter-animation {
        animation: cardEnter 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    
    @keyframes cardEnter {
        from {
            opacity: 0;
            transform: translateY(12px) scale(0.97);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    
    .is-search-hidden {
        display: none !important;
    }
</style>

<!-- CLIENT SCRIPT -->
<script>
(() => {
    'use strict';

    /* ==========================================================================
       1. LUXURY TOAST NOTIFICATION ENGINE
       ========================================================================== */
    const Toast = {
        container: document.getElementById('crmToastContainer'),
        
        show(message, type = 'success', duration = 4000) {
            if (!this.container) return;
            
            const toast = document.createElement('div');
            toast.className = 'pointer-events-auto flex flex-col relative overflow-hidden bg-[#14130E]/95 border rounded-xl shadow-2xl backdrop-blur-xl p-4 text-ivory text-sm transform transition-all duration-300 ease-out translate-y-4 opacity-0 scale-95';
            
            let borderColor = 'border-gold/30';
            let iconSvg = '';
            let typeLabel = 'SYSTEM';
            let labelColor = 'text-gold';
            let progressBg = 'bg-gold';
            
            if (type === 'success') {
                borderColor = 'border-emerald/40';
                labelColor = 'text-emerald';
                progressBg = 'bg-emerald';
                typeLabel = 'SUCCESS';
                iconSvg = `<svg class="w-4 h-4 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`;
            } else if (type === 'error') {
                borderColor = 'border-burnt/50';
                labelColor = 'text-burnt';
                progressBg = 'bg-burnt';
                typeLabel = 'ALERT';
                iconSvg = `<svg class="w-4 h-4 text-burnt" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
            } else if (type === 'warning') {
                borderColor = 'border-mustard/40';
                labelColor = 'text-mustard';
                progressBg = 'bg-mustard';
                typeLabel = 'WARNING';
                iconSvg = `<svg class="w-4 h-4 text-mustard" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
            } else {
                borderColor = 'border-teal-blue/40';
                labelColor = 'text-teal-blue';
                progressBg = 'bg-teal-blue';
                typeLabel = 'NOTICE';
                iconSvg = `<svg class="w-4 h-4 text-teal-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
            }
            
            toast.classList.add(borderColor);
            
            toast.innerHTML = `
                <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-2">
                        <div class="p-1 rounded-md bg-white/5 border border-white/10 flex-shrink-0">${iconSvg}</div>
                        <span class="font-mono text-[10px] tracking-wider uppercase ${labelColor} font-semibold">${typeLabel}</span>
                    </div>
                    <button type="button" class="text-ivory/40 hover:text-ivory transition-colors text-base leading-none">&times;</button>
                </div>
                <div class="mt-2 text-ivory/90 font-sans text-sm leading-snug">${message}</div>
                <div class="absolute bottom-0 left-0 h-[2px] w-full bg-white/5">
                    <div class="h-full ${progressBg} transition-all duration-[${duration}ms] ease-linear w-full toast-progress-bar"></div>
                </div>
            `;
            
            const closeBtn = toast.querySelector('button');
            closeBtn.addEventListener('click', () => dismiss());
            
            this.container.appendChild(toast);
            
            // Trigger entry transition
            requestAnimationFrame(() => {
                toast.classList.remove('translate-y-4', 'opacity-0', 'scale-95');
                toast.classList.add('translate-y-0', 'opacity-100', 'scale-100');
                const bar = toast.querySelector('.toast-progress-bar');
                if (bar) {
                    bar.style.transition = `width ${duration}ms linear`;
                    bar.style.width = '0%';
                }
            });
            
            let dismissed = false;
            const dismiss = () => {
                if (dismissed) return;
                dismissed = true;
                toast.classList.add('opacity-0', 'translate-x-6', 'scale-95');
                setTimeout(() => toast.remove(), 300);
            };
            
            const timer = setTimeout(dismiss, duration);
            toast.addEventListener('mouseenter', () => clearTimeout(timer));
        },
        success(msg, d) { this.show(msg, 'success', d); },
        error(msg, d) { this.show(msg, 'error', d); },
        warning(msg, d) { this.show(msg, 'warning', d); },
        info(msg, d) { this.show(msg, 'info', d); }
    };
    window.CRMToast = Toast;

    /* ==========================================================================
       2. LUXURY CONFIRMATION MODAL PROMISE
       ========================================================================== */
    const modalEl = document.getElementById('crmConfirmModal');
    const modalContent = document.getElementById('crmConfirmModalCard');
    const modalTitle = document.getElementById('crmConfirmModalTitle');
    const modalMsg = document.getElementById('crmConfirmModalMessage');
    const confirmBtn = document.getElementById('crmConfirmActionBtn');
    const cancelBtn = document.getElementById('crmConfirmCancelBtn');

    function confirmDialog({ title, message, confirmText = 'Delete', isDanger = true }) {
        return new Promise((resolve) => {
            if (!modalEl) {
                resolve(window.confirm(message));
                return;
            }

            modalTitle.textContent = title || 'Confirm Action';
            modalMsg.innerHTML = message || 'Are you sure you want to continue?';
            confirmBtn.textContent = confirmText;
            
            if (isDanger) {
                confirmBtn.className = 'px-5 py-2 rounded-xl text-sm font-sans font-medium bg-burnt hover:bg-[#a33f18] text-white shadow-lg shadow-burnt/20 transition-all';
            } else {
                confirmBtn.className = 'px-5 py-2 rounded-xl text-sm font-sans font-medium bg-gold hover:bg-[#b08b3b] text-ink shadow-lg shadow-gold/20 transition-all';
            }

            modalEl.classList.remove('opacity-0', 'pointer-events-none');
            modalEl.classList.add('opacity-100', 'pointer-events-auto');
            modalContent.classList.remove('scale-95');
            modalContent.classList.add('scale-100');

            const handleConfirm = () => { cleanup(); resolve(true); };
            const handleCancel = () => { cleanup(); resolve(false); };
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') handleCancel();
            };

            function cleanup() {
                modalEl.classList.remove('opacity-100', 'pointer-events-auto');
                modalEl.classList.add('opacity-0', 'pointer-events-none');
                modalContent.classList.remove('scale-100');
                modalContent.classList.add('scale-95');
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', handleCancel);
                window.removeEventListener('keydown', handleKeyDown);
            }

            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', handleCancel);
            window.addEventListener('keydown', handleKeyDown);
        });
    }

    /* ==========================================================================
       3. LIVE DEBOUNCED SEARCH ENGINE
       ========================================================================== */
    const searchInput = document.getElementById('searchInput');
    const searchClearBtn = document.getElementById('searchClearBtn');
    let searchDebounceTimer = null;

    function applySearchFilter() {
        const query = (searchInput?.value || '').trim().toLowerCase();
        const tokens = query.split(/\s+/).filter(Boolean);
        const allCards = document.querySelectorAll('[data-lead-card]');
        
        let totalMatches = 0;

        allCards.forEach(card => {
            const searchData = (card.getAttribute('data-search') || '').toLowerCase();
            const matches = tokens.length === 0 || tokens.every(token => searchData.includes(token));
            
            if (matches) {
                card.classList.remove('is-search-hidden');
                totalMatches++;
            } else {
                card.classList.add('is-search-hidden');
            }
        });

        // Toggle clear icon
        if (searchClearBtn) {
            searchClearBtn.style.display = tokens.length > 0 ? 'flex' : 'none';
        }

        // Update active tab visible counters and empty search states
        const activeTabBtn = document.querySelector('.tab-btn.active');
        const activeStatus = activeTabBtn?.getAttribute('data-status') || 'new';
        updateTabEmptyStates(activeStatus, tokens.length > 0);
    }

    function updateTabEmptyStates(status, isSearching) {
        const pane = document.getElementById(`tab-pane-${status}`);
        if (!pane) return;

        const totalCards = pane.querySelectorAll('[data-lead-card]').length;
        const visibleCards = pane.querySelectorAll('[data-lead-card]:not(.is-search-hidden)').length;
        
        const standardEmpty = pane.querySelector('.standard-empty-state');
        const searchEmpty = pane.querySelector('.search-empty-state');

        if (totalCards === 0) {
            if (standardEmpty) standardEmpty.style.display = 'block';
            if (searchEmpty) searchEmpty.style.display = 'none';
        } else if (visibleCards === 0 && isSearching) {
            if (standardEmpty) standardEmpty.style.display = 'none';
            if (searchEmpty) searchEmpty.style.display = 'block';
        } else {
            if (standardEmpty) standardEmpty.style.display = 'none';
            if (searchEmpty) searchEmpty.style.display = 'none';
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(searchDebounceTimer);
            searchDebounceTimer = setTimeout(applySearchFilter, 200);
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                applySearchFilter();
                searchInput.blur();
            } else if (e.key === 'Enter') {
                clearTimeout(searchDebounceTimer);
                applySearchFilter();
            }
        });
    }

    if (searchClearBtn) {
        searchClearBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                applySearchFilter();
                searchInput.focus();
            }
        });
    }

    // Global keyboard shortcut '/' to focus search
    window.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== searchInput && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
            e.preventDefault();
            searchInput?.focus();
        }
    });

    /* ==========================================================================
       4. ANIMATED STATUS TAB SWITCHING
       ========================================================================== */
    window.switchTab = function(targetStatus) {
        const activeBtn = document.querySelector('.tab-btn.active');
        const currentStatus = activeBtn?.getAttribute('data-status');
        if (currentStatus === targetStatus) return;

        const allButtons = document.querySelectorAll('.tab-btn');
        const nextBtn = document.getElementById(`tab-btn-${targetStatus}`);
        const currentPane = document.getElementById(`tab-pane-${currentStatus}`);
        const nextPane = document.getElementById(`tab-pane-${targetStatus}`);

        if (!nextPane) return;

        // 1. Update Tab Button Styles
        allButtons.forEach(btn => {
            btn.classList.remove('active', 'border-[#C8A24C]', 'bg-[#C8A24C]/10', 'text-[#C8A24C]', 'shadow-[0_0_15px_rgba(200,162,76,0.15)]');
            btn.classList.add('text-ivory/60', 'hover:text-ivory', 'border-transparent');
            btn.setAttribute('aria-selected', 'false');
        });

        if (nextBtn) {
            nextBtn.classList.add('active', 'border-[#C8A24C]', 'bg-[#C8A24C]/10', 'text-[#C8A24C]', 'shadow-[0_0_15px_rgba(200,162,76,0.15)]');
            nextBtn.classList.remove('text-ivory/60', 'border-transparent');
            nextBtn.setAttribute('aria-selected', 'true');
        }

        // 2. Animate Panes
        if (currentPane) {
            currentPane.style.transition = 'opacity 120ms ease-in, transform 120ms ease-in';
            currentPane.style.opacity = '0';
            currentPane.style.transform = 'translateY(-4px)';

            setTimeout(() => {
                currentPane.style.display = 'none';
                revealNextPane();
            }, 120);
        } else {
            revealNextPane();
        }

        function revealNextPane() {
            nextPane.style.display = 'block';
            nextPane.style.opacity = '0';
            nextPane.style.transform = 'translateY(8px)';
            
            requestAnimationFrame(() => {
                nextPane.style.transition = 'opacity 200ms cubic-bezier(0.16, 1, 0.3, 1), transform 200ms cubic-bezier(0.16, 1, 0.3, 1)';
                nextPane.style.opacity = '1';
                nextPane.style.transform = 'translateY(0)';
            });

            // Update URL query state without refresh
            history.replaceState(null, '', `?status=${targetStatus}`);

            // Re-apply search filter to newly activated tab
            const isSearching = (searchInput?.value || '').trim().length > 0;
            updateTabEmptyStates(targetStatus, isSearching);
        }
    };

    /* ==========================================================================
       5. COUNTER & METRIC RECONCILERS
       ========================================================================== */
    function decrementTabBadge(status) {
        const badge = document.querySelector(`[data-tab-count="${status}"]`);
        if (badge) {
            const current = parseInt(badge.textContent, 10) || 0;
            badge.textContent = Math.max(0, current - 1);
        }
    }

    function setTabBadgeCount(status, count) {
        const badge = document.querySelector(`[data-tab-count="${status}"]`);
        if (badge) badge.textContent = count;
    }

    function decrementKpi(elementId) {
        const el = document.getElementById(elementId);
        if (el) {
            const val = parseInt(el.textContent, 10) || 0;
            el.textContent = Math.max(0, val - 1);
        }
    }

    function decrementKpiMetrics(status) {
        decrementKpi('kpi-total-leads');
        if (status === 'new') decrementKpi('kpi-new-leads');
        if (status === 'booked') decrementKpi('kpi-booked-leads');
        if (status === 'proposal_sent') decrementKpi('kpi-proposals-leads');
    }

    function resetAllKpiMetrics() {
        ['kpi-total-leads', 'kpi-new-leads', 'kpi-booked-leads', 'kpi-proposals-leads'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '0';
        });
    }

    function checkTabEmptyState(status) {
        const pane = document.getElementById(`tab-pane-${status}`);
        if (!pane) return;
        const remaining = pane.querySelectorAll('[data-lead-card]').length;
        const stdEmpty = pane.querySelector('.standard-empty-state');
        if (remaining === 0 && stdEmpty) {
            stdEmpty.style.display = 'block';
            stdEmpty.classList.add('card-enter-animation');
        }
    }

    /* ==========================================================================
       6. ZERO-RELOAD SINGLE LEAD DELETION
       ========================================================================== */
    window.handleSingleLeadDelete = async function(event, leadId, status, leadName) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }

        const confirmed = await confirmDialog({
            title: 'Delete Lead',
            message: `Are you sure you want to delete the inquiry for <strong class="text-ivory">${leadName}</strong>? All associated messages and activity history will be deleted.`,
            confirmText: 'Delete Lead',
            isDanger: true
        });

        if (!confirmed) return;

        const card = document.querySelector(`[data-lead-card][data-lead-id="${leadId}"]`);
        if (card) {
            card.classList.add('opacity-50', 'pointer-events-none');
        }

        try {
            const response = await fetch(`/lead/${leadId}/delete`, {
                method: 'POST',
                headers: { 'Accept': 'application/json, text/html' }
            });

            if (!response.ok) {
                throw new Error(`Server returned status ${response.status}`);
            }

            if (card) {
                card.classList.add('card-exit-animation');
                setTimeout(() => {
                    card.remove();
                    decrementTabBadge(status);
                    decrementKpiMetrics(status);
                    checkTabEmptyState(status);
                    window.refreshAnalyticsFromDOM?.();
                    Toast.success(`Inquiry for "${leadName}" deleted.`);
                }, 350);
            }
        } catch (err) {
            console.error('Delete error:', err);
            if (card) {
                card.classList.remove('opacity-50', 'pointer-events-none');
            }
            Toast.error('Could not delete lead. Please check network connection.');
        }
    };

    /* ==========================================================================
       7. ZERO-RELOAD BULK DELETION
       ========================================================================== */
    window.bulkDelete = async function(status) {
        const isAll = status === 'all';
        const formattedStatus = status.replace('_', ' ');

        const confirmed = await confirmDialog({
            title: isAll ? 'Delete All Leads' : `Delete All ${formattedStatus} Leads`,
            message: isAll 
                ? 'Are you sure you want to permanently delete <strong class="text-burnt">ALL LEADS</strong> in the CRM pipeline? This action cannot be undone.'
                : `Are you sure you want to delete all leads in the <strong class="text-ivory">${formattedStatus}</strong> stage?`,
            confirmText: 'Delete All',
            isDanger: true
        });

        if (!confirmed) return;

        try {
            const response = await fetch('/api/leads/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to delete leads');
            }

            // Find all affected cards
            const targetCards = isAll 
                ? document.querySelectorAll('[data-lead-card]') 
                : document.querySelectorAll(`#tab-pane-${status} [data-lead-card]`);

            // Apply staggered exit animation
            targetCards.forEach((card, idx) => {
                setTimeout(() => {
                    card.classList.add('card-exit-animation');
                }, Math.min(idx * 20, 250));
            });

            // Cleanup from DOM
            setTimeout(() => {
                targetCards.forEach(c => c.remove());

                if (isAll) {
                    document.querySelectorAll('[data-tab-count]').forEach(el => el.textContent = '0');
                    resetAllKpiMetrics();
                    ['new', 'contacted', 'qualified', 'proposal_sent', 'booked', 'completed', 'declined', 'lost'].forEach(checkTabEmptyState);
                } else {
                    setTabBadgeCount(status, 0);
                    // Recalculate KPIs based on status
                    const kpiTotal = document.getElementById('kpi-total-leads');
                    if (kpiTotal) {
                        const remainingTotal = document.querySelectorAll('[data-lead-card]').length;
                        kpiTotal.textContent = remainingTotal;
                    }
                    if (status === 'new') setKpiVal('kpi-new-leads', 0);
                    if (status === 'booked') setKpiVal('kpi-booked-leads', 0);
                    if (status === 'proposal_sent') setKpiVal('kpi-proposals-leads', 0);
                    checkTabEmptyState(status);
                }

                window.refreshAnalyticsFromDOM?.();
                Toast.success(data.message || 'Leads deleted successfully.');
            }, 400);

        } catch (err) {
            console.error('Bulk delete error:', err);
            Toast.error(err.message || 'Error communicating with the server.');
        }
    };

    function setKpiVal(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    }

    /* ==========================================================================
       8. INITIALIZATION & URL RESTORATION
       ========================================================================== */
    document.addEventListener('DOMContentLoaded', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const initialStatus = urlParams.get('status');
        if (initialStatus && document.getElementById(`tab-pane-${initialStatus}`)) {
            window.switchTab(initialStatus);
        }
    });

})();
</script>
```

---

## 5. Verification & Testing Matrix

| Scenario | Expected Behavior | Verification Step |
|---|---|---|
| **Live Debounced Search** | Typing filters cards across active tab within 200ms; typing `Escape` resets input; backspace to empty restores all cards | Type lead name in search bar; check that non-matching cards hide smoothly and no console errors occur. |
| **Search Empty State** | When 0 cards match search query in active tab, display luxury empty-search container | Type gibberish query (e.g. `xyz999`); verify `#tab-search-empty-${status}` appears with "Clear Search" CTA. |
| **Smooth Status Tabs** | Clicking tab fades out old pane and slides up new pane with active gold pill highlight | Click through all 8 tabs; verify smooth transitions and updated URL parameter `?status=...`. |
| **Single Lead Card Deletion** | Click trash icon -> modal confirmation -> `POST /lead/:id/delete` -> card collapses and disappears -> badge & KPI decrement -> success toast | Delete a single card; verify 0 page reloads and DOM badge/KPI decrements by 1. |
| **Bulk Lead Deletion** | Click "Delete All" in column -> modal confirmation -> `POST /api/leads/bulk-delete` -> staggered card collapse -> badge resets to 0 -> success toast | Bulk delete a stage; verify all cards in pane exit smoothly, badge reads 0, and toast confirms. |
| **Toast Notifications** | Toast slides in from bottom-right, displays semantic icon, runs countdown progress bar, auto-dismisses | Trigger delete; verify toast appears and auto-dismisses cleanly after 4 seconds. |
