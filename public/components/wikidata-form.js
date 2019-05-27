import node from './node.js';

export default function searchForm( {
    setStateValue,
    onSearch,
    wid } ) {

    const form = node('form', { key: 'mainform' }, [
        node('label', {}, 'Wikidata ID:' ),
        node('input', {
            required: true,
            name: 'wikidata',
            value: wid,
            defaultValue: wid,
            onInput: (ev) => setStateValue('wikidata', ev.target.value),
            type: 'text'
        }),
        node('button', {
            onClick: ( ev ) => {
                ev.preventDefault();
                onSearch();
            }
        }, 'search for wikidata id'),
    ] );
    return node( 'div', { class: 'search-form' }, [ form ] );
};
