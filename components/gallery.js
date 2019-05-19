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

export default ( photos, taxon, name ) => {
    return node( 'div', { class: 'gallery' }, [
            node('h3', {}, 'Select an image'),
            node('div', { class: 'gallery__thumbnails'},
                photos.length ? photos.map((photo) => {
                    console.log(photo);
                    const size = photo.original_dimensions;
                    const iNatUrl = `https://www.inaturalist.org/photos/${photo.native_photo_id}`;
                    const dest = 'https://commons.wikimedia.org/wiki/Special:Upload';
                    const targetName = `${name} imported from iNaturalist ${prettyDate()}.jpg`;
                    const description = `Photo of ${name} uploaded from [${iNatUrl} iNaturalist], ${photo.attribution}`;
                    const uploadCommonsLink = node('a', {
                        class: 'gallery__link',
                        target: '_blank',
                        href: `${dest}?wpUploadDescription=${description}&wpLicense=${licenseMap(photo.license_code)}&wpDestFile=${targetName}&wpSourceType=url&wpUploadFileURL=${photo.original_url}`
                    }, 'Upload to Commons!');
                    const wikitextHelper = node('div', {
                        class: 'gallery__wikitext-helper',
                        style: 'display: none'
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

                    uploadCommonsLink.addEventListener( 'click', () => wikitextHelper.removeAttribute('style'))
                    return node('div', {
                        class: !photo.commonsCompatLicense ? 'thumb thumb--sad' : 'thumb'
                    }, [
                        node('img', {
                            src: photo.small_url
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
                }) : node( 'a',
                    { href: `https://www.inaturalist.org/taxa/${taxon}`
                }, 'iNaturalist has no photos. Challenge accepted!')
            )
        ]
    );
};
