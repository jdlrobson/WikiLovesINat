export default function render( p, children ) {
    p.innerHTML = '';
    if ( children ) {
        if ( children[0] ) {
            children.forEach((c) => p.appendChild(c));
        } else {
            p.appendChild(children);
        }
    }
}
