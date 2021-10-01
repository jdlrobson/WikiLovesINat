const THUMB_SIZE = 300;

function flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
      return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
}

const lookupWikidataId = (title, taxaInfo) => {
    return fetch(`https://en.wikipedia.org/w/api.php?origin=*&pithumbsize=${THUMB_SIZE}&format=json&formatversion=2&action=query&prop=pageprops|pageimages&ppprop=wikibase_item&redirects=1&titles=${title}`)
        .then((r) => r.json()).then((r) => {
            const page = r.query.pages[0];
            return page ? Object.assign( {
                thumbnail: page.thumbnail && page.thumbnail.source,
                wid: page.pageprops.wikibase_item
            }, taxaInfo) : taxaInfo;
        });
};

const mapObservation = (r) => {
    const observedDate = r.observed_on_string;
    const taxon = r.taxon || {};
    const taxonName = taxon.preferred_common_name || taxon.name;
    return r.photos.map((photo) => {
        return Object.assign( photo, {
            taxonName,
            observedDate,
            commonsCompatLicense:
                ['cc-by-sa', 'cc0', 'cc-by'].indexOf(photo.license_code) > -1
        } );
    });
};

const fetchObservationToJson = ( r ) => {
    return r.json().then((j) => {
        return {
            photos: flatten(
                j.results.map(mapObservation)
            ),
            page: j.page + 1
        };
    });
}

const fetcher = {
    fetchByObservationId: ( id ) => {
        return fetch(`https://api.inaturalist.org/v1/observations/${id}`).then(fetchObservationToJson);
    },
    fetchForUser: (username, page = 1) => {
        return fetch( `https://api.inaturalist.org/v1/observations?user_id=${username}&quality_grade=research&page=${page}` ).then(fetchObservationToJson);
    },
    fetchAllPhotos: ( id, page, allResults = [] ) => {
        return fetcher.fetchAllPhotosWithMetadata( id, page, allResults, page + 10 ).then((results) => {
            return results.photos;
        });
    },
    fetchAllPhotosWithMetadata: ( id, page, allResults = [], maxPage = 2 ) => {
        return fetch( `https://api.inaturalist.org/v1/observations?quality_grade=research&taxon_id=${id}&order_by=votes&page=${page}` ).then((r) => {
            return r.json();
        }).then((j) => {
            const results = j.results || [];
            allResults = allResults.concat( flatten( results.map(mapObservation) ) );
            if ( j.total_results > j.page * j.per_page && page < maxPage ) {
                return fetcher.fetchAllPhotosWithMetadata( id, page + 1, allResults, maxPage );
            } else {
                return {
                    photos: allResults,
                    page: page
                };
            }
        });
    },
    fetchPhotos: ( id, page = 1 ) => {
        return fetcher.fetchAllPhotosWithMetadata( id, page, [], page + 1 );
    },
    fetchTaxa: function ( id, page ) {
        return Promise.all( [
            this.fetchPhotos(id, page).then(({ photos, page })=>({
                photos, page
            })),
            fetch( `https://api.inaturalist.org/v1/taxa/${id}` )
                .then( (r) => r.json() ).then((j) => {
                    const result = j.results[0] || false;
                    if (!result) {
                        throw new Error('No iNaturalist entity found.');
                    }
                    const name = result.name;
                    const taxaInfo = {
                        searchUrl: `/wiki/Special:Search?search=${name}`,
                        url: result.wikipedia_url,
                        id,
                        summary: result.wikipedia_summary,
                        name,
                    };
                    return result.wikipedia_url ?
                        lookupWikidataId(result.wikipedia_url.split('/').slice(-1), taxaInfo) : taxaInfo
                })
        ]).then((responses) => {
            const x = Object.assign.apply({}, responses);
            return x;
        });
    }
}

export default fetcher;
