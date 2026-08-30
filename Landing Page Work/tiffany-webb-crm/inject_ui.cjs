const fs = require('fs');
let content = fs.readFileSync('D:\\\\FREELANCE\\\\TIFFANY WEB\\\\Landing Page Work\\\\tiffany-webb-crm\\\\views\\\\dashboard.ejs', 'utf8');

const newCss = `
        /* NEW PREMIUM UI CLASSES */
        .premium-nav {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 2.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            padding-bottom: 0;
            overflow-x: auto;
            scrollbar-width: none; /* Firefox */
        }
        .premium-nav::-webkit-scrollbar { display: none; } /* Chrome */

        .premium-tab {
            position: relative;
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.4);
            font-family: var(--font-sans);
            font-weight: 600;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 1rem 1.25rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: color 0.2s ease;
        }

        .premium-tab:hover {
            color: rgba(255, 255, 255, 0.8);
        }

        .premium-tab.active {
            color: var(--color-gold, #c29545);
        }

        .premium-tab.active::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 10%;
            width: 80%;
            height: 2px;
            background: var(--color-gold, #c29545);
            border-radius: 2px;
            box-shadow: 0 -2px 10px rgba(194, 149, 69, 0.5);
        }

        .premium-badge {
            background: rgba(255,255,255,0.08);
            color: rgba(242, 239, 233, 0.7);
            font-size: 0.7rem;
            font-weight: 700;
            padding: 0.15rem 0.5rem;
            border-radius: 9999px;
            transition: all 0.2s ease;
        }

        .premium-tab.active .premium-badge {
            background: rgba(194, 149, 69, 0.15);
            color: var(--color-gold, #c29545);
        }

        .glass-card {
            background: rgba(15, 15, 15, 0.4);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 16px;
            padding: 1.5rem;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            cursor: pointer;
            text-decoration: none;
            display: block;
        }

        .glass-card:hover {
            background: rgba(20, 20, 20, 0.6);
            border-color: rgba(194, 149, 69, 0.3);
            transform: translateY(-4px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2), 0 0 20px rgba(194, 149, 69, 0.05);
        }

        .gc-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.75rem;
        }

        .gc-title {
            font-family: var(--font-serif);
            font-size: 2rem;
            color: var(--color-ivory, #fff);
            margin: 0;
            line-height: 1;
        }

        .gc-date {
            font-family: var(--font-mono, monospace);
            font-size: 0.75rem;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.3);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .gc-org {
            font-family: var(--font-sans);
            font-size: 0.95rem;
            color: rgba(255, 255, 255, 0.6);
            margin: 0 0 1.5rem 0;
        }

        .gc-footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding-top: 1rem;
        }

        .gc-tag {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.3rem 0.75rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 6px;
        }

        .gc-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #60a5fa;
            box-shadow: 0 0 8px rgba(96, 165, 250, 0.6);
        }

        .gc-tag-text {
            font-family: var(--font-mono, monospace);
            font-size: 0.7rem;
            font-weight: 600;
            color: #93c5fd;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }

        .gc-arrow {
            color: var(--color-gold, #c29545);
            opacity: 0;
            transition: opacity 0.3s ease, transform 0.3s ease;
            transform: translateX(-10px);
        }

        .glass-card:hover .gc-arrow {
            opacity: 1;
            transform: translateX(0);
        }

        .btn-ghost-danger {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.85rem;
            font-weight: 500;
            font-family: var(--font-sans);
            color: rgba(248, 113, 113, 0.7);
            background: rgba(239, 68, 68, 0.05);
            border: 1px solid rgba(239, 68, 68, 0.1);
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-ghost-danger:hover {
            color: rgba(248, 113, 113, 1);
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.2);
        }
`;

content = content.replace('</style>', newCss + '\n    </style>');

// Now replace the HTML part
const oldNavbarStr = `<div class="status-navbar" style="display: flex; gap: 1rem; margin-bottom: 2rem; padding: 1rem; overflow-x: auto; background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);">
            <% 
            const statuses = ['new', 'contacted', 'qualified', 'proposal_sent', 'booked', 'completed', 'declined', 'lost'];
            statuses.forEach((status, i) => { 
                const count = leads.filter(l => l.status === status).length;
            %>
                <button id="tab-btn-<%= status %>" class="tab-btn <%= i === 0 ? 'active' : '' %>" onclick="showTab('<%= status %>')" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: var(--color-gold); border: none; color: var(--color-ink); font-weight: 600; font-family: var(--font-sans); text-transform: capitalize; cursor: pointer; padding: 0.4rem 1rem; border-radius: 6px; white-space: nowrap; transition: all 0.2s; opacity: <%= i === 0 ? '1' : '0.5' %>; box-shadow: <%= i === 0 ? '0 4px 12px rgba(194, 149, 69, 0.3)' : 'none' %>;">
                    <%= status.replace('_', ' ') %>
                    <span class="column-count" style="background: #f1f5f9; color: #334155; font-size: 0.75rem; font-weight: 700; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; padding: 0; margin: 0;"><%= count %></span>
                </button>
            <% }) %>
        </div>`;

