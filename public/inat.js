const fetcher = {
    fetchTaxa: function ( id ) {
        return fetch( `https://api.inaturalist.org/v1/taxa/${id}` ).then((r) => {
            return r.json();
        }).then((j) => {
            const results = j.results || [];
            const result = results[0] || [];
            const photos = ( result.taxon_photos || [] ).map((p) => {
                return Object.assign( p.photo, {
                    commonsCompatLicense:
                        ['cc-by-sa', 'cc0', 'cc-by'].indexOf(p.photo.license_code) > -1
                } );
            } ).sort((p) => p.commonsCompatLicense ? -1 : 1);
            const name = result.name;
            return {
                url: result.wikipedia_url || `https://en.wikipedia.org/wiki/Special:Search?search=${name}`,
                id,
                summary: result.wikipedia_summary,
                name,
                photos
            };
        });
    }
}

export default fetcher;
