/**
 * Lightweight HTML / DOM Query Helper for Opaque-Box E2E Testing
 * Allows inspection of rendered SSR HTML without heavy browser dependencies
 */

class DOMParserHelper {
  constructor(html) {
    this.html = html || '';
  }

  // Find all matches for a tag with optional attributes
  findTags(tagName) {
    const regex = new RegExp(`<${tagName}\\b([^>]*)>([\\s\\S]*?)<\\/${tagName}>`, 'gi');
    const matches = [];
    let match;
    while ((match = regex.exec(this.html)) !== null) {
      matches.push({
        fullMatch: match[0],
        attributesRaw: match[1],
        attributes: this.parseAttributes(match[1]),
        innerHTML: match[2],
        textContent: this.stripHtml(match[2]).trim()
      });
    }
    return matches;
  }

  // Find self-closing or regular tags (like <input>, <img/>, etc.)
  findSingleTags(tagName) {
    const regex = new RegExp(`<${tagName}\\b([^>]*)\\/?>`, 'gi');
    const matches = [];
    let match;
    while ((match = regex.exec(this.html)) !== null) {
      matches.push({
        fullMatch: match[0],
        attributesRaw: match[1],
        attributes: this.parseAttributes(match[1])
      });
    }
    return matches;
  }

  parseAttributes(attrString) {
    const attrs = {};
    const regex = /([a-zA-Z0-9_\-:@.]+)(?:=["']([^"']*)["']|=(?=[^\s>]+))?/g;
    let match;
    while ((match = regex.exec(attrString)) !== null) {
      const key = match[1];
      const val = match[2] !== undefined ? match[2] : true;
      attrs[key] = val;
    }
    return attrs;
  }

  stripHtml(html) {
    return (html || '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&mdash;/g, '—')
      .replace(/&middot;/g, '·')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  }

  getElementById(id) {
    // Check elements with id="id" or id='id'
    const regex = new RegExp(`<([a-zA-Z0-9]+)\\b[^>]*\\bid=["']${id}["'][^>]*>([\\s\\S]*?)<\\/\\1>`, 'i');
    const match = regex.exec(this.html);
    if (match) {
      return {
        tag: match[1],
        fullMatch: match[0],
        innerHTML: match[2],
        textContent: this.stripHtml(match[2])
      };
    }
    // Also check self-closing tag
    const singleRegex = new RegExp(`<([a-zA-Z0-9]+)\\b[^>]*\\bid=["']${id}["'][^>]*\\/?>`, 'i');
    const singleMatch = singleRegex.exec(this.html);
    if (singleMatch) {
      return {
        tag: singleMatch[1],
        fullMatch: singleMatch[0],
        innerHTML: '',
        textContent: ''
      };
    }
    return null;
  }

  getElementsByClassName(className) {
    const regex = new RegExp(`<([a-zA-Z0-9]+)\\b[^>]*\\bclass=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>([\\s\\S]*?)<\\/\\1>`, 'gi');
    const matches = [];
    let match;
    while ((match = regex.exec(this.html)) !== null) {
      matches.push({
        tag: match[1],
        fullMatch: match[0],
        innerHTML: match[2],
        textContent: this.stripHtml(match[2])
      });
    }
    return matches;
  }

  getLinks() {
    const aTags = this.findTags('a');
    return aTags.map(a => ({
      href: a.attributes.href || '',
      text: a.textContent,
      attributes: a.attributes,
      fullHtml: a.fullMatch
    }));
  }

  getForms() {
    const forms = this.findTags('form');
    return forms.map(f => {
      const helper = new DOMParserHelper(f.fullMatch);
      const inputs = helper.findSingleTags('input');
      const selects = helper.findTags('select');
      const textareas = helper.findTags('textarea');
      const buttons = helper.findTags('button');

      return {
        action: f.attributes.action || '',
        method: (f.attributes.method || 'GET').toUpperCase(),
        id: f.attributes.id || '',
        inputs: inputs.map(i => i.attributes),
        selects: selects.map(s => {
          const optHelper = new DOMParserHelper(s.innerHTML);
          const options = optHelper.findTags('option');
          return {
            name: s.attributes.name || s.attributes.id || '',
            attributes: s.attributes,
            options: options.map(o => ({
              value: o.attributes.value !== undefined ? o.attributes.value : o.textContent,
              text: o.textContent
            }))
          };
        }),
        textareas: textareas.map(t => ({
          name: t.attributes.name || t.attributes.id || '',
          attributes: t.attributes,
          value: t.textContent
        })),
        buttons: buttons.map(b => ({
          type: b.attributes.type || 'submit',
          text: b.textContent,
          attributes: b.attributes
        }))
      };
    });
  }

  hasText(text) {
    return this.html.includes(text) || this.stripHtml(this.html).includes(text);
  }

  hasElementWithAttr(attrName, attrValue) {
    if (attrValue === undefined) {
      const regex = new RegExp(`\\b${attrName}(?:=["'][^"']*["'])?`, 'i');
      return regex.test(this.html);
    }
    const escapedVal = attrValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${attrName}=["']${escapedVal}["']`, 'i');
    return regex.test(this.html);
  }

  countElementsWithAttr(attrName, attrValue) {
    const escapedVal = attrValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${attrName}=["']${escapedVal}["']`, 'gi');
    const matches = this.html.match(regex);
    return matches ? matches.length : 0;
  }
}

function parseHTML(html) {
  return new DOMParserHelper(html);
}

module.exports = {
  DOMParserHelper,
  parseHTML
};
