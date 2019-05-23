export default function node(tagName, attrs, text) {
    if ( typeof text === 'string' ) {
        text = [ text ];
    } else if ( text && text.html ) {
        text = { __html: text };
    }
    return preact.h( tagName, attrs || {}, text || [] );
}
