import node from './node.js';

export default function searchForm( {
    setINatTaxon,
    onSearch,
    taxon } ) {

    const form = node('form', { key: 'mainform' }, [
        node('label', {}, 'iNat Taxon ID:' ),
        node('input', {
            required: true,
            name: 'inat',
            value: taxon,
            defaultValue: taxon,
            onInput: (ev) => setINatTaxon(ev.target.value),
            type: 'text'
        }),
        node('button', {
            onClick: ( ev ) => {
                ev.preventDefault();
                onSearch();
            }
        }, 'search taxon'),
    ] );
    return node( 'div', { class: 'search-form' }, [ form ] );
};
