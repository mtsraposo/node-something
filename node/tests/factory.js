import { QUOTE } from 'src/db/models/constants';

class Factory {
    constructor({ modelsByName, transaction }) {
        this.modelsByName = modelsByName;
        this.transaction = transaction;
    }

    async insert(model, attrs = {}) {
        switch (model) {
            case QUOTE:
                return await this._insertQuote(attrs);
            default:
                throw new Error('Model not found');
        }
    }

    async _insertQuote(attrs) {
        const Quote = this.modelsByName[QUOTE];
        await Quote.create(
            {
                time: '2023-08-03 14:30:02-07',
                symbol: 'BTCUSDT',
                price: 23000.0,
                ...attrs,
            },
            { transaction: this.transaction },
        );
        return Quote;
    }
}

export default Factory;
