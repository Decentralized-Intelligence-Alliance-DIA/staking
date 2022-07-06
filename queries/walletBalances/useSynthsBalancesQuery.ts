import { useQuery, UseQueryOptions } from 'react-query';
import { ethers } from 'ethers';
import orderBy from 'lodash/orderBy';
import { wei } from '@synthetixio/wei';

import { CurrencyKey } from '@synthetixio/contracts-interface';
// import { QueryContext } from '../../context';
import type { Balances, SynthBalancesMap } from '@synthetixio/queries/src/types';
import { useRecoilState } from 'recoil';
import { networkState, walletAddressState } from 'store/wallet';
import { selectNetwork } from 'store/wallet/selectNetwork';

type SynthBalancesTuple = [string[], ethers.BigNumber[], ethers.BigNumber[]];

const deploymentsMapping = {
	goerli: () => import('synthetix/publish/deployed/goerli/deployment.json'),
	'goerli-ovm': () => import('synthetix/publish/deployed/goerli-ovm/deployment.json'),
	kovan: () => import('synthetix/publish/deployed/kovan/deployment.json'),
	'kovan-ovm': () => import('synthetix/publish/deployed/kovan-ovm/deployment.json'),
	local: () => import('synthetix/publish/deployed/local/deployment.json'),
	'local-ovm': () => import('synthetix/publish/deployed/local-ovm/deployment.json'),
	mainnet: () => import('synthetix/publish/deployed/mainnet/deployment.json'),
	'mainnet-ovm': () => import('synthetix/publish/deployed/mainnet-ovm/deployment.json'),
	rinkeby: () => import('synthetix/publish/deployed/rinkeby/deployment.json'),
	ropsten: () => import('synthetix/publish/deployed/ropsten/deployment.json'),
};

async function getDeployments({ network, useOvm }) {
	return await deploymentsMapping[`${network}${useOvm ? '-ovm' : ''}`]();
}

// Pass in fs and path to avoid webpack wrapping those
const loadDeploymentFile = ({ network, path, fs, deploymentPath, useOvm = false }) => {
	const deployments = await import('synthetix/publish/deployed/');

	if (!deploymentPath && (!path || !fs)) {
		return data[getFolderNameForNetwork({ network, useOvm })].deployment;
	}
	const pathToDeployment = deploymentPath
		? path.join(deploymentPath, constants.DEPLOYMENT_FILENAME)
		: getPathToNetwork({ network, useOvm, path, file: constants.DEPLOYMENT_FILENAME });

	if (!fs.existsSync(pathToDeployment)) {
		throw Error(`Cannot find deployment for network: ${network}.`);
	}
	return JSON.parse(fs.readFileSync(pathToDeployment));
};

const getTarget = ({
	network = 'mainnet',
	useOvm = false,
	contract,
	path,
	fs,
	deploymentPath,
} = {}) => {
	const deployment = loadDeploymentFile({ network, useOvm, path, fs, deploymentPath });
	if (contract) return deployment.targets[contract];
	else return deployment.targets;
};

/**
 * Retrieve the list of solidity sources for the network - returning the abi and bytecode
 */
const getSource = ({
	network = 'mainnet',
	useOvm = false,
	contract,
	path,
	fs,
	deploymentPath,
} = {}) => {
	const deployment = loadDeploymentFile({ network, useOvm, path, fs, deploymentPath });
	if (contract) return deployment.sources[contract];
	else return deployment.sources;
};

