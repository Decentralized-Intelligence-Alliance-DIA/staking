import React from 'react';
import styled, { css } from 'styled-components';
import { FlexDivCentered, FlexDivCol, FlexDivRowCentered } from 'styles/common';
import i18n from 'i18n';

import Spinner from 'assets/svg/app/spinner.svg';
import Success from 'assets/svg/app/success.svg';
import Failure from 'assets/svg/app/failure.svg';

type NotificationProps = {
	closeToast?: Function;
	failureReason?: string;
	link?: string;
};

const NotificationPending = () => {
	return (
		<NotificationContainer>
			<IconContainer>
				<Spinner width="25" />
			</IconContainer>
			<TransactionInfo>{i18n.t('common.transaction.transaction-sent')}</TransactionInfo>
		</NotificationContainer>
	);
};

const NotificationSuccess = ({ link }: NotificationProps) => {
	return (
		<NotificationContainer data-testid="tx-notification-transaction-confirmed" data-href={link}>
			<IconContainer>
				<Success width="35" />
			</IconContainer>
			<TransactionInfo>{i18n.t('common.transaction.transaction-confirmed')}</TransactionInfo>
		</NotificationContainer>
	);
};

const NotificationError = ({ failureReason }: NotificationProps) => {
	return (
		<NotificationContainer>
			<IconContainer>
				<Failure width="35" />
			</IconContainer>
			<TransactionInfo>
				<TransactionInfoBody>{i18n.t('common.transaction.transaction-failed')}</TransactionInfoBody>
				<TransactionInfoBody isFailureMessage={true}>{failureReason}</TransactionInfoBody>
			</TransactionInfo>
		</NotificationContainer>
	);
};

const NotificationContainer = styled(FlexDivCentered)``;
const IconContainer = styled(FlexDivRowCentered)`
	width: 35px;
`;

const TransactionInfo = styled(FlexDivCol)``;
const TransactionInfoBody = styled.div<{ isFailureMessage?: boolean }>`
	${(props) =>
		props.isFailureMessage &&
		css`
			color: ${(props) => props.theme.colors.gray};
		`}
`;

export { NotificationPending, NotificationSuccess, NotificationError };
