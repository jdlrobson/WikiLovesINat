let cache;

const extractId = ( uri ) => {
    return decodeURIComponent(
        uri.split('/').slice(-1)[0].replace(/_/g, ' ' )
    )
}
export default {
    cachedSuggestions: JSON.parse( localStorage.getItem( 'suggestions' ) || '[]' ),
    missing: function () {
        if ( cache ) {
            return cache;
        }
        // find all wikidata entries without collage and image
        cache = fetch(
            'https://query.wikidata.org/sparql?query=SELECT%20*%20WHERE%20%7B%0A%20%20%20%3Ftaxon%20wdt%3AP31%20wd%3AQ16521%20%3B%20%23%20Wikidata%20is%20about%20a%20taxon%0A%20%20%20%20%20%20%20%20%20%20wdt%3AP3151%20%3FiNatTaxonId%20.%0A%20%20%20FILTER%20NOT%20EXISTS%20%7B%3Ftaxon%20wdt%3AP18%20%3Fimage%20.%7D%0A%20%20%20%20FILTER%20NOT%20EXISTS%20%7B%3Ftaxon%20wdt%3AP2716%20%3Fcollage_image%20.%7D%0A%20%20%20%3Farticle%20schema%3Aabout%20%3Ftaxon%20%3B%20%23%20Taxons%20with%20a%20Wikipedia%20article%0A%20%20%20%20%20%20%20%20%20%20%20%20schema%3AisPartOf%20%3Chttps%3A%2F%2Fen.wikipedia.org%2F%3E%20.%0A%7D%0ALIMIT%201000%0A%0A',
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
            const suggestions = j.results.bindings.map((r) => {
                const article = r.article.value;
                return {
                    name: extractId( article ),
                    taxon: parseInt( r.iNatTaxonId.value, 10),
                    article,
                    wikidata: extractId( r.taxon.value ),
                    wikidataUri: r.taxon.value
                }
            });
            localStorage.setItem( 'suggestions', JSON.stringify( suggestions ) )
            return suggestions;
        }).catch((e) => console.log(e));
        return cache;
    }
}
