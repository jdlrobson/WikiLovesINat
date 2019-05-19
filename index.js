import inat from './inat.js';
import wikidata from './wikidata.js';
import node from './components/node.js';
import searchForm from './components/search-form.js';
import gallery from './components/gallery.js';
import render from './render.js';

document.body.textContent = '';

const fetchAndRender = (container, id, wikidata ) => {
    render( container, node( 'div', {}, 'Performing search... please wait!' ) )
    inat.fetchTaxa(id).then((taxa) => {
        render(
            container,
            node( 'div', { class: 'taxon' },
                [
                    node( 'h2', {}, taxa.name ),
                    node( 'a', {
                        class: 'taxon__link',
                        href: `${taxa.url}`
                    }, 'Wikipedia' ),
                    wikidata && node( 'a', {
                        class: 'taxon__link',
                        href: `//wikidata.org/wiki/${wikidata}`
                    }, 'Wikidata' ),
                    taxa.summary && node( 'p', {}, { html: taxa.summary } ),
                    gallery( taxa.photos, taxa.id, taxa.name )
                ]
            )
        );
    } );
}

const suggestions = wikidata.cachedSuggestions;
const viewed = JSON.parse( localStorage.getItem( 'triaged' ) || '[]' );

const renderForm = (container) => {
    const hashArgs = window.location.hash.replace( '#','' ).split( ',' );
    const wid = hashArgs[1] || '';
    render( container, searchForm( {
        fetchAndRender,
        taxon: hashArgs[0],
        wikidata: wid,
        onClickSuggestion: ( ev, taxon ) => {
            const suggestion = ev.target;
            viewed.push( parseInt( taxon, 10 ) );
            suggestion.parentNode.removeChild( suggestion );
            localStorage.setItem( 'triaged', JSON.stringify(viewed));
        },
        suggestions,
        getSuggestions: (status) => wikidata.missing(status).then((items) => {
                return items.filter((item) => viewed.indexOf(item.taxon) === -1);
            } )
    } ) );
}

const container = node( 'div' );
render( document.body, container );
renderForm(container);

/*
fetchAndRender(64375);
fetchAndRender(141760);
fetchAndRender(20978);*/