const deployment = {
	sources: {
		SynthUtil: {
			name: 'SynthUtil',
			address: '0x81Aee4EA48f678E172640fB5813cf7A96AFaF6C3',
			source: 'SynthUtil',
			link: 'https://etherscan.io/address/0x81Aee4EA48f678E172640fB5813cf7A96AFaF6C3',
			timestamp: '2020-08-06T00:14:40.000Z',
			txn: 'https://etherscan.io/tx/0xf9c727d79abb8c45375fdf4b2b1138299c24f5b0affa5eaf03fba8cf00f6b1a4',
			network: 'mainnet',
		},
		targets: {
			SynthUtil: {
				bytecode:
					'608060405234801561001057600080fd5b506040516113693803806113698339818101604052602081101561003357600080fd5b5051600080546001600160a01b039092166001600160a01b0319909216919091179055611304806100656000396000f3fe608060405234801561001057600080fd5b50600436106100625760003560e01c80630120be331461006757806327fe55a6146100a5578063492dbcdd14610146578063a827bf481461022c578063d18ab37614610252578063eade6d2d14610276575b600080fd5b6100936004803603604081101561007d57600080fd5b506001600160a01b0381351690602001356102ce565b60408051918252519081900360200190f35b6100ad61054d565b604051808060200180602001838103835285818151815260200191508051906020019060200280838360005b838110156100f15781810151838201526020016100d9565b50505050905001838103825284818151815260200191508051906020019060200280838360005b83811015610130578181015183820152602001610118565b5050505090500194505050505060405180910390f35b61014e6107b9565b60405180806020018060200180602001848103845287818151815260200191508051906020019060200280838360005b8381101561019657818101518382015260200161017e565b50505050905001848103835286818151815260200191508051906020019060200280838360005b838110156101d55781810151838201526020016101bd565b50505050905001848103825285818151815260200191508051906020019060200280838360005b838110156102145781810151838201526020016101fc565b50505050905001965050505050505060405180910390f35b61014e6004803603602081101561024257600080fd5b50356001600160a01b0316610b32565b61025a610ec9565b604080516001600160a01b039092168252519081900360200190f35b61027e610ed8565b60408051602080825283518183015283519192839290830191858101910280838360005b838110156102ba5781810151838201526020016102a2565b505050509050019250505060405180910390f35b6000806102d9611182565b905060006102e561123f565b90506000826001600160a01b031663dbf633406040518163ffffffff1660e01b815260040160206040518083038186803b15801561032257600080fd5b505afa158015610336573d6000803e3d6000fd5b505050506040513d602081101561034c57600080fd5b5051905060005b81811015610543576000846001600160a01b031663835e119c836040518263ffffffff1660e01b81526004018082815260200191505060206040518083038186803b1580156103a157600080fd5b505afa1580156103b5573d6000803e3d6000fd5b505050506040513d60208110156103cb57600080fd5b50516040805163dbd06c8560e01b815290519192506001600160a01b038087169263654a60ac929185169163dbd06c85916004808301926020929190829003018186803b15801561041b57600080fd5b505afa15801561042f573d6000803e3d6000fd5b505050506040513d602081101561044557600080fd5b5051604080516370a0823160e01b81526001600160a01b038d811660048301529151918616916370a0823191602480820192602092909190829003018186803b15801561049157600080fd5b505afa1580156104a5573d6000803e3d6000fd5b505050506040513d60208110156104bb57600080fd5b5051604080516001600160e01b031960e086901b16815260048101939093526024830191909152604482018b9052516064808301926020929190829003018186803b15801561050957600080fd5b505afa15801561051d573d6000803e3d6000fd5b505050506040513d602081101561053357600080fd5b5051959095019450600101610353565b5050505092915050565b606080606061055a611182565b6001600160a01b03166372cb051f6040518163ffffffff1660e01b815260040160006040518083038186803b15801561059257600080fd5b505afa1580156105a6573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405260208110156105cf57600080fd5b81019080805160405193929190846401000000008211156105ef57600080fd5b90830190602082018581111561060457600080fd5b825186602082028301116401000000008211171561062157600080fd5b82525081516020918201928201910280838360005b8381101561064e578181015183820152602001610636565b5050505090500160405250505090508061066661123f565b6001600160a01b031663c2c8a676836040518263ffffffff1660e01b81526004018080602001828103825283818151815260200191508051906020019060200280838360005b838110156106c45781810151838201526020016106ac565b505050509050019250505060006040518083038186803b1580156106e757600080fd5b505afa1580156106fb573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052602081101561072457600080fd5b810190808051604051939291908464010000000082111561074457600080fd5b90830190602082018581111561075957600080fd5b825186602082028301116401000000008211171561077657600080fd5b82525081516020918201928201910280838360005b838110156107a357818101518382015260200161078b565b5050505090500160405250505092509250509091565b606080606060006107c8611182565b905060006107d461123f565b90506000826001600160a01b031663dbf633406040518163ffffffff1660e01b815260040160206040518083038186803b15801561081157600080fd5b505afa158015610825573d6000803e3d6000fd5b505050506040513d602081101561083b57600080fd5b505160408051828152602080840282010190915290915060609082801561086c578160200160208202803883390190505b50905060608260405190808252806020026020018201604052801561089b578160200160208202803883390190505b5090506060836040519080825280602002602001820160405280156108ca578160200160208202803883390190505b50905060005b84811015610b22576000876001600160a01b031663835e119c836040518263ffffffff1660e01b81526004018082815260200191505060206040518083038186803b15801561091e57600080fd5b505afa158015610932573d6000803e3d6000fd5b505050506040513d602081101561094857600080fd5b50516040805163dbd06c8560e01b815290519192506001600160a01b0383169163dbd06c8591600480820192602092909190829003018186803b15801561098e57600080fd5b505afa1580156109a2573d6000803e3d6000fd5b505050506040513d60208110156109b857600080fd5b505185518690849081106109c857fe5b602002602001018181525050806001600160a01b03166318160ddd6040518163ffffffff1660e01b815260040160206040518083038186803b158015610a0d57600080fd5b505afa158015610a21573d6000803e3d6000fd5b505050506040513d6020811015610a3757600080fd5b50518451859084908110610a4757fe5b602002602001018181525050866001600160a01b031663654a60ac868481518110610a6e57fe5b6020026020010151868581518110610a8257fe5b6020026020010151631cd554d160e21b6040518463ffffffff1660e01b815260040180848152602001838152602001828152602001935050505060206040518083038186803b158015610ad457600080fd5b505afa158015610ae8573d6000803e3d6000fd5b505050506040513d6020811015610afe57600080fd5b50518351849084908110610b0e57fe5b6020908102919091010152506001016108d0565b5091975095509350505050909192565b60608060606000610b41611182565b90506000610b4d61123f565b90506000826001600160a01b031663dbf633406040518163ffffffff1660e01b815260040160206040518083038186803b158015610b8a57600080fd5b505afa158015610b9e573d6000803e3d6000fd5b505050506040513d6020811015610bb457600080fd5b5051604080518281526020808402820101909152909150606090828015610be5578160200160208202803883390190505b509050606082604051908082528060200260200182016040528015610c14578160200160208202803883390190505b509050606083604051908082528060200260200182016040528015610c43578160200160208202803883390190505b50905060005b84811015610eb8576000876001600160a01b031663835e119c836040518263ffffffff1660e01b81526004018082815260200191505060206040518083038186803b158015610c9757600080fd5b505afa158015610cab573d6000803e3d6000fd5b505050506040513d6020811015610cc157600080fd5b50516040805163dbd06c8560e01b815290519192506001600160a01b0383169163dbd06c8591600480820192602092909190829003018186803b158015610d0757600080fd5b505afa158015610d1b573d6000803e3d6000fd5b505050506040513d6020811015610d3157600080fd5b50518551869084908110610d4157fe5b602002602001018181525050806001600160a01b03166370a082318d6040518263ffffffff1660e01b815260040180826001600160a01b03166001600160a01b0316815260200191505060206040518083038186803b158015610da357600080fd5b505afa158015610db7573d6000803e3d6000fd5b505050506040513d6020811015610dcd57600080fd5b50518451859084908110610ddd57fe5b602002602001018181525050866001600160a01b031663654a60ac868481518110610e0457fe5b6020026020010151868581518110610e1857fe5b6020026020010151631cd554d160e21b6040518463ffffffff1660e01b815260040180848152602001838152602001828152602001935050505060206040518083038186803b158015610e6a57600080fd5b505afa158015610e7e573d6000803e3d6000fd5b505050506040513d6020811015610e9457600080fd5b50518351849084908110610ea457fe5b602090810291909101015250600101610c49565b509199909850909650945050505050565b6000546001600160a01b031681565b60606000610ee4611182565b90506000610ef061123f565b90506000826001600160a01b031663dbf633406040518163ffffffff1660e01b815260040160206040518083038186803b158015610f2d57600080fd5b505afa158015610f41573d6000803e3d6000fd5b505050506040513d6020811015610f5757600080fd5b5051604080518281526020808402820101909152909150606090828015610f88578160200160208202803883390190505b50905060005b82811015611179576000856001600160a01b031663835e119c836040518263ffffffff1660e01b81526004018082815260200191505060206040518083038186803b158015610fdc57600080fd5b505afa158015610ff0573d6000803e3d6000fd5b505050506040513d602081101561100657600080fd5b50516040805163dbd06c8560e01b815290519192506001600160a01b038088169263af3aea86929185169163dbd06c85916004808301926020929190829003018186803b15801561105657600080fd5b505afa15801561106a573d6000803e3d6000fd5b505050506040513d602081101561108057600080fd5b5051604080516001600160e01b031960e085901b1681526004810192909252516024808301926020929190829003018186803b1580156110bf57600080fd5b505afa1580156110d3573d6000803e3d6000fd5b505050506040513d60208110156110e957600080fd5b50511561117057806001600160a01b031663dbd06c856040518163ffffffff1660e01b815260040160206040518083038186803b15801561112957600080fd5b505afa15801561113d573d6000803e3d6000fd5b505050506040513d602081101561115357600080fd5b5051835184908490811061116357fe5b6020026020010181815250505b50600101610f8e565b50935050505090565b600080546040805163dacb2d0160e01b8152680a6f2dce8d0cae8d2f60bb1b600482015260248101829052601960448201527f4d697373696e672053796e746865746978206164647265737300000000000000606482015290516001600160a01b039092169163dacb2d0191608480820192602092909190829003018186803b15801561120e57600080fd5b505afa158015611222573d6000803e3d6000fd5b505050506040513d602081101561123857600080fd5b5051905090565b600080546040805163dacb2d0160e01b81526c45786368616e6765526174657360981b600482015260248101829052601d60448201527f4d697373696e672045786368616e676552617465732061646472657373000000606482015290516001600160a01b039092169163dacb2d0191608480820192602092909190829003018186803b15801561120e57600080fdfea265627a7a723158209e7ba686f73798746736e8ff9d170da8215f2ad60eb6b3c4ba5c14e221d4140064736f6c63430005100032',
				abi: [
					{
						inputs: [
							{
								internalType: 'address',
								name: 'resolver',
								type: 'address',
							},
						],
						payable: false,
						stateMutability: 'nonpayable',
						type: 'constructor',
						signature: 'constructor',
					},
					{
						constant: true,
						inputs: [],
						name: 'addressResolverProxy',
						outputs: [
							{
								internalType: 'contract IAddressResolver',
								name: '',
								type: 'address',
							},
						],
						payable: false,
						stateMutability: 'view',
						type: 'function',
						signature: '0xd18ab376',
					},
					{
						constant: true,
						inputs: [],
						name: 'frozenSynths',
						outputs: [
							{
								internalType: 'bytes32[]',
								name: '',
								type: 'bytes32[]',
							},
						],
						payable: false,
						stateMutability: 'view',
						type: 'function',
						signature: '0xeade6d2d',
					},
					{
						constant: true,
						inputs: [
							{
								internalType: 'address',
								name: 'account',
								type: 'address',
							},
						],
						name: 'synthsBalances',
						outputs: [
							{
								internalType: 'bytes32[]',
								name: '',
								type: 'bytes32[]',
							},
							{
								internalType: 'uint256[]',
								name: '',
								type: 'uint256[]',
							},
							{
								internalType: 'uint256[]',
								name: '',
								type: 'uint256[]',
							},
						],
						payable: false,
						stateMutability: 'view',
						type: 'function',
						signature: '0xa827bf48',
					},
					{
						constant: true,
						inputs: [],
						name: 'synthsRates',
						outputs: [
							{
								internalType: 'bytes32[]',
								name: '',
								type: 'bytes32[]',
							},
							{
								internalType: 'uint256[]',
								name: '',
								type: 'uint256[]',
							},
						],
						payable: false,
						stateMutability: 'view',
						type: 'function',
						signature: '0x27fe55a6',
					},
					{
						constant: true,
						inputs: [],
						name: 'synthsTotalSupplies',
						outputs: [
							{
								internalType: 'bytes32[]',
								name: '',
								type: 'bytes32[]',
							},
							{
								internalType: 'uint256[]',
								name: '',
								type: 'uint256[]',
							},
							{
								internalType: 'uint256[]',
								name: '',
								type: 'uint256[]',
							},
						],
						payable: false,
						stateMutability: 'view',
						type: 'function',
						signature: '0x492dbcdd',
					},
					{
						constant: true,
						inputs: [
							{
								internalType: 'address',
								name: 'account',
								type: 'address',
							},
							{
								internalType: 'bytes32',
								name: 'currencyKey',
								type: 'bytes32',
							},
						],
						name: 'totalSynthsInKey',
						outputs: [
							{
								internalType: 'uint256',
								name: 'total',
								type: 'uint256',
							},
						],
						payable: false,
						stateMutability: 'view',
						type: 'function',
						signature: '0x0120be33',
					},
				],
			},
		},
	},
};

