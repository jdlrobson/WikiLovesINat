import node from './node.js';
import gallery from './gallery.js';

export default function (taxa, onClickUploadToCommons, uploadedFiles) {
    const { wid, url, thumbnail, name, summary, id, photos } = taxa;
    return node( 'div', { class: 'taxon' },
        [
            node( 'h2', {}, name ),
            summary && node( 'p', {dangerouslySetInnerHTML: { __html: summary }}, [] ),
            thumbnail && node( 'div', {}, [
                node( 'img', { src: thumbnail })
            ]) || node( 'p', {}, 'This article has no image! You can help fix that!' ),
            node( 'p', {}, 'Wikipedia URL(s):' ),
                node( 'a', {
                    class: 'taxon__link',
                    href: url
                }, url ? 'Wikipedia' : 'Wikipedia (unavailable)' ),
                node( 'a', {
                    class: 'taxon__link',
                    href: wid && `//wikidata.org/wiki/${wid}`
                }, wid ? 'Wikidata' : 'Wikidata (unavailable)' ),
            gallery(photos || [], id, name, onClickUploadToCommons, uploadedFiles)
        ]
    );
}