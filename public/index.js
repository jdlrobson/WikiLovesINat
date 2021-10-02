import inat from './inat.js';
import wikidata from './wikidata.js';
import node from './components/node.js';
import taxonView from './components/taxon.js';
import searchForm from './components/search-form.js';
import render from './render.js';
import suggestionForm from './components/suggestion-form.js';
import wikidataForm from './components/wikidata-form.js';

const SCREEN_DEFAULT = 1;
const SCREEN_FIND_WIKIPEDIA_ARTICLES = 1;
const SCREEN_FIND_BY_INAT = 2;
const SCREEN_FIND_BY_WIKIDATA = 3;
const SCREEN_FIND_BY_INAT_USERNAME = 4;
const SCREEN_FIND_BY_INAT_OBSERVATION_ID = 5;

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
    screen: SCREEN_DEFAULT,
    uploadedFiles: [],
    page: 1,
    nextPage: 1,
    taxa: undefined
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

const setTaxonData = (data, preserveResults) => {
    if ( preserveResults ) {
        state.taxonData.photos = state.taxonData.photos.concat(
            data.photos
        );
    } else {
        state.taxonData = data;
    }
};

const setStateValue = (name, value) => {
    state[name] = value;
    // reset any errors from previous state changes
    if ( name !== 'error' ) {
        state.error = false;
    }
};

const app = document.getElementById('app');

const doSearchObservationID = ( id ) => {
    inat.fetchByObservationId(id).then((taxa) => {
        setTaxonData(taxa);
        renderApp();
    })
};

const doSearchUsername = ( username ) => {
    inat.fetchForUser(username, state.page).then((taxa) => {
        setTaxonData(taxa);
        setStateValue('nextPage', taxa.page);
        renderApp();
    })
};

const doSearch = ( preserveResults = false ) => {
    doSearchTaxon( preserveResults );
};

function doSearchTaxon( preserveResults ) {
    window.location.hash = `#${state.taxon}`;
    inat.fetchTaxa(state.taxon, state.page).then((taxa) => {
        setTaxonData(taxa, preserveResults);
        setStateValue('error', false);
        setStateValue('nextPage', taxa.page);
        renderApp();
    }).catch(() => {
        setStateValue('taxon', undefined);
        setStateValue('error', 'No iNaturalist observations.');
        renderApp();
    });
};

const setScreen = (screen) => {
    setStateValue('error', false);
    state.screen = screen;
}

const searchTypeButtons = () => {
    const prevDefaultAndSetScreen = (screen) => {
        return (ev) => {
            ev.preventDefault();
            setScreen(screen);
            renderApp();
        };
    };

    return node('div', {class:'search-type-buttons'}, [
        node( 'button', {
            class: state.screen === SCREEN_FIND_WIKIPEDIA_ARTICLES ?
                'tab--selected tab' : 'tab',
            onClick: prevDefaultAndSetScreen(SCREEN_FIND_WIKIPEDIA_ARTICLES)
        }, ['Find articles without images']),
        node( 'button', {
            class: state.screen === SCREEN_FIND_BY_INAT ?
                'tab--selected tab' : 'tab',
            onClick: prevDefaultAndSetScreen(SCREEN_FIND_BY_INAT)
        }, [ 'Find an article using iNaturalist ID']),
        node( 'button', {
            class: state.screen === SCREEN_FIND_BY_WIKIDATA ?
                'tab--selected tab' : 'tab',
            onClick: prevDefaultAndSetScreen(SCREEN_FIND_BY_WIKIDATA)
        }, [ 'Find an article using Wikidata ID']),
        node( 'button', {
            class: state.screen === SCREEN_FIND_BY_INAT_USERNAME ?
                'tab--selected tab' : 'tab',
            onClick: prevDefaultAndSetScreen(SCREEN_FIND_BY_INAT_USERNAME)
        }, [ 'Find an article using iNaturalist username']),
        node( 'button', {
            class: state.screen === SCREEN_FIND_BY_INAT_OBSERVATION_ID ?
                'tab--selected tab' : 'tab',
            onClick: prevDefaultAndSetScreen( SCREEN_FIND_BY_INAT_OBSERVATION_ID)
        }, [ 'Find an article using iNaturalist observation id'])
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
                const url = `https://www.wikidata.org/wiki/${state.wikidata}`;
                setStateValue('wikidata', undefined);
                setStateValue('error', `The Wikidata page has no property P3151 (iNaturalist taxon ID). Please add this to <a href="${url}" target="_blank">the wikidata page</a>.`);
                renderApp();
            })
        }
    } );
};

const makeSearchForm = () => {
    let searchValue;
    let label;
    let onSearch;
    switch ( state.screen ) {
        case SCREEN_FIND_BY_INAT_USERNAME:
            label = 'iNat username:';
            onSearch = () => {
                doSearchUsername( searchValue );
            };
        case SCREEN_FIND_BY_INAT_OBSERVATION_ID:
            label = 'iNat observation ID:';
            onSearch = () => {
                doSearchObservationID( searchValue );
            };
        case SCREEN_FIND_BY_INAT_OBSERVATION_ID:
        case SCREEN_FIND_BY_INAT_USERNAME:
            return searchForm( {
                label,
                onSearch,
                searchTerm: '',
                onInput: ( value ) => {
                    searchValue = value;
                }
            } );
        default:
            return searchForm( {
                label: 'iNat Taxon ID:',
                onSearch: doSearch,
                searchTerm: state.taxon,
                onInput: setINatTaxon,
            } );
    }
};

const taxonResult = () => {
    const loadMore = function () {
        if ( state.page !== state.nextPage ) {
            setStateValue('page', state.nextPage );
        }
        doSearch( true );
    };

    if ( state.error ) {
        return node('div', {
            dangerouslySetInnerHTML: {
                __html: state.error
            },
            class: 'error'
        }, '' );
    }
    return node('div', { class: 'search-form__results' },
        state.taxonData && taxonView(state.taxonData, ( filename ) => {
            state.uploadedFiles.push(filename);
            renderApp();
        }, state.uploadedFiles,
        state.page !== state.nextPage && loadMore )
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
        case SCREEN_DEFAULT:
        case SCREEN_FIND_WIKIPEDIA_ARTICLES:
            return makeScreen([searchTypeButtons(), makeSuggestionForm(), taxonResult()]);
        case SCREEN_FIND_BY_INAT_OBSERVATION_ID:
        case SCREEN_FIND_BY_INAT_USERNAME:
        case SCREEN_FIND_BY_INAT:
            return makeScreen([searchTypeButtons(), makeSearchForm(), taxonResult()]);
        case SCREEN_FIND_BY_WIKIDATA:
            return makeScreen([searchTypeButtons(), makeWikidataForm(), taxonResult()]);
        default:
            setStateValue('error', 'I broke something. This one is my fault...');
            return makeScreen([taxonResult()]);
    }
}
const renderApp = () => {
    render(app, getScreen())
};

if (hashArgs[0]) {
    setScreen(SCREEN_FIND_BY_INAT);
}
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
