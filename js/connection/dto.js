export const dto = (() => {

    /**
     * @param {{ uuid: string, name: string, presence: boolean|null, comment: string|null, created_at: string, is_parent: boolean, gif_url: string|null, comments: ReturnType<getCommentResponse>[], like_count: number, is_like: boolean, is_comment: boolean }} data
     * @returns {{ uuid: string, name: string, presence: boolean|null, comment: string|null, created_at: string, is_parent: boolean, gif_url: string|null, comments: ReturnType<getCommentResponse>[], like_count: number, is_like: boolean, is_comment: boolean }}
     */
    const getCommentResponse = ({ uuid, name, presence, comment, created_at, is_parent, gif_url, comments, like_count, is_like, is_comment }) => {
        return {
            uuid,
            name,
            presence,
            comment,
            created_at,
            is_parent,
            is_like,
            is_comment,
            gif_url,
            comments: comments?.map(getCommentResponse) ?? [],
            like_count: like_count ?? 0,
        };
    };

    /**
     * @param {{ uuid: string, name: string, presence: boolean|null, comment: string|null, created_at: string, is_parent: boolean, gif_url: string|null, comments: ReturnType<getCommentResponse>[], like_count: number, is_like: boolean, is_comment: boolean }[]} data
     * @returns {{ uuid: string, name: string, presence: boolean|null, comment: string|null, created_at: string, is_parent: boolean, gif_url: string|null, comments: ReturnType<getCommentResponse>[], like_count: number, is_like: boolean, is_comment: boolean }[]}
     */
    const getCommentsResponse = (data) => data.map(getCommentResponse);

    /**
     * @param {{ count: number, lists: { uuid: string, name: string, presence: boolean|null, comment: string|null, created_at: string, is_parent: boolean, gif_url: string|null, comments: ReturnType<getCommentResponse>[], like_count: number, is_like: boolean, is_comment: boolean }[] }} data
     * @returns {{ count: number, lists: { uuid: string, name: string, presence: boolean|null, comment: string|null, created_at: string, is_parent: boolean, gif_url: string|null, comments: ReturnType<getCommentResponse>[], like_count: number, is_like: boolean, is_comment: boolean }[] }}
     */
    const getCommentsResponseV2 = (data) => {
        return {
            count: data.count,
            lists: getCommentsResponse(data.lists),
        };
    };

    /**
     * @param {{status: boolean}} status
     * @returns {{status: boolean}}
     */
    const statusResponse = ({ status }) => {
        return {
            status,
        };
    };

    /**
     * @param {{token: string}} token
     * @returns {{token: string}}
     */
    const tokenResponse = ({ token }) => {
        return {
            token,
        };
    };

    /**
     * @param {{uuid: string}} uuid
     * @returns {{uuid: string}}
     */
    const uuidResponse = ({ uuid }) => {
        return {
            uuid,
        };
    };

    /**
     * @param {string} uuid
     * @param {boolean} show
     * @returns {{uuid: string, show: boolean}}
     */
    const commentShowMore = (uuid, show = false) => {
        return {
            uuid,
            show,
        };
    };

    /**
     * @param {string} id
     * @param {string|null} comment
     * @param {string|null} gif_id
     * @returns {{id: string, comment: string|null, gif_id: string|null}}
     */
    const postCommentRequest = (id, comment, gif_id) => {
        return {
            id,
            comment,
            gif_id,
        };
    };

    /**
     * @param {string} email
     * @param {string} password
     * @returns {{email: string, password: string}}
     */
    const postSessionRequest = (email, password) => {
        return {
            email: email,
            password: password,
        };
    };

    /**
     * @param {string|null} comment
     * @param {string|null} gif_id
     * @returns {{comment: string|null, gif_id: string|null}}
     */
    const updateCommentRequest = (comment, gif_id) => {
        return {
            comment: comment,
            gif_id: gif_id,
        };
    };

    return {
        uuidResponse,
        tokenResponse,
        statusResponse,
        getCommentResponse,
        getCommentsResponse,
        getCommentsResponseV2,
        commentShowMore,
        postCommentRequest,
        postSessionRequest,
        updateCommentRequest,
    };
})();