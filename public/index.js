import inat from './inat.js';
import wikidata from './wikidata.js';
import node from './components/node.js';
import taxonView from './components/taxon.js';
import searchForm from './components/search-form.js';
import render from './render.js';
import suggestionForm from './components/suggestion-form.js';

/**
 * @type {Object} State
 * @property {number} screen that is currently active
 * @property {number} taxon
 * @property {string} wikidata
 * @property {Object} taxonData
 * @property {Array} suggestions
 * @property {Array} viewedSuggestions
 * @property {string[]} uploadedFiles (iNaturalist url)
 */
const state = {
    screen: 0,
    uploadedFiles: []
};

const setSuggestions = (suggestions) => {
    state.suggestions = suggestions;
};

const setViewedSuggestions = (viewedSuggestions) => {
    state.viewedSuggestions = viewedSuggestions;
    localStorage.setItem( 'triaged', JSON.stringify(viewedSuggestions));
};

const setINatTaxon = (taxon) => {
    state.taxon = taxon;
};

const setWikidataId = (wid) => {
    state.wikidata = wid;
};

const setTaxonData = (data) => {
    state.taxonData = data;
};

const setStateValue = (name, value) => {
    state[name] = value;
};

const app = document.getElementById('app');

const doSearch = () => {
    inat.fetchTaxa(state.taxon).then((taxa) => {
        setTaxonData(taxa);
        renderApp();
    } );
};

const setScreen = (screen) => {
    state.screen = screen;
    renderApp();
}

const searchTypeButtons = () => {
    return node('div', {class:'search-type-buttons'}, [
        node( 'button', {
            onClick: () => setScreen(1)
        }, ['Find articles without images']),
        node( 'button', {
            onClick: () => setScreen(2)
        }, [ 'Find an article using iNaturalist ID'])
    ]);
}
const welcomeScreen = () => {
    return node( 'div', {}, [
        node( 'p', {}, [ 'Welcome to the Wiki loves iNaturalist tool. It will help you match articles in Wikipedia to images on iNaturalist.org.' ]),
        node( 'p', {}, [ 'We can make suggestions of articles that need images or you might have one in mind?' ]),
        searchTypeButtons()
    ])
};

const makeSuggestionForm = () => {
    return suggestionForm( {
        defaultConservationStatus: state.status,
        onSelectConservationStatus: ( ev ) => {
            const status = parseInt( ev.target.value, 10 );
            setSuggestions([]);
            renderApp();
            setStateValue('status', status);
            localStorage.setItem('status', status);
            wikidata.missing(status).then((items) => {
                setSuggestions(items.filter((item) =>
                    state.viewedSuggestions.indexOf(item.taxon) === -1));
                renderApp();
            } )
        },
        onClickSuggestion: ( taxon, wid ) => {
            const suggestions = state.suggestions;
            setViewedSuggestions(state.viewedSuggestions.concat([taxon]));
            setSuggestions(suggestions.filter((suggestion) => suggestion.taxon !== taxon));
            setINatTaxon(taxon);
            setWikidataId(wid);
            renderApp();
            doSearch();

        },
        suggestions: state.suggestions
    } );
};

const makeSearchForm = () => {
    return searchForm( {
        onSearch: doSearch,
        taxon: state.taxon,
        setINatTaxon, setWikidataId
    } );
};

const taxonResult = () => {
    return state.taxonData && node('div', { class: 'search-form__results' },
        taxonView(state.taxonData, ( filename ) => {
            state.uploadedFiles.push(filename);
            renderApp();
        }, state.uploadedFiles)
    );
};

const hashArgs = window.location.hash.replace( '#','' ).split( ',' );
setINatTaxon(hashArgs[0]);
setWikidataId(hashArgs[1] || '');
setStateValue('status', parseInt(localStorage.getItem('status'), 10));
setSuggestions(wikidata.cachedSuggestions.sort(()=>Math.random() < 0.5 ? -1 : 1));
setViewedSuggestions(JSON.parse( localStorage.getItem( 'triaged' ) || '[]' ));

const makeScreen = (children) => {
    return node('div', {class: 'screen'}, children);
};

const getScreen = () => {
    switch ( state.screen ) {
        case 0:
            return makeScreen([welcomeScreen(), taxonResult()])
        case 1:
            return makeScreen([searchTypeButtons(), makeSuggestionForm(), taxonResult()]);
        case 2:
            return makeScreen([searchTypeButtons(), makeSearchForm(), taxonResult()]);
        default:
            return makeScreen(['uhoh']);
    }
}
const renderApp = () => {
    render(app, getScreen())
};

renderApp();
if(state.taxon) {
    doSearch();
}

window.onhashchange = function () {
    const hashArgs = window.location.hash.replace( '#','' ).split( ',' );
    setINatTaxon(hashArgs[0]);
    setWikidataId(hashArgs[1] || '');
    renderApp();
    if(state.taxon) {
        doSearch();
    }
};
