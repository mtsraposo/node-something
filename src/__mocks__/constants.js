export const ADDITIONAL_RESULTS_BY_METHOD = new Map(
    [
        ['order.place', {
            orderId: 12569099453,
            orderListId: -1, // always -1 for singular orders
            clientOrderId: '4d96324ff9d44481926157ec08158a40',
        }],
        ['account.status', {
            makerCommission: 15,
            takerCommission: 15,
            buyerCommission: 0,
            sellerCommission: 0,
            canTrade: true,
            canWithdraw: true,
            canDeposit: true,
            commissionRates: {
                maker: '0.00150000',
                taker: '0.00150000',
                buyer: '0.00000000',
                seller: '0.00000000',
            },
            brokered: false,
            requireSelfTradePrevention: false,
            preventSor: false,
            updateTime: 1660801833000,
            accountType: 'SPOT',
            balances: [[Object], [Object], [Object]],
            permissions: ['SPOT'],
            uid: 354937868,
        }],
    ],
);

export const RATE_LIMITS_BY_METHOD = new Map([
    ['order.place', [
        {
            rateLimitType: 'ORDERS',
            interval: 'SECOND',
            intervalNum: 10,
            limit: 50,
            count: 1,
        },
        {
            rateLimitType: 'ORDERS',
            interval: 'DAY',
            intervalNum: 1,
            limit: 160000,
            count: 1,
        },
        {
            rateLimitType: 'REQUEST_WEIGHT',
            interval: 'MINUTE',
            intervalNum: 1,
            limit: 1200,
            count: 1,
        }]],
    ['ping', [
        {
            'rateLimitType': 'REQUEST_WEIGHT',
            'interval': 'MINUTE',
            'intervalNum': 1,
            'limit': 1200,
            'count': 1,
        },
    ]],
    ['account.status', [
        {
            rateLimitType: 'REQUEST_WEIGHT',
            interval: 'MINUTE',
            intervalNum: 1,
            limit: 1200,
            count: 10,
        },
    ]],
]);