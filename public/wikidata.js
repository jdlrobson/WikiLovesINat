let cache;
const INATPROP = 'P3151';
const WIKIDATA = 'https://www.wikidata.org';
import { LOCAL_STORAGE_SUGGESTION_KEY } from './constants.js';

export const ENDANGERED = 0;
export const CRITICAL_ENDANGERED = 1;
export const NEAR_TREATENED = 2;
export const VULNERABLE = 3;
export const LEAST_CONCERN = 4;
export const NOT_ENDANGERED = 5;
export const DATA_DEFICIENT = 6;

const extractId = ( uri ) => {
    return decodeURIComponent(
        uri.split('/').slice(-1)[0].replace(/_/g, ' ' )
    )
}

const lookupINatId = (qid) => {
    return fetch(`${WIKIDATA}/w/api.php?origin=*&action=wbgetclaims&format=json&entity=${qid}&property=${INATPROP}`)
        .then((r) => r.json())
        .then((json) => {
            try {
                return json.claims[INATPROP][0].mainsnak.datavalue.value
            } catch (e) {
                throw new Error('Unable to lookup from QID');
            }
        })
}

const getUrl = ( status ) => {
    let statusWID;
    switch ( status ) {
        case DATA_DEFICIENT:
            statusWID = 'Q3245245';
            break;
        case LEAST_CONCERN:
            statusWID = 'Q211005';
            break;
        case VULNERABLE:
            statusWID = 'Q278113';
            break;
        case NEAR_TREATENED:
            statusWID = 'Q719675';
            break;
        case CRITICAL_ENDANGERED:
            statusWID = 'Q219127';
            break;
        case ENDANGERED: // Q11394
            statusWID = 'Q11394';
            break;
        case NOT_ENDANGERED:
            // https://w.wiki/484
            return `https://query.wikidata.org/sparql?query=SELECT%20%3Ftaxon%20%3FiNatTaxonId%20%3Farticle%20%3Fstatus%20WHERE%20%7B%0A%20%20%20%3Ftaxon%20wdt%3AP31%20wd%3AQ16521%20%3B%20%23%20Wikidata%20is%20about%20a%20taxon%0A%20%20%20%20%20%20%20%20%20%20wdt%3AP3151%20%3FiNatTaxonId%20.%0A%20%20OPTIONAL%20%7B%20%3Ftaxon%20wdt%3AP141%20%3Fstatus%20%7D%0A%20%20%20MINUS%20%7B%20%3Ftaxon%20wdt%3AP141%20wd%3AQ11394%20.%7D%0A%20%20%20MINUS%20%7B%3Ftaxon%20wdt%3AP18%20%3Fimage%20.%7D%0A%20%20%20MINUS%20%7B%3Ftaxon%20wdt%3AP2716%20%3Fcollage%20.%7D%0A%20%20%20%3Farticle%20schema%3Aabout%20%3Ftaxon%20%3B%20%23%20Taxons%20with%20a%20Wikipedia%20article%0A%20%20%20%20%20%20%20%20%20%20%20%20schema%3AisPartOf%20%3Chttps%3A%2F%2Fen.wikipedia.org%2F%3E%20.%0A%7D%0ALIMIT%201000%0A`;
    }

    // https://w.wiki/485 (with substitution)
    return `https://query.wikidata.org/sparql?query=SELECT%20%3Ftaxon%20%3FiNatTaxonId%20%3Farticle%20%3Fstatus%20WHERE%20%7B%0A%20%20%20%3Ftaxon%20wdt%3AP31%20wd%3AQ16521%20%3B%20%23%20Wikidata%20is%20about%20a%20taxon%0A%20%20%20%20%20%20%20%20%20%20wdt%3AP3151%20%3FiNatTaxonId%20.%0A%20%20%20%3Ftaxon%20wdt%3AP141%20wd%3A${statusWID}%20.%20%23%20is%20endangered%0A%20%20%20MINUS%20%7B%3Ftaxon%20wdt%3AP18%20%3Fimage%20.%7D%0A%20%20%20MINUS%20%7B%3Ftaxon%20wdt%3AP2716%20%3Fcollage%20.%7D%0A%20%20%20%3Farticle%20schema%3Aabout%20%3Ftaxon%20%3B%20%23%20Taxons%20with%20a%20Wikipedia%20article%0A%20%20%20%20%20%20%20%20%20%20%20%20schema%3AisPartOf%20%3Chttps%3A%2F%2Fen.wikipedia.org%2F%3E%20.%0A%7D%0ALIMIT%201000%0A`;
}

const sortFn = (a, b ) => {
    return a.name < b.name ? -1 : 1;
};

const addPhotoToSuggestionsInternal = (s, taxonIds) => {
    return fetch(`https://api.inaturalist.org/v1/taxa?taxon_id=${taxonIds.join('%2C')}`)
        .then((r) => r.json())
        .then((data) => {
            const images = {};
            data.results.forEach((taxon) => {
                images[taxon.id] = taxon.default_photo
            })

            const suggestions = s.map(
                (s) => {
                    if ( taxonIds.includes( s.taxon ) ) {
                        return Object.assign({}, s, {
                            photo: images[s.taxon] || {}
                        });
                    } else {
                        return s;
                    }
                }
            );
            return suggestions;
        });
};

const addPhotoToSuggestions = (s, maximum=500) => {
    const taxonIds = s.filter((s)=>s.photo===undefined).slice(0, 100)
        .map((s) => s.taxon);
    if ( !taxonIds.length || maximum < 0) {
        return Promise.resolve(s);
    } else {
        return addPhotoToSuggestionsInternal(s, taxonIds).then((newS) => {
            return addPhotoToSuggestions(newS, maximum - 100);
        });
    }
}

export default {
    sortFn,
    iNat: lookupINatId,
    prune: function () {
        const suggestions = JSON.parse( localStorage.getItem( LOCAL_STORAGE_SUGGESTION_KEY ) || '[]' )
            .filter((s) => s.photo === undefined || s.photo && s.photo.square_url);
        return addPhotoToSuggestions(suggestions, 500).then((suggestions) => {
            localStorage.setItem( LOCAL_STORAGE_SUGGESTION_KEY, JSON.stringify( suggestions ) )
            return suggestions;
        });
    },
    cachedSuggestions: JSON.parse( localStorage.getItem( LOCAL_STORAGE_SUGGESTION_KEY ) || '[]' ),
    missing: function ( status ) {
        // find all wikidata entries without collage and image
        return fetch(
            getUrl(status),
            {
                headers: {
                    accept: 'application/sparql-results+json'
                }
            }
            /*{
                credentials: 'include',
                mode: 'cors'
            }*/
        ).then((r) => {
            return r.json();
        }).then((j) => {
            return j.results.bindings.map((r) => {
                const article = r.article.value;
                return {
                    name: extractId( article ),
                    taxon: parseInt( r.iNatTaxonId.value, 10),
                    article,
                    wikidata: extractId( r.taxon.value ),
                    wikidataUri: r.taxon.value
                }
            }).sort(sortFn);
        }).then((suggestions) => {
            return addPhotoToSuggestions(suggestions, 500);
        }).then((suggestions) => {
            localStorage.setItem( LOCAL_STORAGE_SUGGESTION_KEY, JSON.stringify( suggestions ) )
            return suggestions;
        })
    }
}
