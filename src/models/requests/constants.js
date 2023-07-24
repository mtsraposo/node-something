export const REQUIRED_ATTRIBUTES = new Map(
    [
        ['order.place',
            new Set(['symbol', 'side', 'type']),
        ],
        ['account.status',
            new Set(),
        ],
    ],
);
export const REQUIRED_ATTRIBUTES_BY_TYPE = new Map(
    [
        ['order.place',
            new Map(
                [
                    ['LIMIT', new Set(['timeInForce', 'price', 'quantity'])],
                    ['MARKET', new Set(['quantity'])],
                ],
            ),
        ],
        ['account.status',
            new Map([]),
        ],
    ],
);

export const FIELD_ENUMS = new Map(
    [
        ['order.place',
            new Map(
                [
                    ['side', new Set(['BUY', 'SELL'])],
                    ['type', new Set(['LIMIT', 'LIMIT_MAKER', 'MARKET', 'STOP_LOSS', 'STOP_LOSS_LIMIT', 'TAKE_PROFIT', 'TAKE_PROFIT_LIMIT'])],
                    ['newOrderRespType', new Set(['ACK', 'RESULT', 'FULL'])],
                    ['timeInForce', new Set(['GTC', 'IOC', 'FOK'])],
                ],
            ),
        ],
        ['account.status',
            new Map(),
        ],
    ],
);