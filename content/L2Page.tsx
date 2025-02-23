import { FC } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import Main from 'sections/layer2';
import StatBox from 'components/StatBox';
import { LineSpacer } from 'styles/common';
import { isWalletConnectedState } from 'store/wallet';
import StatsSection from 'components/StatsSection';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { formatFiatCurrency, formatPercent } from 'utils/formatters/number';
import ProgressBar from 'components/ProgressBar';
import StakedValue from 'sections/shared/modals/StakedValueModal/StakedValueBox';
import ActiveDebt from 'sections/shared/modals/DebtValueModal/DebtValueBox';

const L2Page: FC = () => {
	const { t } = useTranslation();

	const {
		stakedCollateralValue,
		percentageCurrentCRatio,
		debtBalance,
		percentCurrentCRatioOfTarget,
	} = useStakingCalculations();
	const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	return (
		<>
			<Head>
				<title>{t('staking.page-title')}</title>
			</Head>
			<StatsSection>
				<StakedValue
					title={t('common.stat-box.staked-value')}
					value={formatFiatCurrency(getPriceAtCurrentRate(stakedCollateralValue), {
						sign: selectedPriceCurrency.sign,
					})}
				/>
				<CRatio
					title={t('common.stat-box.c-ratio')}
					value={isWalletConnected ? formatPercent(percentageCurrentCRatio) : '-%'}
					size="lg"
				>
					<CRatioProgressBar
						variant="blue-pink"
						percentage={percentCurrentCRatioOfTarget.toNumber()}
					/>
				</CRatio>
				<ActiveDebt
					title={t('common.stat-box.active-debt')}
					value={formatFiatCurrency(getPriceAtCurrentRate(debtBalance), {
						sign: selectedPriceCurrency.sign,
					})}
					isPink
				/>
			</StatsSection>
			<LineSpacer />
			<Main />
		</>
	);
};

const CRatio = styled(StatBox)`
	.value {
		text-shadow: ${(props) => props.theme.colors.blueTextShadow};
		color: ${(props) => props.theme.colors.black};
	}
`;

export const CRatioProgressBar = styled(ProgressBar)`
	height: 6px;
	width: 100%;
	transform: translateY(12px);
	max-width: 176px;
`;

export default L2Page;