const getSynthetixContracts = (network: NetworkName, useOvm?: boolean): ContractsMap => {
	const sources = getSource({ network, useOvm });
	const targets = getTarget({ network, useOvm });

	return Object.values(targets)
		.map((target) => {
			if (target.name === 'Synthetix') {
				target.address = targets.ProxyERC20.address;
			} else if (target.name === 'SynthsUSD') {
				target.address = targets.ProxyERC20sUSD.address;
			} else if (target.name === 'FeePool') {
				target.address = targets.ProxyFeePool.address;
			} else if (target.name.match(/Synth(s|i)[a-zA-Z]+$/)) {
				const newTarget = target.name.replace('Synth', 'Proxy');
				target.address = targets[newTarget].address;
			}
			return target;
		})
		.reduce((acc, { name, source, address }) => {
			acc[name] = new ethers.Contract(
				address,
				sources[source].abi,
				ethers.getDefaultProvider(network)
			);
			return acc;
		}, {});
};

const useSynthsBalancesQuery = (options?: UseQueryOptions<Balances>) => {
	const [walletAddress] = useRecoilState(walletAddressState);
	const [network] = useRecoilState(networkState);

	const [currentNetwork, currentNetworkId, useOvm] = selectNetwork(null, network);
	const contracts = getSynthetixContracts(currentNetwork, signer, provider, useOvm);

	return useQuery<Balances>(
		['walletBalances', 'synths', network, walletAddress],
		async () => {
			if (!ctx.snxjs) {
				// This should never happen since the query is not enabled when ctx.snxjs is undefined
				throw Error('ctx.snxjs is undefined');
			}
			const balancesMap: SynthBalancesMap = {};
			const [currencyKeys, synthsBalances, synthsUSDBalances]: SynthBalancesTuple =
				await ctx.snxjs.contracts.SynthUtil.synthsBalances(walletAddress);

			let totalUSDBalance = wei(0);

			currencyKeys.forEach((currencyKeyBytes32, idx) => {
				const balance = wei(synthsBalances[idx]);

				// discard empty balances
				if (balance.gt(0)) {
					const synthName = ethers.utils.parseBytes32String(currencyKeyBytes32) as CurrencyKey;
					const usdBalance = wei(synthsUSDBalances[idx]);

					balancesMap[synthName] = {
						currencyKey: synthName,
						balance,
						usdBalance,
					};

					totalUSDBalance = totalUSDBalance.add(usdBalance);
				}
			});

			return {
				balancesMap: balancesMap,
				balances: orderBy(
					Object.values(balancesMap),
					(balance) => balance.usdBalance.toNumber(),
					'desc'
				),
				totalUSDBalance,
			};
		},
		{
			enabled: !!ctx.snxjs && !!walletAddress,
			...options,
		}
	);
};

export default useSynthsBalancesQuery;
