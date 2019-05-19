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
        onClick( ev, taxon, wd );
    });
    return list;
};

export default function searchForm( { fetchAndRender,
    onClickSuggestion, getSuggestions, wikidata, taxon } ) {
    const submit = node('button', {}, 'search taxon');

    const input = node('input', {
        value: taxon,
        type: 'text'
    });
    const wikidataInput = node('input', {
        value: wikidata,
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
    // init if necessary
    if ( wikidata && taxon ) {
        fetchAndRender(results, taxon, wikidata);
    }
    // setup events
    submit.addEventListener('click', (ev) => {
        const wid = wikidataInput.value;
        ev.preventDefault();
        window.location.hash = `${input.value},${wid}`;
        fetchAndRender(results, parseInt(input.value, 10), wid);
    });
    dontKnow.addEventListener('click', (ev) => {
        ev.preventDefault();
        getSuggestions().then((data) => {
            const list = taxonSuggestionList(
                data.sort(()=> Math.random() < 0.5 ? -1 : 1),
                ( ev, taxon, wikidata ) => {
                    onClickSuggestion( ev, taxon, wikidata );
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
