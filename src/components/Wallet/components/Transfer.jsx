import { CreditCardOutlined } from "@ant-design/icons";
import { Button, Input, notification } from "antd";
import Text from "antd/lib/typography/Text";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import AddressInput from "../../AddressInput";
import AssetSelector from "./AssetSelector";
import { ethers } from 'ethers';
import mor from 'moralis';

const ERC20TransferABI = [
  {
    constant: false,
    inputs: [
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
];

const styles = {
  card: {
    alignItems: "center",
    width: "100%",
  },
  header: {
    textAlign: "center",
  },
  input: {
    width: "100%",
    outline: "none",
    fontSize: "16px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textverflow: "ellipsis",
    appearance: "textfield",
    color: "#041836",
    fontWeight: "700",
    border: "none",
    backgroundColor: "transparent",
  },
  select: {
    marginTop: "20px",
    display: "flex",
    alignItems: "center",
  },
  textWrapper: { maxWidth: "80px", width: "100%" },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexDirection: "row",
  },
};

function Transfer() {
  const { Moralis } = useMoralis();
  const [receiver, setReceiver] = useState();
  const [asset, setAsset] = useState();
  const [gasValue, setGasValue] = useState();

  const [tx, setTx] = useState();
  const [amount, setAmount] = useState();
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    asset && amount && receiver ? setTx({ amount, receiver, asset }) : setTx();
  }, [asset, amount, receiver]);

  const openNotification = ({ message, description }) => {
    notification.open({
      placement: "bottomRight",
      message,
      description,
      onClick: () => {
        console.log("Notification Clicked!");
      },
    });
  };

  async function transfer() {
    const { amount, receiver, asset } = tx;

    let options = {};
    let type = "erc20";
    // switch (asset.token_address) {
    //   case "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee":
    //     type = "native";
    //     options = {
    //       native: "native",
    //       amount: Moralis.Units.ETH(amount),
    //       receiver,
    //       awaitReceipt: false,
    //     };
    //     break;
    //   default:
    //     options = {
    //       type: "erc20",
    //       amount: Moralis.Units.Token(amount, asset.decimals),
    //       receiver,
    //       contractAddress: asset.token_address,
    //       awaitReceipt: false,
    //     };
    // }

    //setIsPending(true);
    //const txStatus = await Moralis.transfer(options);
    const { web3: internalWeb3, account: sender, signer } = Moralis.getInternalWeb3Provider();
    let gas  = 0;
    switch (asset.token_address) {
      case "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee":
        const tx = {
          from: sender,
          to: receiver,
          value:Moralis.Units.Token(amount, asset.decimals)
        }
     
        gas = await   signer.estimateGas(tx);
        setGasValue(gas.toString());
        break;
      default:
      //   case "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee":
          let customToken = new ethers.Contract(asset.token_address, ERC20TransferABI, signer);
          
          gas = await customToken.estimateGas.transfer(receiver,Moralis.Units.Token(amount, asset.decimals),{from:sender})
          setGasValue(gas.toString());
      }
    // txStatus
    //   .on("transactionHash", (hash) => {
    //     openNotification({
    //       message: "🔊 New Transaction",
    //       description: `${hash}`,
    //     });
    //     console.log("🔊 New Transaction", hash);
    //   })
    //   .on("receipt", (receipt) => {
    //     openNotification({
    //       message: "📃 New Receipt",
    //       description: `${receipt.transactionHash}`,
    //     });
    //     console.log("🔊 New Receipt: ", receipt);
    //     setIsPending(false);
    //   })
    //   .on("error", (error) => {
    //     openNotification({
    //       message: "📃 Error",
    //       description: `${error.message}`,
    //     });
    //     console.error(error);
    //     setIsPending(false);
    //   });
  }

  return (
    <div style={styles.card}>
      <div style={styles.tranfer}>
        <div style={styles.header}>
          <h3>Transfer Assets</h3>
        </div>
        <div style={styles.select}>
          <div style={styles.textWrapper}>
            <Text strong>Address:</Text>
          </div>
          <AddressInput autoFocus onChange={setReceiver} />
        </div>
        <div style={styles.select}>
          <div style={styles.textWrapper}>
            <Text strong>Amount:</Text>
          </div>
          <Input
            size="large"
            prefix={<CreditCardOutlined />}
            onChange={(e) => {
              setAmount(`${e.target.value}`);
            }}
          />
        </div>
        <div style={styles.select}>
          <div style={styles.textWrapper}>
            <Text strong>Asset:</Text>
          </div>
          <AssetSelector setAsset={setAsset} style={{ width: "100%" }} />
        </div>
        <Button
          type="primary"
          size="large"
          loading={isPending}
          style={{ width: "100%", marginTop: "25px" }}
          onClick={() => transfer()}
          disabled={!tx}
        >
         Calculate Gas
        </Button>
      </div>

      <div>
          <div style={styles.textWrapper}>
            <Text strong>Gas result:</Text>
          </div>
          <Text strong>{gasValue}</Text>
        </div>
    </div>
  );
}

export default Transfer;
