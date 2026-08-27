const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');

const themeInjection = `
    <!-- INJECTED PREMIUM CRM THEME -->
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        /* CRM Sleek Ink & Multi-Color Theme */
        :root {
            --color-ink: #0a0a0a; /* Pure deep ink, zero green tint */
            --color-card: #141414; /* Sleek dark grey/black */
            --color-border: #262626; /* Neutral border */
            
            --color-gold: #c29545;
            --color-ivory: #ffffff; /* Bright white for maximum contrast */
            
            --color-terracotta: #a84747;
            --color-slate: #5b7994;
            --color-plum: #885794;
            --color-text-muted: #a3a3a3;
            
            --font-sans: 'Plus Jakarta Sans', 'Inter', sans-serif;
            --font-serif: 'Instrument Serif', serif;
        }

        body {
            background-color: #1A2721 !important; /* Deep Forest Sage */
            background-image: none !important;
            color: var(--color-ivory) !important;
            font-family: var(--font-sans) !important;
        }

        /* Target all common card classes AND any table wrappers */
        .stat-card, .card, .dashboard-card, .form-container, .panel, .cms-sidebar, .cms-main, .table-container, .pipeline-card, .pipeline-lead, .message-bubble.inbound, .chart-card, .login-card,
        div[style*="background: white"], div[style*="background-color: white"], div[style*="background: var(--color-card)"] {
            background: var(--color-card) !important;
            border: 1px solid var(--color-border) !important;
            backdrop-filter: none !important;
            color: var(--color-ivory) !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
            border-radius: 12px !important;
        }
        
        .message-bubble.outbound {
            background: rgba(194, 149, 69, 0.15) !important;
            border: 1px solid var(--color-gold) !important;
            color: var(--color-ivory) !important;
        }

        h1, h2, h3, h4, h5, h6, .stat-value {
            color: var(--color-ivory) !important;
        }
        
        .page-title {
            color: var(--color-ivory) !important; 
        }

        /* DISTINCT MULTI-COLOR GRADIENTS FOR CARDS (No single color) */
        .stat-card {
            border-top: none !important; /* Remove old solid border */
        }
        
        .stat-card:nth-child(1) {
            background: linear-gradient(135deg, #2b2212 0%, #141414 100%) !important;
            border: 1px solid #3d3119 !important;
        }
        .stat-card:nth-child(2) {
            background: linear-gradient(135deg, #2d1616 0%, #141414 100%) !important;
            border: 1px solid #401f1f !important;
        }
        .stat-card:nth-child(3) {
            background: linear-gradient(135deg, #172433 0%, #141414 100%) !important;
            border: 1px solid #203347 !important;
        }
        .stat-card:nth-child(4) {
            background: linear-gradient(135deg, #271a2b 0%, #141414 100%) !important;
            border: 1px solid #3a2640 !important;
        }

        /* Bright text values on the multi-color cards */
        .stat-card:nth-child(1) .stat-value { color: #f2c779 !important; }
        .stat-card:nth-child(2) .stat-value { color: #f28b8b !important; }
        .stat-card:nth-child(3) .stat-value { color: #8bbaf2 !important; }
        .stat-card:nth-child(4) .stat-value { color: #db93f2 !important; }
        
        /* Gradient background for chart cards (Not Black) */
        .chart-card {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
            border: 1px solid #334155 !important;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.4) !important;
        }

        /* Made labels pure Ivory so forms are easily readable! */
        .csv-box, .csv-box p, .csv-box span, .csv-box strong {
            color: var(--color-ivory) !important;
        }
        .csv-box {
            border-color: var(--color-border) !important;
            background: rgba(255, 255, 255, 0.02) !important;
        }
        .column-title {
            color: var(--color-gold) !important;
            font-family: var(--font-serif) !important;
            font-size: 1.5rem !important;
            letter-spacing: 0.02em;
        }
        .stat-label, .text-muted, .text-sm {
            color: var(--color-text-muted) !important;
        }
        p {
            color: var(--color-ivory) !important;
        }
        label {
            color: var(--color-ivory) !important;
            font-weight: 600 !important;
            margin-bottom: 0.5rem !important;
            display: block !important;
        }
        
        /* Form Tabs (Manual / CSV) Readability */
        .tab {
            color: var(--color-ivory) !important;
            border-bottom: 2px solid transparent !important;
        }
        .tab.active {
            color: var(--color-gold) !important;
            border-bottom-color: var(--color-gold) !important;
        }
        .tab:hover {
            color: var(--color-gold) !important;
            opacity: 0.8;
        }

        /* Pure Deep Ink for Navbar */
        .top-nav {
            background: #0a0a0a !important; /* Deep Ink */
            border-bottom: 1px solid #262626 !important; 
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8) !important;
        }
        
        /* Premium Deep Purple Gradient for the Search/Action Bar */
        .action-bar {
            background: linear-gradient(135deg, #2e1045 0%, #170824 100%) !important;
            border: 1px solid #5a2e7d !important; /* Subtle purple border */
            border-radius: 12px;
            padding: 1.25rem;
            margin-bottom: 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 10px 30px rgba(23, 8, 36, 0.5) !important;
        }
        
        .top-nav .nav-link {
            color: var(--color-ivory) !important;
        }
        .top-nav .nav-logo {
            color: var(--color-ivory) !important; /* White logo base */
        }
        
        .top-nav .nav-link:hover, .top-nav .nav-link.active {
            color: var(--color-gold) !important; /* Golden active link */
            text-shadow: none !important;
        }
        
        .top-nav .nav-logo span {
            color: var(--color-gold) !important; /* Golden CRM text */
            font-style: italic;
        }

        input, textarea, select {
            background: #050505 !important; 
            border: 1px solid var(--color-border) !important;
            color: var(--color-ivory) !important;
            font-family: var(--font-sans) !important;
            font-weight: 500 !important;
            border-radius: 8px !important;
        }

        input.search-input {
            border: 1px solid #d8b4e2 !important; /* Soft lavender border */
            background: rgba(0,0,0,0.3) !important;
            box-shadow: none !important; /* No neon */
            color: #fbf6ea !important;
        }

        input:focus, textarea:focus, select:focus {
            border-color: #d8b4e2 !important;
            outline: none !important;
            box-shadow: 0 0 0 3px rgba(216, 180, 226, 0.2) !important; /* Soft lavender focus */
        }

        /* Make date picker icon visible on dark background */
        input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(1) !important;
            cursor: pointer;
        }

        .btn, button, .button, input[type="submit"] {
            background: var(--color-gold) !important;
            color: #0a0a0a !important;
            font-weight: 700 !important;
            border: none !important;
            font-family: var(--font-sans) !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 12px rgba(194, 149, 69, 0.2) !important;
            transition: all 0.2s ease !important;
            cursor: pointer !important;
        }
        
        .btn:hover, button:hover, .button:hover, input[type="submit"]:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 16px rgba(194, 149, 69, 0.3) !important;
        }
        
        .btn-secondary, .btn-outline, a.btn-outline {
            background: transparent !important;
            border: 1px solid var(--color-gold) !important;
            color: var(--color-gold) !important;
            box-shadow: none !important;
        }

        /* Light Glowing Red Delete Buttons */
        .btn-danger, button.danger, button.delete, a.btn-danger, button[onclick*="elete"], button[onclick*="ELETE"], a[href*="delete"] {
            background: #ef4444 !important; /* Lighter, brighter red */
            border: 1px solid #fca5a5 !important;
            color: #ffffff !important;
            box-shadow: 0 0 15px rgba(239, 68, 68, 0.6) !important; /* Glowing effect */
            text-shadow: 0 1px 2px rgba(0,0,0,0.2) !important;
            text-decoration: none !important;
            padding: 0.4rem 0.8rem !important;
            border-radius: 6px !important;
        }
        
        .btn-danger:hover, button[onclick*="elete"]:hover, a[href*="delete"]:hover {
            background: #f87171 !important;
            box-shadow: 0 0 22px rgba(239, 68, 68, 0.9) !important; /* Stronger glow on hover */
        }

        /* FORCE TABLE OVERRIDES AGAINST INLINE STYLES */
        table, th, td, tr {
            background: transparent !important;
        }
        
        tr[style*="background"] {
            background: transparent !important;
        }

        th {
            border-bottom: 2px solid var(--color-border) !important;
            color: var(--color-gold) !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em !important;
        }
        
        th[style] {
            color: var(--color-gold) !important;
            background: transparent !important;
        }
        
        td {
            border-bottom: 1px solid var(--color-border) !important;
            color: var(--color-ivory) !important;
        }
        
        td[style] {
            color: var(--color-ivory) !important;
            background: transparent !important;
        }
        
        /* Inline span badges (e.g. Active) */
        span[style*="background: #dcfce3"], span[style*="background:#dcfce3"] {
            background: rgba(91, 121, 148, 0.3) !important; /* Slate Blue transparent */
            color: #92bce3 !important;
            border: 1px solid rgba(91, 121, 148, 0.5) !important;
        }
        
        /* Table rows hover */
        tr:hover td {
            background: rgba(255, 255, 255, 0.03) !important;
        }
        
        /* Pipeline specific */
        .pipeline-stage {
            background: transparent !important;
            border-right: 2px dashed var(--color-border) !important;
        }
        
        .pipeline-lead {
            border-left: 4px solid var(--color-gold) !important;
        }
        
        a {
            color: var(--color-gold) !important;
        }
        
        /* FIX INLINE STYLES FOR TITLES */
        h2[style] {
            color: var(--color-ivory) !important;
        }
        h2 svg {
            color: var(--color-gold) !important;
        }
    </style>
</head>
`;

