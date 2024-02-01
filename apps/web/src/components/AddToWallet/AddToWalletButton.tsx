import { useTranslation } from '@pancakeswap/localization'
import {
  BinanceChainIcon,
  Button,
  ButtonProps,
  CoinbaseWalletIcon,
  MetamaskIcon,
  OperaIcon,
  TokenPocketIcon,
  TrustWalletIcon,
} from '@pancakeswap/uikit'
import { Address } from 'viem'
import { watchAsset } from 'viem/actions'
import { useAccount, useWalletClient } from 'wagmi'
import { canRegisterToken } from '../../utils/wallet'
import { BAD_SRCS } from '../Logo/constants'

export enum AddToWalletTextOptions {
  NO_TEXT,
  TEXT,
  TEXT_WITH_ASSET,
}

export interface AddToWalletButtonProps {
  tokenAddress?: string
  tokenSymbol?: string
  tokenDecimals?: number
  tokenLogo?: string
  textOptions?: AddToWalletTextOptions
  marginTextBetweenLogo?: string
}

const Icons = {
  // TODO: Brave
  Binance: BinanceChainIcon,
  'Coinbase Wallet': CoinbaseWalletIcon,
  Opera: OperaIcon,
  TokenPocket: TokenPocketIcon,
  'Trust Wallet': TrustWalletIcon,
  MetaMask: MetamaskIcon,
}

const getWalletText = (textOptions: AddToWalletTextOptions, tokenSymbol: string | undefined, t: any) => {
  return (
    textOptions !== AddToWalletTextOptions.NO_TEXT &&
    (textOptions === AddToWalletTextOptions.TEXT
      ? t('Add to Wallet')
      : t('Add %asset% to Wallet', { asset: tokenSymbol }))
  )
}

const getWalletIcon = (marginTextBetweenLogo: string, name?: string) => {
  const iconProps = {
    width: '16px',
    ...(marginTextBetweenLogo && { ml: marginTextBetweenLogo }),
  }
  if (name && Icons[name]) {
    const Icon = Icons[name]
    return <Icon {...iconProps} />
  }
  // @ts-ignore FIXME: wagmiv2
  if (window?.ethereum?.isTrust) {
    return <TrustWalletIcon {...iconProps} />
  }
  // @ts-ignore FIXME: wagmiv2
  if (window?.ethereum?.isCoinbaseWallet) {
    return <CoinbaseWalletIcon {...iconProps} />
  }
  // @ts-ignore FIXME: wagmiv2
  if (window?.ethereum?.isTokenPocket) {
    return <TokenPocketIcon {...iconProps} />
  }
  // @ts-ignore FIXME: wagmiv2
  if (window?.ethereum?.isMetaMask) {
    return <MetamaskIcon {...iconProps} />
  }
  return <MetamaskIcon {...iconProps} />
}

const AddToWalletButton: React.FC<AddToWalletButtonProps & ButtonProps> = ({
  tokenAddress,
  tokenSymbol,
  tokenDecimals,
  tokenLogo,
  textOptions = AddToWalletTextOptions.NO_TEXT,
  marginTextBetweenLogo = '0px',
  ...props
}) => {
  const { t } = useTranslation()
  const { connector } = useAccount()
  const { data: walletClient } = useWalletClient()
  const isCanRegisterToken = canRegisterToken()

  if (!walletClient) return null
  if (!isCanRegisterToken) return null

  return (
    <Button
      {...props}
      onClick={() => {
        const image = tokenLogo ? (BAD_SRCS[tokenLogo] ? undefined : tokenLogo) : undefined
        if (!tokenAddress || !tokenSymbol || !walletClient) return
        // @ts-ignore FIXME: wagmiv2
        watchAsset?.(walletClient, {
          options: {
            address: tokenAddress as Address,
            symbol: tokenSymbol,
            image,
            // @ts-ignore
            decimals: tokenDecimals,
          },
        })
      }}
    >
      {getWalletText(textOptions, tokenSymbol, t)}
      {getWalletIcon(marginTextBetweenLogo, connector?.name)}
    </Button>
  )
}

export default AddToWalletButton
