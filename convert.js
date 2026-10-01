const fs = require('fs');

let html = fs.readFileSync('raw.html', 'utf8');

// Replace class with className
html = html.replace(/class=/g, 'className=');

// Fix SVG attributes
const svgAttrs = ['viewBox', 'strokeLinecap', 'strokeLinejoin', 'strokeWidth', 'fillRule', 'clipRule'];
for (const attr of svgAttrs) {
  html = html.replace(new RegExp(attr.toLowerCase() + '=', 'g'), attr + '=');
}

// Convert style strings to objects if any exist (though mostly classes are used here)
// E.g., style="width: 100%" -> style={{width: "100%"}}

// Close self-closing tags
html = html.replace(/<img([^>]+[^\/])>/g, '<img$1 />');
html = html.replace(/<br([^>]*[^\/])>/g, '<br$1 />');
html = html.replace(/<hr([^>]*[^\/])>/g, '<hr$1 />');
html = html.replace(/<input([^>]*[^\/])>/g, '<input$1 />');
html = html.replace(/<path([^>]*[^\/])>/g, '<path$1 />');
html = html.replace(/<rect([^>]*[^\/])>/g, '<rect$1 />');
html = html.replace(/<circle([^>]*[^\/])>/g, '<circle$1 />');

// We'll manually fix anything else
fs.writeFileSync('raw.jsx', html);