fs.readdirSync(viewsDir).forEach(file => {
    if (file.endsWith('.ejs')) {
        const filePath = path.join(viewsDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Remove existing injection if it exists
        if (content.includes('<!-- INJECTED PREMIUM CRM THEME -->')) {
            content = content.replace(/<!-- INJECTED PREMIUM CRM THEME -->[\s\S]*?<\/head>/, '</head>');
        }

        // Inject new theme before </head>
        content = content.replace('</head>', themeInjection);

        // Unified Navbar Replacement
        const unifiedNavbar = `
    <!-- UNIFIED NAVBAR -->
    <nav class="top-nav">
        <div class="nav-brand">
            <h1 class="nav-logo">Tiffany Webb <span>CRM</span></h1>
        </div>
        <div class="nav-links">
            <a href="/dashboard" class="nav-link">Pipeline</a>
            <a href="/leads/new" class="nav-link">Add Lead</a>
            <a href="/cms" class="nav-link">Website</a>
            <a href="/users" class="nav-link">Staff</a>
            <a href="/login" class="nav-link">Logout</a>
        </div>
    </nav>
    <!-- END UNIFIED NAVBAR -->`;

        // First remove any existing navbars
        content = content.replace(/<!-- UNIFIED NAVBAR -->[\s\S]*?<!-- END UNIFIED NAVBAR -->/g, '');
        content = content.replace(/<nav class="top-nav">[\s\S]*?<\/nav>/g, '');
        
        // Clean up accidental literal \n from previous injection bug
        content = content.replace(/<body[^>]*>\\n/g, '<body>');
        
        // Inject right after <body> ONLY if it's not an auth page
        if (!['login.ejs', 'forgot-password.ejs', 'reset-password.ejs'].includes(file)) {
            content = content.replace(/<body[^>]*>/, match => match + '\n' + unifiedNavbar);
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
console.log('All views updated with Sleek Multi-Color Ink theme and Unified Navbar!');
