import node from './node.js';
import render from '../render.js';
import { NOT_ENDANGERED, ENDANGERED,
    CRITICAL_ENDANGERED, LEAST_CONCERN, VULNERABLE,
    NEAR_TREATENED } from '../wikidata.js';

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

export default function searchForm( { fetchAndRender, suggestions,
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
    const select = node('select', {}, [
        node('option', { 'value': '' }, 'anything' ),
        node('option', { 'value': LEAST_CONCERN }, 'least concern' ),
        node('option', { 'value': CRITICAL_ENDANGERED }, 'critical endangered'),
        node('option', { 'value': NEAR_TREATENED }, 'near threatened'),
        node('option', { 'value': VULNERABLE }, 'vulnerable'),
        node('option', { 'value': ENDANGERED }, 'endangered'),
        node('option', { 'value': NOT_ENDANGERED }, '!endangered' )
    ] );
    const suggestionsElement = node( 'div', { class: 'suggestions' } );
    const form = node('form', {}, [
        node('label', {}, 'iNat Taxon ID:' ),
        input,
        node('label', {}, 'Wikidata ID:' ),
        wikidataInput,
        submit,
        node('label', {}, 'get suggestions'),
        select
    ] );
    const results = node('div', { class: 'results' } );
    const searchForm = node( 'div', { class: 'search-form' }, [
        form,
        suggestionsElement,
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

    const renderSuggestions = (data) => {
        const list = taxonSuggestionList(
            data.sort((a, b)=> a.status < b.status ? 1 : -1),
            ( ev, taxon, wikidata ) => {
                onClickSuggestion( ev, taxon, wikidata );
                input.setAttribute('value', taxon);
                wikidataInput.setAttribute('value', wikidata);
                submit.dispatchEvent( new Event( 'click' ) );
            }
        );
        render(suggestionsElement, list);
    }
    // init suggestions
    if ( suggestions && suggestions.length ) {
        renderSuggestions( suggestions );
    }

    select.addEventListener('change', (ev) => {
        ev.preventDefault();
        const status = parseInt( ev.target.value, 10 );
        render(suggestionsElement, node('div',{},'Finding suggestions...'));
        getSuggestions(status).then((data) => renderSuggestions(data) );
    });
    return searchForm;
};
