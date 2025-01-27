import node from './node.js';
import { INAT_STATIC_HOST, INAT_STATIC_HOST_BACKUP } from '../constants.js';

const licenseMap = ( iNatlicense ) => {
    switch ( iNatlicense ) {
        case 'cc-by':
            return 'cc-by-4.0';
        case 'cc-by-sa':
            return 'cc-by-sa-4.0';
        case 'cc0':
            return 'Cc-zero';
        default:
            return '';
    }
};

const prettyMonth = (month) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month];
};

const prettyDate = () => {
    const d = new Date();
    return `${d.getDate()} ${prettyMonth(d.getMonth())} ${d.getFullYear()}`
};

const empty = ( taxon ) => {
    return node( 'div', {}, [
        node( 'a',
            { href: `https://www.inaturalist.org/taxa/${taxon}` },
            'iNaturalist has no photos of this taxon.'
        )
    ] )
};

const wikidataPostToUrl = ( filename, qid ) => {
    return `https://www.wikidata.org/wiki/${qid}`;
}

const padDateComponent = (d) => {
    if ( d < 10 ) {
        return '0' + d;
    } else {
        return d;
    }
};

export default ( photos, taxon, scientificName, qid, onClickUploadToCommons, uploadedFiles, onClickMore ) => {
    return node( 'div', { class: 'gallery' }, [
            node('h3', {}, 'Images on iNaturalist'),
            node('div', { class: 'gallery__thumbnails'},
                photos.length ? photos.map((photo) => {
                    const location = photo.coords ?
                        `{{Object location dec|${photo.coords.split(',').join('|')}}}` : '';
                    const observed = photo.observedDate;
                    const size = photo.original_dimensions;
                    const photoId = photo.native_photo_id || photo.id;
                    const iNatUrl = `https://www.inaturalist.org/photos/${photoId}`;
                    const iNatHomeUrl = `https://inaturalist.org`;
                    const taxonName = photo.taxonName || scientificName;
                    const dest = 'https://commons.wikimedia.org/wiki/Special:Upload';
                    const suggestedThumbUrl = photo.small_url || photo.url;
                    const ext = suggestedThumbUrl.split( '?' )[0].split('.').slice( -1 );
                    const host = `${INAT_STATIC_HOST}photos`;
                    const thumbnailUrl = `${host}/${photoId}/small.${ext}`;
                    const original = `${host}/${photoId}/original.${ext}`;
                    let d = new Date(observed);
                    let timestamp = '';
                    if (isNaN(d.getTime())) {
                        const m= observed.match(/([0-9]+)[-/]([0-9]+)[-/]([0-9]+)/);
                        if (m && m.length === 4) {
                            timestamp = `{{date|${m[1]}|${m[2]}|${m[3]}}}`;
                        } else {
                            timestamp = '';
                        }
                    } else {
                        timestamp = `{{date|${d.getFullYear()}|${padDateComponent(d.getMonth())}|${padDateComponent(d.getDate())}}}`;
                    }
                    const targetName = photo.place ?
                        `${taxonName}, ${photo.place} imported from iNaturalist photo ${photoId}.jpg`:
                        `${taxonName} imported from iNaturalist photo ${photoId} on ${prettyDate()}.jpg`;
                    const description = `{{Information
  |description={{en|1=Photo of ${taxonName} (${scientificName}) uploaded from [${iNatHomeUrl} iNaturalist].}}
  |date=${timestamp}
  |source=${iNatUrl}
  |author=${photo.attribution}
}}
{{iNaturalistreview}}
${location}
[[Category:Media uploaded with WikiLovesINat]]
[[Category:Media from iNaturalist]]`;
                    const uploadCommonsLink = node('a', {
                        class: 'gallery__link gallery__link--commons-upload',
                        target: '_blank',
                        onClick: () => {
                            onClickUploadToCommons(iNatUrl);
                        },
                        href: `${dest}?wpUploadDescription=${encodeURIComponent(description)}&wpLicense=${licenseMap(photo.license_code)}&wpDestFile=${targetName}&wpSourceType=url&wpUploadFileURL=${original}`
                    }, 'Upload to Commons!');
                    const wikitextHelper = node('div', {
                        class: 'gallery__wikitext-helper',
                        style: ( uploadedFiles || [] ).indexOf(iNatUrl) > -1 ? '' : 'display: none'
                    },
                        [
                            node( 'label', {
                                class: 'gallery__wikitext-helper__block',
                            }, 'Incorporate this wikitext in the Wikipedia article' ),
                            node('textarea',
                                {
                                    class: 'gallery__wikitext-helper__block',
                                },
                                `{{Speciesbox
                                    | image = ${targetName}
                                }}`
                            ),
                            node('a', {
                                href: wikidataPostToUrl(
                                    targetName,
                                    qid
                                )
                            }, 'Post to Wikidata.org')
                        ]
                    );
                    return node('div', {
                        class: !photo.commonsCompatLicense ? 'thumb thumb--sad' : 'thumb'
                    }, [
                        node('img', {
                            src: thumbnailUrl,
                            onError: (ev) => {
                                const node = ev.target;
                                const src = node.getAttribute('src');
                                const link = node && node.parentNode && node.parentNode.querySelector('.gallery__link--commons-upload');
                                if ( link ) {
                                    link.setAttribute(
                                        'href',
                                        link.getAttribute('href').replace(
                                            INAT_STATIC_HOST, INAT_STATIC_HOST_BACKUP
                                        )
                                    )
                                }
                                node.setAttribute(
                                    'src',
                                    src.replace( INAT_STATIC_HOST, INAT_STATIC_HOST_BACKUP )
                                );
                            }
                        }),
                        node('div', {}, photo.license_code || 'all rights reserved'),
                        size && node('div', {}, `${size.width}x${size.height}`),
                        node('a',
                            {
                                class: 'gallery__link',
                                href: iNatUrl
                            },
                            'View on iNaturalist'),
                        photo.commonsCompatLicense && uploadCommonsLink,
                        wikitextHelper
                    ]);
                }) : empty( taxon )
            ),
            onClickMore ? node('button', {
                onClick: onClickMore
            }, 'Load more photos') : null
        ]
    );
};
