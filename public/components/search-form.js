import node from './node.js';

export default function searchForm( {
    setINatTaxon,
    onSearch,
    taxon } ) {

    const form = node('form', { key: 'mainform' }, [
        node('label', {}, 'iNat Taxon ID:' ),
        node('input', {
            required: true, // temporary
            defaultValue: taxon,
            onInput: (ev) => setINatTaxon(ev.target.value),
            type: 'text'
        }),
        node('button', {
            onClick: onSearch
        }, 'search taxon'),
    ] );
    return node( 'div', { class: 'search-form' }, [ form ] );
};
