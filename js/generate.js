import QRCode from 'qrcode';

window.generateQrCode = (() => {
    return {
        /**
         * @param {string} text 
         * @param {object} options 
         * @returns {Promise<string>}
         */
        generate: (text, options) => new Promise((res, rej) => {
            const canvas = document.createElement('canvas');
            canvas.onerror = (err) => {
                canvas.remove();
                rej(err);
            };

            QRCode.toCanvas(canvas, text, options, (err) => {
                if (err) {
                    canvas.remove();
                    rej(err);
                    return;
                }

                canvas.toBlob((b) => {
                    canvas.remove();
                    if (b) {
                        res(URL.createObjectURL(b));
                    } else {
                        rej(new Error('Failed to create blob'));
                    }
                }, options.type, options.quality);
            });
        }),
    };
})();