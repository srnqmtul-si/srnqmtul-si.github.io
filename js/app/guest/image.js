import { progress } from './progress.js';
import { cache } from '../../connection/cache.js';

export const image = (() => {

    /**
     * @type {NodeListOf<HTMLImageElement>|null}
     */
    let images = null;

    /**
     * @type {ReturnType<typeof cache>|null}
     */
    let c = null;

    let hasSrc = false;

    /**
     * @type {object[]}
     */
    const urlCache = [];

    /**
     * @param {string} src 
     * @returns {Promise<HTMLImageElement>}
     */
    const loadedImage = (src) => new Promise((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = src;
    });

    /**
     * @param {HTMLImageElement} el 
     * @param {string} src 
     * @returns {Promise<void>}
     */
    const appendImage = (el, src) => loadedImage(src).then((img) => {
        el.width = img.naturalWidth;
        el.height = img.naturalHeight;
        el.src = img.src;
        img.remove();

        progress.complete('image');
    });

    /**
     * @param {HTMLImageElement} el 
     * @returns {void}
     */
    const getByFetch = (el) => {
        urlCache.push({
            url: el.getAttribute('data-src'),
            res: (url) => appendImage(el, url),
            rej: (err) => {
                console.error(err);
                progress.invalid('image');
            },
        });
    };

    /**
     * @param {HTMLImageElement} el 
     * @returns {void}
     */
    const getByDefault = (el) => {
        el.onerror = () => progress.invalid('image');
        el.onload = () => {
            el.width = el.naturalWidth;
            el.height = el.naturalHeight;
            progress.complete('image');
        };

        if (el.complete && el.naturalWidth !== 0 && el.naturalHeight !== 0) {
            progress.complete('image');
        } else if (el.complete) {
            progress.invalid('image');
        }
    };

    /**
     * @returns {boolean}
     */
    const hasDataSrc = () => hasSrc;

    /**
     * @returns {Promise<void>}
     */
    const load = async () => {
        const arrImages = Array.from(images);

        arrImages.filter((el) => el.getAttribute('data-fetch-img') !== 'high').forEach((el) => {
            el.hasAttribute('data-src') ? getByFetch(el) : getByDefault(el);
        });

        if (!hasSrc) {
            return;
        }

        await c.open();
        await Promise.allSettled(arrImages.filter((el) => el.getAttribute('data-fetch-img') === 'high').map((el) => {
            return c.get(el.getAttribute('data-src'), progress.getAbort())
                .then((i) => appendImage(el, i))
                .then(() => el.classList.remove('opacity-0'));
        }));
        await c.run(urlCache, progress.getAbort());
    };

    /**
     * @param {string} blobUrl 
     * @returns {Promise<Response>}
     */
    const download = (blobUrl) => c.download(blobUrl, `image_${Date.now()}`);

    /**
    * @param {string} text 
    * @param {string|null} [logoUrl=null] 
    * @returns {Promise<string>}
    */
    const generateQr = (text, logoUrl = null) => {
        const size = 300;
        const logoSizePercent = 0.2;

        const options = {
            quality: 1,
            type: 'image/png',
            errorCorrectionLevel: 'H',
            width: size,
        };

        /**
         * @returns {Promise<string>}
         */
        const getQrCodeImg = async () => {

            if (typeof window.generateQrCode === 'undefined') {
                await new Promise((res, rej) => {
                    const sc = document.createElement('script');
                    sc.onload = res;
                    sc.onerror = rej;

                    sc.src = './dist/generate.js';
                    document.head.appendChild(sc);
                });
            }

            return window.generateQrCode.generate(text, options);
        };

        if (!logoUrl) {
            return getQrCodeImg();
        }

        const canvas = document.createElement('canvas');
        canvas.height = size;
        canvas.width = size;

        return c.open().then(() => Promise.all([
            getQrCodeImg().then(loadedImage),
            c.get(logoUrl).then(loadedImage),
        ]).then(([qrImg, logoImg]) => {

            const logoSize = logoSizePercent * size;
            const centerX = size / 2;
            const centerY = size / 2;
            const radius = logoSize / 2;

            const sourceSize = Math.min(logoImg.width, logoImg.height);
            const sx = (logoImg.width - sourceSize) / 2;
            const sy = (logoImg.height - sourceSize) / 2;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(qrImg, 0, 0, size, size);

            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius + (logoSizePercent * radius), 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.closePath();
            ctx.restore();

            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(logoImg, sx, sy, sourceSize, sourceSize, centerX - radius, centerY - radius, logoSize, logoSize);
            ctx.restore();

            const result = new Promise((res, rej) => {
                canvas.onerror = rej;
                canvas.toBlob((b) => b ? res(URL.createObjectURL(b)) : rej(new Error('Failed to create blob')), options.type, options.quality);
            });

            return result.finally(() => {
                URL.revokeObjectURL(qrImg.src);
                qrImg.remove();
                logoImg.remove();
                canvas.remove();
            });
        }));
    };

    /**
     * @returns {object}
     */
    const init = () => {
        c = cache('image').withForceCache();
        images = document.querySelectorAll('img');

        images.forEach(progress.add);
        hasSrc = Array.from(images).some((i) => i.hasAttribute('data-src'));

        return {
            load,
            download,
            hasDataSrc,
            generateQr,
        };
    };

    return {
        init,
    };
})();