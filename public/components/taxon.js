import node from './node.js';
import gallery from './gallery.js';

export default function (taxa, onClickUploadToCommons, uploadedFiles, onClickMore) {
    const { wid, url, thumbnail, name, summary, id, photos, searchUrl } = taxa;
    return node( 'div', { class: 'taxon' },
        [
            node( 'h2', {}, name ),
            summary && node( 'p', {dangerouslySetInnerHTML: { __html: summary }}, [] ),
            thumbnail && node( 'div', {}, [
                node( 'img', { src: thumbnail })
            ]) || ( url && node( 'p', {}, 'This article has no image! You can help fix that!' ) ),
            node( 'p', {}, url ? 'Wikipedia URL(s):' : 'iNaturalist entity is not linked to a Wikipedia article.' ),
                node( 'a', {
                    class: 'taxon__link',
                    href: url ? url : `https://en.wikipedia.org/${searchUrl}`
                }, url ? 'Wikipedia' : 'Search Wikipedia' ),
                node( 'a', {
                    class: 'taxon__link',
                    href: wid ? `https://www.wikidata.org/wiki/${wid}` : `https://www.wikidata.org/${searchUrl}`
                }, wid ? 'Wikidata' : 'Search Wikidata' ),
            gallery(photos || [], id, name, onClickUploadToCommons, uploadedFiles, onClickMore)
        ]
    );
}