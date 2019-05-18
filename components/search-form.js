import node from './node.js';
import render from '../render.js';

const taxonSuggestionList = (data, onClick ) => {
    const list = node('div', {}, data.map((item) =>
        node('button', {
            'data-wikidata': item.wikidata,
            'data-taxon': item.taxon
        }, `${item.name} (${item.taxon}, ${item.wikidata})` )
    ) );
    list.addEventListener( 'click', (ev)=> {
        const taxon = ev.target.getAttribute( 'data-taxon' );
        const wd = ev.target.getAttribute( 'data-wikidata' );
        onClick( taxon, wd );
    });
    return list;
};

export default function searchForm( { fetchAndRender, getSuggestions } ) {
    const submit = node('button', {}, 'search taxon');
    const hashArgs = window.location.hash.replace('#','').split(',');
    const input = node('input', {
        value: hashArgs[0],
        type: 'text'
    });
    const wikidataInput = node('input', {
        value: hashArgs[1] || '',
        type: 'text'
    });
    const dontKnow = node('button', {}, 'dont know');
    const suggestions = node( 'div', { class: 'suggestions' } );
    const form = node('form', {}, [
        node('label', {}, 'iNat Taxon ID:' ),
        input,
        node('label', {}, 'Wikidata ID:' ),
        wikidataInput,
        submit,
        dontKnow
    ] );
    const results = node('div', { class: 'results' } );
    const searchForm = node( 'div', { class: 'search-form' }, [
        form,
        suggestions,
        results
    ] );
    // setup events
    submit.addEventListener('click', (ev) => {
        ev.preventDefault();
        window.location.hash = `${input.value},${wikidataInput.value}`;
        fetchAndRender(results, parseInt(input.value, 10));
    });
    dontKnow.addEventListener('click', (ev) => {
        ev.preventDefault();
        getSuggestions().then((data) => {
            const list = taxonSuggestionList(
                data.sort(()=> Math.random() < 0.5 ? -1 : 1),
                ( taxon, wikidata ) => {
                    input.setAttribute('value', taxon);
                    wikidataInput.setAttribute('value', wikidata);
                    submit.dispatchEvent( new Event( 'click' ) );
                }
            );
            render(suggestions, list);
        })
    });
    return searchForm;
};
