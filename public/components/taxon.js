import node from './node.js';
import gallery from './gallery.js';

export default function (taxa, wikidata) {
    console.log(taxa);
    return node( 'div', { class: 'taxon' },
        [
            node( 'h2', {}, taxa.name ),
            taxa.summary && node( 'p', {}, { html: taxa.summary } ),
            node( 'p', {}, 'This article has the following Wikipedia URL(s):' ),
            node( 'a', {
                class: 'taxon__link',
                href: `${taxa.url}`
            }, 'Wikipedia' ),
            wikidata && node( 'a', {
                class: 'taxon__link',
                href: `//wikidata.org/wiki/${wikidata}`
            }, 'Wikidata' ),
            node( 'p', {}, 'This article has no image! You can help fix that!' ),
            gallery( taxa.photos, taxa.id, taxa.name )
        ]
    );
}