import {ValidationError, InvalidResponseCode} from './errors';


export default function makeSingle(baseClass) {
    class SingleObjectResource extends baseClass {

        fetch(kwargs, query, method='get') {
            const thePath = this.buildThePath(kwargs);

            return this.handleRequest(this.createRequest(method, thePath, query))
                .then(response => response)
                .catch((err) => {
                    throw err;
                });
        }

        head(kwargs, query) {
            return this.get(kwargs, query, 'head');
        }

        post(kwargs, data, query, method='post') {
            const thePath = this.buildThePath(kwargs);

            return this.handleRequest(this.createRequest(method, thePath, query, data || {}))
                .then(response => response)
                .catch((err) => {
                    if (err instanceof InvalidResponseCode) {
                        if (err.statusCode === 400) {
                            throw new ValidationError(err, this.options);
                        }
                    }

                    throw err;
                });
        }

        patch(kwargs, data, query) {
            return this.post(kwargs, data, query, 'patch');
        }

        put(kwargs, data, query) {
            return this.post(kwargs, data, query, 'put');
        }

        del(kwargs, data, query) {
            return this.post(kwargs, data, query, 'del');
        }

        /**
         * Note: For internal use
         */
        sourcePost(kwargs, data, query, uuid, errCb) {
            return new Promise((resolve, reject) => {
                this.post(kwargs, data, query).then(response => {
                    if (uuid) {
                        resolve({data: response, uuid: uuid});
                    } else {
                        resolve(response);
                    }
                }).catch(error => {
                    // If we get something other than 400, lets trigger errCb|this.onSourceError
                    if (error.statusCode !== 400) {
                        (errCb || this.onSourceError)(error);
                    }

                    // Also reject
                    reject({error, postData});
                });
            });
        }
    }

    return SingleObjectResource;
}
