import * as React from "react";
import { ReactComponent as Avatar } from "./assets/avatar.svg";
import { ReactComponent as Moon } from "./assets/moon-solid.svg";
import { ReactComponent as Sun } from "./assets/sun-solid.svg";

import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";
import toast from "react-hot-toast";
import { Notifications } from "./Notifications/Index";

export default function App() {
    /*
     * Just a state variable we use to store our user's public wallet.
     */
    const [currentAccount, setCurrentAccount] = React.useState("");
    const [allWaves, setAllWaves] = React.useState([]);
    const [message, setMessage] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [fetching, setFetching] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [noMessage, setNoMessage] = React.useState(false);
    const contractAddress = "0xE3F8c6B83EB37416B4E1a4d358d87C8Ef6c5e7Ed";
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
            toast.error("No authorized account found");
        }
    };

    /**
     * Implement your connectWallet method here
     */
    const connectWallet = async () => {
        setLoading(true);

        try {
            const { ethereum } = window;

            if (!ethereum) {
                toast.error(
                    <p style={{ color: "white" }}>
                        Oops, we can't connect you. Please get MetaMask so we
                        can connect you! Click{" "}
                        <a
                            style={{ color: "white" }}
                            href="https://metamask.io/faqs/"
                        >
                            https://metamask.io/faqs/
                        </a>
                    </p>
                );
                setLoading(false);
                return;
            }

            // This requests access to the user's wallet.
            const accounts = await ethereum.request({
                method: "eth_requestAccounts",
            });

            console.log("Connected", accounts[0]);
            setCurrentAccount(accounts[0]);
            setLoading(false);
            toast.success("Successfully connected MetaMask!");
            getAllWaves();
        } catch (error) {
            setLoading(false);

            console.log(error);
            toast.error(error.message || "An error occured");
        }
    };
    /*
     * This runs our function when the page loads.
     */
    React.useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    const getAllWaves = async () => {
        setFetching(true);

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

                setAllWaves(
                    allWaves
                        .map(({ from, timestamp, message }) => ({
                            address: from,
                            timestamp: new Date(timestamp * 1000),
                            message: message,
                        }))
                        .reverse()
                );
                setFetching(false);
            } else {
                console.log("No ethereum object found");
                toast.error(
                    "We can't find an account to use. Please connect to Metamask."
                );
                setFetching(false);
            }
        } catch (err) {
            console.log(err);
            setFetching(false);
            // toast.error(err.message || "An error occured");
        }
    };

    React.useEffect(() => {
        getAllWaves();
    }, []);

    const wave = async () => {
        if (message) {
            setLoading(true);
            setSuccess(false);
            try {
                const { ethereum } = window;

                if (ethereum) {
                    const provider = new ethers.providers.Web3Provider(
                        ethereum
                    );
                    const signer = provider.getSigner();
                    const wavePortalContract = new ethers.Contract(
                        contractAddress,
                        contractABI,
                        signer
                    );

                    /*
                     * Execute the actual wave from your smart contract
                     */
                    const waveTxn = await wavePortalContract.wave(message, {
                        gasLimit: 300000,
                    });
                    console.log("Mining...", waveTxn.hash);

                    await waveTxn.wait();
                    console.log("Mined -- ", waveTxn.hash);

                    setLoading(false);
                    setSuccess(true);
                    toast.success(
                        <p style={{ color: "white" }}>
                            You sent a message, and it was nice!{" "}
                            <span role="img" aria-labelledby="smile">
                                😊
                            </span>{" "}
                        </p>,
                        {
                            duration: 6000,
                        }
                    );
                    setMessage("");
                } else {
                    console.log("Ethereum object doesn't exist!");
                    toast.error(
                        "We can't find an account to use. Please click on Connect Wallet."
                    );
                    setLoading(false);
                }
            } catch (error) {
                console.log(error);
                toast.error(
                    "An error occured. Please first connect to Metamask. Click on Connect Wallet"
                );
                setLoading(false);
            }
        } else {
            setNoMessage(true);
        }
    };

    /**
     * Listen in for emitter events!
     */
    React.useEffect(() => {
        let wavePortalContract;

        const onNewWave = (from, timestamp, message) => {
            setAllWaves((prevState) => [
                {
                    address: from,
                    timestamp: new Date(timestamp * 1000),
                    message: message,
                },
                ...prevState,
            ]);
        };

        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            wavePortalContract = new ethers.Contract(
                contractAddress,
                contractABI,
                signer
            );
            wavePortalContract.on("NewWave", onNewWave);
        }

        return () => {
            if (wavePortalContract) {
                wavePortalContract.off("NewWave", onNewWave);
            }
        };
    }, []);

    return (
        <div className={"main " + mode}>
            <Notifications />
            <section className="avatar">
                {" "}
                <Avatar />
                <button
                    className="changeMode"
                    onClick={() => {
                        setMode(mode === "light" ? "dark" : "light");
                        localStorage.setItem(
                            "mode",
                            mode === "light" ? "dark" : "light"
                        );
                    }}
                >
                    {mode === "dark" ? <Sun /> : <Moon />}
                </button>
            </section>
            <section className="mainContainer">
                <section className="dataContainer">
                    <header className="header">
                        <h1>
                            Say something to <span>Steph Crown</span>
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
                            setNoMessage(false);
                            setMessage(ev.target.value);
                        }}
                        disabled={loading}
                    />
                    {noMessage && <small>Please input a message</small>}

                    <button
                        className="waveButton"
                        onClick={wave}
                        disabled={loading}
                    >
                        {loading ? "Processing ..." : "Say Something"}
                    </button>
                    {/*
                     * If there is no currentAccount render this button
                     */}
                    {!currentAccount && (
                        <button
                            className="waveButton connect"
                            onClick={connectWallet}
                            disabled={loading}
                        >
                            {loading ? "Processing ..." : "Connect Wallet"}
                        </button>
                    )}
                </section>{" "}
                <section className="allWaves">
                    <h2>Previous messages</h2>
                    {fetching && <p>Fetching previous messages</p>}
                    {!fetching && allWaves.length === 0 && (
                        <p>No previous messages</p>
                    )}
                    {allWaves &&
                        allWaves.map(({ address, message, timestamp }) => (
                            <div className="wave">
                                <p className="wave__content">
                                    {" "}
                                    A kind person with the address:{" "}
                                    <span>{address}</span> said "
                                    <span className="wave__message">
                                        {message}
                                    </span>
                                    " at{" "}
                                    <span>
                                        {timestamp.toDateString() +
                                            " " +
                                            timestamp.toLocaleTimeString()}
                                    </span>
                                </p>
                            </div>
                        ))}
                </section>
            </section>
        </div>
    );
}
