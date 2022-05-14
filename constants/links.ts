import { CurrencyKey } from './currency';

export const PROD_HOSTNAME = 'staking.synthetix.io';

export const EXTERNAL_LINKS = {
	Trading: {
		Kwenta: 'https://kwenta.io',
		DexAG: 'https://dex.ag/',
		Uniswap: 'https://uniswap.exchange/',
		OneInchLink: (from: CurrencyKey, to: CurrencyKey) =>
			`https://1inch.exchange/#/1/swap/${from}/${to}`,
	},
	Synthetix: {
		Home: 'https://www.synthetix.io',
		Litepaper: 'https://docs.synthetix.io/litepaper/',
		Incentives: 'https://docs.synthetix.io/incentives/',
		SIP60: 'https://sips.synthetix.io/sips/sip-60',
		OEBlog: 'https://blog.synthetix.io/l2-mainnet-launch/',
		MintrL2: 'https://l2.mintr.synthetix.io',
		HamalRelease: 'https://blog.synthetix.io/the-hamal-release/',
		DebtPoolSynthesis: 'https://blog.synthetix.io/debt-pool-synthesis-2/',
		StakingGuide: 'https://blog.synthetix.io/basics-of-staking-snx-2022/',
		SIP148Liquidations: 'https://blog.synthetix.io/new-liquidation-mechanism/',
	},
	Social: {
		Twitter: 'https://twitter.com/synthetix_io',
		Blog: 'https://blog.synthetix.io/',
		Discord: 'https://discordapp.com/invite/AEdUHzt',
		GitHub: 'https://github.com/synthetixio/staking',
	},
	TokenLists: {
		Synthetix: 'https://synths.snx.eth.link',
		OneInch: 'https://gateway.ipfs.io/ipns/tokens.1inch.eth',
		Zapper: 'https://zapper.fi/api/token-list',
	},
	L2: {
		Optimism: 'https://app.optimism.io/',
		SynthetixDeposit: 'https://app.optimism.io/bridge',
		SynthetixWithdrawal: 'https://app.optimism.io/bridge/withdraw',
	},
};
