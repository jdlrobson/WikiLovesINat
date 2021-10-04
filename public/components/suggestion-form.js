import node from './node.js';
import { NOT_ENDANGERED, ENDANGERED,
    CRITICAL_ENDANGERED, LEAST_CONCERN, VULNERABLE,
    NEAR_TREATENED } from '../wikidata.js';

const taxonSuggestionList = (data, onClick ) => {
    const list = node('div', {}, data.map((item) => {
        const wd = item.wikidata;
        const taxon = item.taxon;
        const photo = item.photo || {
            src: 'noinatq.png'
        };
        return node('img', {
            width: 50,
            height: 50,
            src: photo.square_url || 'noinat.png',
            onClick: (ev) => {
                ev.preventDefault();
                onClick(taxon, wd);
            },
            title: `${item.name} (${item.taxon}, ${item.wikidata})`
        } );
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

export default function ( { suggestions, defaultConservationStatus, onSelectConservationStatus, onClickSuggestion, onClickClear } ) {
    const select = node('select', {
        value: defaultConservationStatus,
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
    
    return node('form', { class: 'suggestion-form' }, [
        node('p', {}, [
            'This form will locate biodiversity which does not have a Wikidata image associated. Matches are also unlikely to have an image on the corresponding Wikipedia article. Select a conservation status to begin and suggestions will appear below.'
        ]),
        node('label', {}, 'Conservation status:'),
        select,
        searchSuggestions( { suggestions, onClickSuggestion } ),
        suggestions && node(
            'button',
            {
                onClick: onClickClear
            },
            'clear suggestions with no iNat default photo'
        )
    ] );
};