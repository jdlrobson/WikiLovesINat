import node from './node.js';

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

export default ( photos, taxon, name, onClickUploadToCommons, uploadedFiles ) => {
    return node( 'div', { class: 'gallery' }, [
            node('h3', {}, 'Images on iNaturalist'),
            node('div', { class: 'gallery__thumbnails'},
                photos.length ? photos.map((photo) => {
                    const size = photo.original_dimensions;
                    const photoId = photo.native_photo_id || photo.id;
                    const iNatUrl = `https://www.inaturalist.org/photos/${photoId}`;
                    const iNatHomeUrl = `https://inaturalist.org`;
                    const dest = 'https://commons.wikimedia.org/wiki/Special:Upload';
                    const suggestedThumbUrl = photo.small_url || photo.url;
                    const ext = suggestedThumbUrl.split( '?' )[0].split('.').slice( -1 );
                    const host = 'https://static.inaturalist.org/photos';
                    const thumbnailUrl = `${host}/${photoId}/small.${ext}`;
                    const original = `${host}/${photoId}/original.${ext}`;
                    const d = new Date();
                    const targetName = `${name} imported from iNaturalist photo ${photoId} on ${prettyDate()}.jpg`;
                    const description = `{{Information
  |description={{en|1=Photo of ${name} uploaded from [${iNatHomeUrl} iNaturalist].}}
  |date=${d.getFullYear()}-${d.getMonth()}-${d.getDate()}
  |source=${iNatUrl}
  |author=${photo.attribution}
}}
{{iNaturalistreview}}

[[Category:Media from iNaturalist]]`;
                    const uploadCommonsLink = node('a', {
                        class: 'gallery__link',
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
                            )
                        ]
                    );
                    return node('div', {
                        class: !photo.commonsCompatLicense ? 'thumb thumb--sad' : 'thumb'
                    }, [
                        node('img', {
                            src: thumbnailUrl
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
            )
        ]
    );
};
