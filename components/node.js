export default function node(tagName, attrs, text) {
    const n = document.createElement( tagName );
    if (typeof text === 'string') {
        n.textContent = text;
    } else if ( text && Array.isArray(text) ) {
        // treat as DOM nodes but ignore anything undefined
        text.filter((n)=>n).forEach((t) => n.appendChild(t));
    } else if ( text && text.html ) {
        n.innerHTML = text.html;
    } else if ( text ) {
        // node
        n.appendChild(text);
    }
    Object.keys(attrs || {}).forEach((name)=>n.setAttribute(name, attrs[name]));
    return n;
}
