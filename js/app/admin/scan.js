
export const scan = (() => {

    let toastBootstrap = null;

    const x = () => {

        window.scannerQrCode.start((decodedText) => {
            window.scannerQrCode.pause();
            alert(decodedText);
            toastBootstrap.show();

            window.scannerQrCode.resume();
        }).then(() => {
            document.getElementById('render').querySelector('video').classList.add('rounded-4');
        });
    };

    return {
        init: async () => {
            toastBootstrap = window.bootstrap.Toast.getOrCreateInstance(document.getElementById('liveToast'));
            if (typeof window.scannerQrCode === 'undefined') {
                await new Promise((res, rej) => {
                    const sc = document.createElement('script');
                    sc.onload = res;
                    sc.onerror = rej;

                    sc.src = './dist/scanner.js';
                    document.head.appendChild(sc);
                });
            }

            window.scannerQrCode.init('render');

            document.getElementById('button-scanner').addEventListener('click', x);

            document.getElementById('button-scanner-stop').addEventListener('click', () => {
                window.scannerQrCode.stop();
            });
        },
        // start,
        // pause,
    };
})();