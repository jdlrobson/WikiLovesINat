import node from './node.js';

export default function searchForm( {
    onInput,
    label,
    onSearch,
    searchTerm } ) {

    const form = node('form', { key: 'mainform' }, [
        node('label', {}, label ),
        node('input', {
            required: true,
            name: 'inat',
            value: searchTerm,
            defaultValue: searchTerm,
            onInput: (ev) => onInput(ev.target.value),
            type: 'text'
        }),
        node('button', {
            onClick: ( ev ) => {
                ev.preventDefault();
                onSearch();
            }
        }, 'load images'),
    ] );
    return node( 'div', { class: 'search-form' }, [ form ] );
};
