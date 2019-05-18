import node from './node.js';

export default ( photos, taxon ) => {
    return node( 'div', { class: 'gallery' }, [
            node('h3', {}, 'Select an image'),
            node('div', { class: 'gallery__thumbnails'},
                photos.length ? photos.map((photo) => {
                    const size = photo.original_dimensions;
                    return node('a', {
                        href: photo.original_url,
                        class: !photo.commonsCompatLicense ? 'thumb thumb--sad' : 'thumb'
                    }, [
                        node('img', {
                            src: photo.small_url
                        }),
                        node('div', {}, photo.license_code || 'all rights reserved'),
                        node('div', {}, `${size.width}x${size.height}`),
                        node('a', { href: `https://www.inaturalist.org/photos/${photo.native_photo_id}`},
                            'View on iNaturalist')
                    ]);
                }) : node( 'a',
                    { href: `https://www.inaturalist.org/taxa/${taxon}`
                }, 'iNaturalist has no photos. Challenge accepted!')
            )
        ]
    );
};
