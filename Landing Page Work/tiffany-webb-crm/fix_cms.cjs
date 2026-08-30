const fs = require('fs');
let code = fs.readFileSync('D:\\FREELANCE\\TIFFANY WEB\\Landing Page Work\\tiffany-webb-crm\\views\\cms.ejs', 'utf8');

// 1. Add sorting logic right before the tbody
const sortCode = `<% 
const order = ['home', 'about', 'services', 'speaking', 'impact', 'media', 'book', 'insights', 'navbar'];
pages.sort((a, b) => {
    let indexA = order.indexOf(a.slug);
    let indexB = order.indexOf(b.slug);
    if(indexA === -1) indexA = 99;
    if(indexB === -1) indexB = 99;
    return indexA - indexB;
});
%>
                  <tbody>`;
code = code.replace('<tbody>', sortCode);

// 2. Make the row clickable
code = code.replace(
    '<tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;">',
    `<tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s; cursor: pointer;" onclick="window.location.href='/cms/<%= page.slug %>'" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">`
);

// 3. Prevent event bubbling on the toggle button
code = code.replace(
    '<button onclick="togglePageStatus',
    '<button onclick="event.stopPropagation(); togglePageStatus'
);

// 4. Prevent event bubbling on the Edit Content link
code = code.replace(
    '<a href="/cms/<%= page.slug %>" style="display: inline-flex;',
    '<a href="/cms/<%= page.slug %>" onclick="event.stopPropagation()" style="display: inline-flex;'
);

fs.writeFileSync('D:\\FREELANCE\\TIFFANY WEB\\Landing Page Work\\tiffany-webb-crm\\views\\cms.ejs', code);
console.log('Fixed cms.ejs layout');
