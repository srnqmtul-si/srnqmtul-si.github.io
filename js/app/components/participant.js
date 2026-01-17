import { util } from '../../common/util.js';
import { lang } from '../../common/language.js';
import { session } from '../../common/session.js';
import { storage } from '../../common/storage.js';
import { HTTP_GET, HTTP_PATCH, HTTP_POST, request } from '../../connection/request.js';

export const participant = (() => {

    /**
     * @returns {string}
     */
    const onPresent = () => {
        return lang
            .on('id', 'Terima kasih atas rencana kehadiran Anda di momen spesial kami. Jika ingin mengubah status kehadiran, silakan klik')
            .get();
    };

    /**
     * @returns {string}
     */
    const onAbsent = () => {
        return lang
            .on('id', 'Terima kasih telah memberi kabar. Semoga kita bisa dipertemukan di lain waktu. Jika ingin mengubah status kehadiran, silakan klik')
            .get();
    };

    /**
     * @param {HTMLButtonElement} button 
     * @returns {void}
     */
    const forGuest = (button) => {
        const formName = document.getElementById('form-name');
        const formPresence = document.querySelector('input[name="presenceRadios"]:checked');

        if (!formName || formName.value.trim().length === 0) {
            util.notify('please input name').warning();
            return;
        }

        if (!formPresence) {
            util.notify('please select presence').warning();
            return;
        }

        const btn = util.disableButton(button);
        const isNewPrt = !session.getPrtId();

        request(isNewPrt ? HTTP_POST : HTTP_PATCH, '/api/participant')
            .token(session.getToken(), session.getPrtId())
            .body({
                name: formName.value,
                presence: formPresence.value === 'present'
            })
            .send()
            .then((res) => isNewPrt ? session.guest(session.getToken(), res.data.uuid) : res)
            .then(() => {
                const text = formPresence.value === 'present' ? onPresent() : onAbsent();
                document.getElementById('participant-form').classList.add('d-none');
                document.getElementById('participant-information').classList.remove('d-none');
                document.getElementById('participant-information').innerHTML = `${text} <button style="font-size: 0.8rem;" onclick="undangan.participant.changePresence()" class="btn btn-sm btn-outline-auto rounded-4 py-0 shadow-sm" data-offline-disabled="false">ubah</button>`;
                document.getElementById('comments').dispatchEvent(new Event('undangan.comment.show'));
            })
            .finally(() => {
                btn.restore();
            });
    };

    const changePresence = () => {
        document.getElementById('participant-information').classList.add('d-none');
        document.getElementById('participant-form').classList.remove('d-none');
        if (session.getPrtId()) {
            document.querySelector('[onclick="undangan.participant.cancelPresence(this)"]').classList.remove('d-none');
        }
    };

    const cancelPresence = () => {
        document.getElementById('participant-information').classList.remove('d-none');
        document.getElementById('participant-form').classList.add('d-none');
    };

    const renderTracker = (c) => {
        return `
        <div class="mb-1 mt-3">
            <p class="text-theme-auto mb-1 mx-0 mt-0 p-0" style="font-size: 0.7rem;" id="ip-${c.uuid}"><i class="fa-solid fa-location-dot me-1"></i>${util.escapeHtml(c.ip)} <span class="mb-1 placeholder col-2 rounded-3"></span></p>
            <p class="text-theme-auto m-0 p-0" style="font-size: 0.7rem;"><i class="fa-solid fa-mobile-screen-button me-1"></i>${util.parseUserAgent(util.escapeHtml(c.user_agent))}</p>
        </div>`;
    };

    const fetchTracker = (c) => {

        /**
         * @param {string} result 
         * @returns {void}
         */
        const setResult = (result) => {
            const commentIp = document.getElementById(`ip-${util.escapeHtml(c.uuid)}`);
            util.safeInnerHTML(commentIp, `<i class="fa-solid fa-location-dot me-1"></i>${util.escapeHtml(c.ip)} <strong>${util.escapeHtml(result)}</strong>`);
        };

        // Free for commercial and non-commercial use.
        return request(HTTP_GET, `https://apip.cc/api-json/${c.ip}`)
            .withCache()
            .withRetry()
            .default()
            .then((res) => res.json())
            .then((res) => {
                let result = 'localhost';

                if (res.status === 'success') {
                    if (res.City.length !== 0 && res.RegionName.length !== 0) {
                        result = res.City + ' - ' + res.RegionName;
                    } else if (res.Capital.length !== 0 && res.CountryName.length !== 0) {
                        result = res.Capital + ' - ' + res.CountryName;
                    }
                }

                setResult(result);
            })
            .catch((err) => setResult(err.message));
    };

    const init = () => {
        if (session.getPrtId()) {
            const text = storage('config').get('user').presence ? onPresent() : onAbsent();
            document.getElementById('participant-form').classList.add('d-none');
            document.getElementById('participant-information').innerHTML = `${text} <button style="font-size: 0.8rem;" onclick="undangan.participant.changePresence()" class="btn btn-sm btn-outline-auto rounded-4 py-0 shadow-sm" data-offline-disabled="false">ubah</button>`;
        }
    };

    return {
        init,
        forGuest,
        changePresence,
        cancelPresence
    };
})();