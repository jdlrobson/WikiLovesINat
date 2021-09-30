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

const fetcher = {
    fetchAllPhotos: ( id, page, allResults = [] ) => {
        return fetch( `https://api.inaturalist.org/v1/observations?quality_grade=research&taxon_id=${id}&order_by=votes&page=${page}` ).then((r) => {
            return r.json();
        }).then((j) => {
            const results = j.results || [];
            allResults = allResults.concat( flatten( results.map((r) => {
                return r.photos.map((photo) => {
                    return Object.assign( photo, {
                        commonsCompatLicense:
                            ['cc-by-sa', 'cc0', 'cc-by'].indexOf(photo.license_code) > -1
                    } );
                });
            } ) ) );
            // workaround for #6
            // fetch first 10 pages (TODO: Make it possible to scroll through all results)
            if ( j.total_results > j.page * j.per_page && page < 10 ) {
                return fetcher.fetchAllPhotos( id, page + 1, allResults );
            } else {
                return allResults;
            }
        });
    },
    fetchPhotos: ( id, page = 1 ) => {
        console.log( 1 );
        return fetcher.fetchAllPhotos( id, page );
    },
    fetchTaxa: function ( id ) {
        return Promise.all( [
            this.fetchPhotos(id).then((photos)=>({
                photos
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
