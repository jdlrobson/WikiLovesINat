let root;
export default function render( node, component ) {
    root = preact.render( component, node, root );
}
