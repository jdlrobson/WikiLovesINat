import inat from './inat.js';
import wikidata from './wikidata.js';
import node from './components/node.js';
import searchForm from './components/search-form.js';
import taxon from './components/taxon.js';
import render from './render.js';

const fetchAndRender = (container, id, wikidata ) => {
    render( container, node( 'div', {}, 'Performing search... please wait!' ) )
    inat.fetchTaxa(id).then((taxa) => {
        render(
            container,
            taxon(taxa, wikidata)
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
render( document.getElementById('app'), container );
renderForm(container);

window.onhashchange = function () {
    const hashArgs = window.location.hash.replace( '#','' ).split( ',' );
    const wid = hashArgs[1] || '';
    fetchAndRender(container.querySelector('.results'), hashArgs[0], wid);
};
