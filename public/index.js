import inat from './inat.js';
import wikidata from './wikidata.js';
import node from './components/node.js';
import taxonView from './components/taxon.js';
import searchForm from './components/search-form.js';
import render from './render.js';
import suggestionForm from './components/suggestion-form.js';
import wikidataForm from './components/wikidata-form.js';

/**
 * @type {Object} State
 * @property {number} screen that is currently active
 * @property {number} taxon
 * @property {string} wikidata
 * @property {Object} taxonData
 * @property {Array} suggestions
 * @property {boolean} error occurred
 * @property {Array} viewedSuggestions
 * @property {string[]} uploadedFiles (iNaturalist url)
 */
const state = {
    screen: 1,
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
    // reset any errors from previous state changes
    if ( name !== 'error' ) {
        state.error = false;
    }
};

const app = document.getElementById('app');

const doSearch = () => {
    inat.fetchTaxa(state.taxon).then((taxa) => {
        setTaxonData(taxa);
        setStateValue('error', false);
        renderApp();
    }).catch((er) => {
        setStateValue('taxon', undefined);
        setStateValue('error', 'Unable to locate critter with that iNaturalist ID.');
        renderApp();
    });
};

const setScreen = (screen) => {
    setStateValue('error', false);
    state.screen = screen;
    renderApp();
}

const searchTypeButtons = () => {
    const prevDefaultAndSetScreen = (screen) => {
        return (ev) => {
            ev.preventDefault();
            setScreen(screen);
        };
    };

    return node('div', {class:'search-type-buttons'}, [
        node( 'button', {
            class: state.screen === 1 ? 'tab--selected tab' : 'tab',
            onClick: prevDefaultAndSetScreen(1)
        }, ['Find articles without images']),
        node( 'button', {
            class: state.screen === 2 ? 'tab--selected tab' : 'tab',
            onClick: prevDefaultAndSetScreen(2)
        }, [ 'Find an article using iNaturalist ID']),
        node( 'button', {
            class: state.screen === 3 ? 'tab--selected tab' : 'tab',
            onClick: prevDefaultAndSetScreen(3)
        }, [ 'Find an article using Wikidata ID'])
    ]);
}

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

const makeWikidataForm = () => {
    return wikidataForm( {
        setStateValue,
        wid: state.wikidata,
        onSearch: () => {
            setStateValue('taxonData', undefined);
            renderApp();
            wikidata.iNat(state.wikidata).then((iNat) => {
                setStateValue('taxon', iNat);
                setStateValue('error', false);
                doSearch();
                renderApp();
            }).catch((err) => {
                setStateValue('wikidata', undefined);
                setStateValue('error', 'I was unable to locate creature with that Wikidata ID.');
                renderApp();
            })
        }
    } );
};

const makeSearchForm = () => {
    return searchForm( {
        onSearch: doSearch,
        taxon: state.taxon,
        setINatTaxon,
    } );
};

const taxonResult = () => {
    if ( state.error ) {
        return node('div', { class: 'error' },
            [ state.error ] );
    }
    return node('div', { class: 'search-form__results' },
        state.taxonData && taxonView(state.taxonData, ( filename ) => {
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
        case 1:
            return makeScreen([searchTypeButtons(), makeSuggestionForm(), taxonResult()]);
        case 2:
            return makeScreen([searchTypeButtons(), makeSearchForm(), taxonResult()]);
        case 3:
            return makeScreen([searchTypeButtons(), makeWikidataForm(), taxonResult()]);
        default:
            setStateValue('error', 'I broke something. This one is my fault...');
            return makeScreen([taxonResult()]);
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
