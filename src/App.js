import * as React from "react";
import { ReactComponent as Avatar } from "./assets/avatar.svg";
import { ReactComponent as Moon } from "./assets/moon-solid.svg";
import { ReactComponent as Sun } from "./assets/sun-solid.svg";

import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";

export default function App() {
    /*
     * Just a state variable we use to store our user's public wallet.
     */
    const [currentAccount, setCurrentAccount] = React.useState("");
    const [allWaves, setAllWaves] = React.useState([]);
    const [message, setMessage] = React.useState("");
    const contractAddress = "0xF9Ee871eAd2Af973EDFfC795cCCfDc14454bb659";
    const contractABI = abi.abi;
    const [mode, setMode] = React.useState(
        localStorage.getItem("mode") || "light"
    );

    const checkIfWalletIsConnected = async () => {
        try {
            /*
             * First make sure we have access to window.ethereum
             */
            const { ethereum } = window;

            if (!ethereum) {
                console.log("Make sure you have metamask!");
            } else {
                console.log("We have the ethereum object", ethereum);
            }

            /*
             * Check if we're authorized to access the user's wallet
             */
            // This fetches the account we have access to.
            const accounts = await ethereum.request({ method: "eth_accounts" });

            if (accounts.length !== 0) {
                const account = accounts[0];
                console.log("Found an authorized account:", account);
                setCurrentAccount(account);
            } else {
                console.log("No authorized account found");
            }
        } catch (error) {
            console.log(error);
        }
    };

    /**
     * Implement your connectWallet method here
     */
    const connectWallet = async () => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
                alert("Get MetaMask!");
                return;
            }

            // This requests access to the user's wallet.
            const accounts = await ethereum.request({
                method: "eth_requestAccounts",
            });

            console.log("Connected", accounts[0]);
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error);
        }
    };
    /*
     * This runs our function when the page loads.
     */
    React.useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    const getAllWaves = async () => {
        try {
            const { ethereum } = window;
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(
                    contractAddress,
                    contractABI,
                    signer
                );
                const allWaves = await contract.getListOfWavers();

                setAllWaves(allWaves);
            } else {
                console.log("No ethereum object found");
            }
        } catch (err) {
            console.log(err);
        }
    };

    React.useEffect(() => {
        getAllWaves();
    }, []);

    const wave = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const wavePortalContract = new ethers.Contract(
                    contractAddress,
                    contractABI,
                    signer
                );

                /*
                 * Execute the actual wave from your smart contract
                 */
                const waveTxn = await wavePortalContract.wave(message);
                console.log("Mining...", waveTxn.hash);

                await waveTxn.wait();
                console.log("Mined -- ", waveTxn.hash);

                // Get total waves
                let count = await wavePortalContract.getTotalWaves();
                console.log("Retrieved total wave count...", count.toNumber());

                // Get list of waves
                const listOfWaves = await wavePortalContract.getListOfWavers();
                console.log("List of wavers are", listOfWaves);
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className={"main " + mode}>
            <section className="avatar">
                {" "}
                <Avatar />
                <button
                    className="changeMode"
                    onClick={() => {
                        setMode(mode === "light" ? "dark" : "light");
                    }}
                >
                    {mode === "dark" ? <Sun /> : <Moon />}
                </button>
            </section>
            <section className="mainContainer">
                <section className="dataContainer">
                    <header className="header">
                        <h1>
                            Hey there, it is <span>Steph Crown</span>
                        </h1>
                    </header>

                    <main className="bio">
                        <p>
                            <span role="img" aria-label="Hey">
                                👋
                            </span>{" "}
                            Hey there! I am Steph Crown{" "}
                            <a href="https://twitter.com/stephcrown06">
                                (@stephcrown06)
                            </a>
                            . I create magic with React and I am currently
                            learning about the third web .
                        </p>
                        <p>
                            I also write about web development and design at{" "}
                            <a href="https://blog.stephcrown.com">
                                blog.stephcrown.com
                            </a>
                            .
                        </p>{" "}
                        <p>
                            This is a basic app that interacts with a smart
                            contract I created. Say something nice in the box
                            and hit the button!
                        </p>
                    </main>

                    <textarea
                        value={message}
                        onChange={(ev) => {
                            setMessage(ev.target.value);
                        }}
                    />

                    <button className="waveButton" onClick={wave}>
                        Send quote
                    </button>
                    {/*
                     * If there is no currentAccount render this button
                     */}
                    {!currentAccount && (
                        <button className="waveButton" onClick={connectWallet}>
                            Connect Wallet
                        </button>
                    )}
                    {console.log(allWaves)}
                </section>
            </section>
        </div>
    );
}
