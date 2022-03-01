import styled, { css } from 'styled-components';
import { Button } from 'antd';
import { equals } from 'ramda';
import { WalletDisconnectButton, WalletModalButton } from '@solana/wallet-adapter-react-ui';
import { ButtonReset } from '@/common/styles/ButtonReset';

const StyledButton = styled(({ noStyle, ...rest }) => <Button {...rest} />)<{ noStyle?: boolean }>`
  font-weight: 500;
  color: #000;
  &:hover,
  &:active,
  &:focus {
    color: #000;
    background: rgba(255, 255, 255, 0.8);
  }
  &.ant-btn-icon-only {
    width: 52px;
  }
  ${({ type }) =>
    equals('primary', type) &&
    css`
      color: #f4f4f4;
      &:hover,
      &:active,
      &:focus {
        color: #fff;
        background: linear-gradient(10.77deg, rgb(210, 64, 137) 8.62%, rgb(185, 45, 68) 84.54%);
      }
      &[disabled],
      &[disabled]:hover {
        background: linear-gradient(10.77deg, rgb(220, 105, 163) 8.62%, rgb(210, 71, 94) 84.54%);
        color: #fff;

        &:hover,
        &:active,
        &:focus {
          color: #fff;
          background: linear-gradient(10.77deg, rgb(220, 105, 163) 8.62%, rgb(210, 71, 94) 84.54%);
          color: #fff;

          &:hover,
          &:active,
          &:focus {
            background: linear-gradient(
              10.77deg,
              rgb(220, 105, 163) 8.62%,
              rgb(210, 71, 94) 84.54%
            );
          }
        }
      }
    `}

  ${({ noStyle }) =>
    noStyle &&
    css`
      background: none;
      border: none;
      margin: 0;
      padding: 0;
      width: auto;
      overflow: visible;
      background: transparent;
      color: inherit;
      font: inherit;
      line-height: normal;
      *[ant-click-animating-without-extra-node='true']::after {
        display: none;
      }
      &:hover,
      &:focus {
        background: transparent;
        color: #fff;
        border-bottom: transparent;
      }
    `}
`;

const ButtonStyles = css`
  width: 88px;
  height: 32px;
  border-radius: 16px;
  padding-left: 10px;
  padding-right: 10px;
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  color: #171717;
`;

export const ButtonV2 = styled(StyledButton)`
  ${ButtonStyles}
`;

export const AnchorButton = styled.a`
  width: 88px;
  height: 32px;
  border-radius: 16px;
  padding-left: 10px;
  padding-right: 10px;
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  color: #171717;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  &&:not([disabled]):hover {
    background-color: rgba(255, 255, 255, 0.8);
    color: #171717;
  }
`;

export const SelectWalletButton = styled(WalletModalButton).attrs({
  children: 'Connect',
})`
  ${ButtonReset};
  border-radius: 18px;
  padding-top: 5px;
  padding-bottom: 5px;
  padding-left: 2rem;
  padding-right: 2rem;
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 18px;
  color: #171717;
  background: #fff;
  display: flex;
  justify-content: center;
  &&:not([disabled]):hover {
    background-color: rgba(255, 255, 255, 0.8);
  }
`;

export const ConnectWalletButton = styled(WalletModalButton).attrs({
  children: 'Connect',
})`
  ${ButtonReset};
  width: 88px;
  height: 32px;
  border-radius: 16px;
  padding-left: 10px;
  padding-right: 10px;
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  color: #171717;
  background: #fff;
  display: flex;
  justify-content: center;
  &&:not([disabled]):hover {
    background-color: rgba(255, 255, 255, 0.8);
  }
`;

export const DisconnectWalletButton = styled(WalletDisconnectButton).attrs({
  children: 'Disconnect',
  endIcon: null as any,
  startIcon: null as any,
})`
  ${ButtonReset};
  background: #262626;
  box-sizing: border-box;
  box-shadow: 0px 1px 2px rgba(16, 24, 40, 0.05);
  border-radius: 500px;
  justify-content: center;
  margin-top: 16px;
  width: 100%;
  flex: 1;
  &&:not([disabled]):hover {
    background-color: #363636;
  }
`;

export default StyledButton;