const newNavbarStr = `<div class="premium-nav">
            <% 
            const statuses = ['new', 'contacted', 'qualified', 'proposal_sent', 'booked', 'completed', 'declined', 'lost'];
            statuses.forEach((status, i) => { 
                const count = leads.filter(l => l.status === status).length;
            %>
                <button id="tab-btn-<%= status %>" class="premium-tab tab-btn <%= i === 0 ? 'active' : '' %>" onclick="showTab('<%= status %>')">
                    <%= status.replace('_', ' ') %>
                    <span class="premium-badge"><%= count %></span>
                </button>
            <% }) %>
        </div>`;

content = content.replace(oldNavbarStr, newNavbarStr);


// Replace the column header
const oldColHeader = `<div class="column-header" style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <h3 class="column-title" style="margin: 0;"><%= status.replace('_', ' ') %> Leads</h3>
                        </div>
                        <% if (colLeads.length > 0) { %>
                            <button onclick="bulkDelete('<%= status %>')" class="btn-danger">Delete all</button>
                        <% } %>
                    </div>`;

const newColHeader = `<div class="column-header" style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;">
                        <div>
                            <h3 style="font-family: var(--font-serif); font-size: 3rem; color: var(--color-ivory); margin: 0; line-height: 1;"><%= status.replace('_', ' ') %> Leads</h3>
                            <p style="color: rgba(255,255,255,0.4); margin: 0.5rem 0 0 0; font-size: 0.85rem;">Manage and track <%= status.replace('_', ' ') %> inquiries.</p>
                        </div>
                        <% if (colLeads.length > 0) { %>
                            <button onclick="bulkDelete('<%= status %>')" class="btn-ghost-danger">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                Delete All
                            </button>
                        <% } %>
                    </div>`;

content = content.replaceAll(oldColHeader, newColHeader);

// Replace the card
const oldCard = `<div class="card" data-search="<%= (lead.contact_name || '') + ' ' + (lead.email || '') + ' ' + (lead.phone || '') + ' ' + (lead.organization_name || '') %>" onclick="window.location.href='/lead/<%= lead.id %>'">
                                    <p class="card-name"><%= lead.contact_name || lead.phone || 'Unknown Lead' %></p>
                                    <p class="card-org"><%= lead.organization_name || 'No Organization' %></p>
                                    <div class="card-footer">
                                        <span class="badge <%= lead.source %>"><%= lead.source.replace('_', ' ') %></span>
                                        <span class="card-date"><%= lead.event_date ? new Date(lead.event_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'TBD' %></span>
                                    </div>
                                </div>`;

const newCard = `<div class="glass-card" data-search="<%= (lead.contact_name || '') + ' ' + (lead.email || '') + ' ' + (lead.phone || '') + ' ' + (lead.organization_name || '') %>" onclick="window.location.href='/lead/<%= lead.id %>'">
                                    <div class="gc-header">
                                        <h3 class="gc-title"><%= lead.contact_name || lead.phone || 'Unknown Lead' %></h3>
                                        <span class="gc-date"><%= lead.event_date ? new Date(lead.event_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'TBD' %></span>
                                    </div>
                                    <p class="gc-org"><%= lead.organization_name || 'No Organization' %></p>
                                    
                                    <div class="gc-footer">
                                        <div class="gc-tag">
                                            <span class="gc-dot"></span>
                                            <span class="gc-tag-text"><%= lead.source.replace('_', ' ') %></span>
                                        </div>
                                        <div class="gc-arrow">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                        </div>
                                    </div>
                                </div>`;

content = content.replaceAll(oldCard, newCard);

fs.writeFileSync('D:\\\\FREELANCE\\\\TIFFANY WEB\\\\Landing Page Work\\\\tiffany-webb-crm\\\\views\\\\dashboard.ejs', content);
console.log('Injected new premium UI!');
