import React, { useEffect, useState } from "react";
import { Alchemy, Network } from "alchemy-sdk";
import "./App.css";

// Set up Alchemy SDK
const settings = {
	apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
	network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

function App() {
	const [blockNumber, setBlockNumber] = useState(null);
	const [block, setBlock] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchBlockData = async () => {
			try {
				setLoading(true);
				// Get the latest block number
				const latestBlockNumber = await alchemy.core.getBlockNumber();
				setBlockNumber(latestBlockNumber);

				// Get the block details
				const blockData = await alchemy.core.getBlock("latest");
				setBlock(blockData);
				console.log(blockData);
			} catch (err) {
				console.error("Error fetching blockchain data:", err);
				setError(
					"Failed to load blockchain data. Please check your connection and API key."
				);
			} finally {
				setLoading(false);
			}
		};

		fetchBlockData();

		// Set up a refresh interval (every 15 seconds)
		const intervalId = setInterval(fetchBlockData, 15000);

		// Clean up the interval on component unmount
		return () => clearInterval(intervalId);
	}, []); // Empty dependency array means this runs once on mount

	// Format timestamp to readable date
	const formatDate = (timestamp) => {
		if (!timestamp) return "-";
		return new Date(timestamp * 1000).toLocaleString();
	};

	// Format gas values to make them more readable
	const formatGas = (gas) => {
		if (!gas) return "-";
		return parseInt(gas).toLocaleString();
	};

	// Calculate gas usage percentage
	const calculateGasPercentage = () => {
		if (!block || !block.gasUsed || !block.gasLimit) return "0%";
		return `${(
			(parseInt(block.gasUsed) / parseInt(block.gasLimit)) *
			100
		).toFixed(2)}%`;
	};

	return (
		<div className="App">
			<header className="App-header">
				<h1>Ethereum Block Explorer</h1>
				<p>Real-time Ethereum blockchain information</p>

				{loading && !block ? (
					<div>
						<p>Loading blockchain data...</p>
					</div>
				) : error ? (
					<div
						style={{
							backgroundColor: "#f44336",
							padding: "20px",
							borderRadius: "5px",
						}}
					>
						{error}
					</div>
				) : (
					<div style={{ width: "80%", maxWidth: "75vw" }}>
						{/* Block Information Card */}
						<div
							style={{
								backgroundColor: "#3f4656",
								borderRadius: "10px",
								padding: "20px",
								marginBottom: "20px",
								textAlign: "left",
								boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
							}}
						>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									marginBottom: "20px",
									padding: "10px",
									backgroundColor: "#4e6096",
									borderRadius: "5px",
								}}
							>
								<h2 style={{ margin: 0 }}>Current Block</h2>
								<div
									style={{
										backgroundColor: "#282c34",
										padding: "8px 15px",
										borderRadius: "5px",
										fontFamily: "monospace",
										fontSize: "1.5rem",
									}}
								>
									#{blockNumber?.toLocaleString()}
								</div>
							</div>

							<div
								style={{
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "20px",
								}}
							>
								<div>
									<h3 style={{ color: "#aaa", marginBottom: "5px" }}>
										Timestamp
									</h3>
									<p>{formatDate(block?.timestamp)}</p>

									<h3
										style={{
											color: "#aaa",
											marginBottom: "5px",
											marginTop: "20px",
										}}
									>
										Miner
									</h3>
									<p
										style={{
											fontFamily: "monospace",
											backgroundColor: "#282c34",
											padding: "10px",
											borderRadius: "5px",
											overflowX: "auto",
											fontSize: "0.9rem",
										}}
									>
										{block?.miner || "-"}
									</p>

									<h3
										style={{
											color: "#aaa",
											marginBottom: "5px",
											marginTop: "20px",
										}}
									>
										Transaction Count
									</h3>
									<p>{block?.transactions?.length || 0} transactions</p>
								</div>

								<div>
									<h3 style={{ color: "#aaa", marginBottom: "5px" }}>
										Gas Used / Gas Limit
									</h3>
									<div
										style={{
											width: "100%",
											backgroundColor: "#282c34",
											height: "20px",
											borderRadius: "10px",
											marginBottom: "5px",
											position: "relative",
										}}
									>
										<div
											style={{
												width: calculateGasPercentage(),
												backgroundColor: "#61dafb",
												height: "100%",
												borderRadius: "10px",
											}}
										></div>
									</div>
									<p style={{ fontSize: "0.9rem" }}>
										{formatGas(block?.gasUsed)} / {formatGas(block?.gasLimit)}
										{block && ` (${calculateGasPercentage()})`}
									</p>

									<h3
										style={{
											color: "#aaa",
											marginBottom: "5px",
											marginTop: "20px",
										}}
									>
										Block Hash
									</h3>
									<p
										style={{
											fontFamily: "monospace",
											backgroundColor: "#282c34",
											padding: "10px",
											borderRadius: "5px",
											overflowX: "auto",
											fontSize: "0.9rem",
										}}
									>
										{block?.hash || "-"}
									</p>

									<h3
										style={{
											color: "#aaa",
											marginBottom: "5px",
											marginTop: "20px",
										}}
									>
										Parent Hash
									</h3>
									<p
										style={{
											fontFamily: "monospace",
											backgroundColor: "#282c34",
											padding: "10px",
											borderRadius: "5px",
											overflowX: "auto",
											fontSize: "0.9rem",
										}}
									>
										{block?.parentHash || "-"}
									</p>
								</div>
							</div>
						</div>

						{/* Transactions Card */}
						<div
							style={{
								backgroundColor: "#3f4656",
								borderRadius: "10px",
								padding: "20px",
								textAlign: "left",
								boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
							}}
						>
							<div
								style={{
									padding: "10px",
									backgroundColor: "#7e57c2",
									borderRadius: "5px",
									marginBottom: "20px",
								}}
							>
								<h2 style={{ margin: 0 }}>Transaction Preview</h2>
							</div>

							{block?.transactions?.length > 0 ? (
								<div>
									<p style={{ marginBottom: "15px" }}>
										Showing the first 5 of {block.transactions.length}{" "}
										transactions in this block:
									</p>
									{block.transactions.slice(0, 5).map((tx, index) => (
										<div
											key={index}
											style={{
												fontFamily: "monospace",
												backgroundColor: "#282c34",
												padding: "10px",
												borderRadius: "5px",
												overflowX: "auto",
												marginBottom: "10px",
												fontSize: "0.9rem",
											}}
										>
											{tx}
										</div>
									))}
									{block.transactions.length > 5 && (
										<p
											style={{
												textAlign: "center",
												color: "#aaa",
												marginTop: "10px",
											}}
										>
											...and {block.transactions.length - 5} more transactions
										</p>
									)}
								</div>
							) : (
								<p>No transactions in this block</p>
							)}
						</div>

						<p style={{ color: "#aaa", marginTop: "20px" }}>
							Data updates automatically every 15 seconds
						</p>
					</div>
				)}
			</header>
		</div>
	);
}

export default App;
