function flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
      return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
}

const fetcher = {
    fetchPhotos: ( id ) => {
        return fetch( `https://api.inaturalist.org/v1/observations?verifiable=true&taxon_id=${id}&order_by=votes` ).then((r) => {
            return r.json();
        }).then((j) => {
            const results = j.results || [];
            return flatten( results.map((r) => {
                return r.photos.map((photo) => {
                    return Object.assign( photo, {
                        commonsCompatLicense:
                            ['cc-by-sa', 'cc0', 'cc-by'].indexOf(photo.license_code) > -1
                    } );
                });
            } ) ).sort((p) => p.commonsCompatLicense ? -1 : 1);
        } );
    },
    fetchTaxa: function ( id ) {
        return this.fetchPhotos( id ).then( ( photos ) => {
            return fetch( `https://api.inaturalist.org/v1/taxa/${id}` )
            .then( (r) => r.json() )
            .then((j) => {
                const result = j.results[0] || {};
                const name = result.name;
                return {
                    url: result.wikipedia_url || `https://en.wikipedia.org/wiki/Special:Search?search=${name}`,
                    id,
                    summary: result.wikipedia_summary,
                    name,
                    photos
                };
            } );
        });
    }
}

export default fetcher;
