import node from './node.js';
import { NOT_ENDANGERED, ENDANGERED,
    CRITICAL_ENDANGERED, LEAST_CONCERN, VULNERABLE,
    NEAR_TREATENED } from '../wikidata.js';

const taxonSuggestionList = (data, onClick ) => {
    const list = node('div', {}, data.map((item) => {
        const wd = item.wikidata;
        const taxon = item.taxon;
        return node('button', {
            onClick: () => {
                onClick(taxon, wd);
            },
        }, `${item.name} (${item.taxon}, ${item.wikidata})` )
    } ) );
    return list;
};

const searchSuggestions = ( { suggestions, onClickSuggestion } ) => {
    return node( 'div', { class: suggestions ? 'suggestions' :
        'suggestions suggestions--loading' },
        suggestions && taxonSuggestionList(
            ( suggestions || [] ).sort((a, b)=> a.status < b.status ? 1 : -1),
            ( taxon, wikidata ) => {
                onClickSuggestion( taxon, wikidata );
            }
        )
    );
};

export default function ( { suggestions, onSelectConservationStatus, onClickSuggestion } ) {
    const select = node('select', {
        onChange: onSelectConservationStatus
    }, [
        node('option', { 'value': '' }, 'anything' ),
        node('option', { 'value': LEAST_CONCERN }, 'least concern' ),
        node('option', { 'value': CRITICAL_ENDANGERED }, 'critical endangered'),
        node('option', { 'value': NEAR_TREATENED }, 'near threatened'),
        node('option', { 'value': VULNERABLE }, 'vulnerable'),
        node('option', { 'value': ENDANGERED }, 'endangered'),
        node('option', { 'value': NOT_ENDANGERED }, '!endangered' )
    ] );
    
    return node('div', { class: 'suggestion-form' }, [
        node('label', {}, 'Conservation status'),
        select,
        searchSuggestions( { suggestions, onClickSuggestion } )
    ] );
};