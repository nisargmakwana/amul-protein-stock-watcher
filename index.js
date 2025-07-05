import axios from "axios";
import fs from "fs";
import {
	Client,
	GatewayIntentBits,
	EmbedBuilder,
	REST,
	Routes,
	SlashCommandBuilder,
} from "discord.js";

// Load configuration
const config = JSON.parse(fs.readFileSync("config.json", "utf8"));

// Initialize Discord client
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Create slash command
const commands = [
	new SlashCommandBuilder()
		.setName("available")
		.setDescription("Shows all currently available products")
		.toJSON(),
];

// Register slash commands
const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

async function registerCommands() {
	try {
		console.log("Started refreshing application (/) commands.");
		console.log(`Registering command for application ID: ${config.CLIENT_ID}`);

		const result = await rest.put(
			Routes.applicationCommands(config.CLIENT_ID),
			{ body: commands }
		);

		console.log("Successfully reloaded application (/) commands.");
		console.log(
			"Registered commands:",
			commands.map((cmd) => cmd.name).join(", ")
		);
	} catch (error) {
		console.error("Error registering slash commands:", error);
		// Log more details about the error
		if (error.rawError) {
			console.error("Detailed error:", JSON.stringify(error.rawError, null, 2));
		}
	}
}

// Function to get available products
function getAvailableProducts(productsData) {
	return productsData
		.filter((product) => product.availability)
		.map((product) => ({
			name: product.name,
			price: product.price,
		}));
}

// Discord bot ready event
client.once("ready", async () => {
	console.log(`Discord bot is ready! Logged in as ${client.user.tag}`);
	await registerCommands();
});

// Handle slash commands
client.on("interactionCreate", async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	if (interaction.commandName === "available") {
		try {
			await interaction.deferReply();

			// Get fresh data from API
			const freshData = await getProductsData();

			// Format the data to include name, price, and availability
			const availableProducts = freshData
				.filter((product) => product.available === 1)
				.map((product) => ({
					name: product.name,
					price: product.price,
				}));

			if (availableProducts.length === 0) {
				await interaction.editReply("No products are currently available.");
				return;
			}

			const embed = new EmbedBuilder()
				.setTitle("🛍️ Currently Available Products")
				.setColor("#00ff00")
				.setTimestamp();

			let description = "Here are all the currently available products:\n\n";
			availableProducts.forEach((product) => {
				const formattedPrice = product.price
					? `₹${product.price}`
					: "Price not available";
				description += `• **${product.name}** - ${formattedPrice}\n`;
			});

			embed.setDescription(description).setFooter({
				text: `Total available products: ${availableProducts.length}`,
			});

			await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			console.error("Error handling available command:", error);
			if (interaction.deferred) {
				await interaction.editReply(
					"Sorry, there was an error fetching the available products."
				);
			} else {
				await interaction.reply({
					content: "Sorry, there was an error fetching the available products.",
					ephemeral: true,
				});
			}
		}
	}
});

// Function to send Discord notification
async function sendDiscordNotification(newProducts) {
	try {
		const channel = await client.channels.fetch(config.CHANNEL_ID);

		const embed = new EmbedBuilder()
			.setTitle("🎉 New Products Available!")
			.setColor("#00ff00")
			.setTimestamp();

		let description = "The following products are now available:\n\n";
		newProducts.forEach((product) => {
			description += `• **${product.name}**\n`;
		});

		embed.setDescription(description);

		await channel.send({ embeds: [embed] });
	} catch (error) {
		console.error("Error sending Discord notification:", error);
	}
}

let productsData = [];

// API call to get amul products data
// IMPORTANT: Replace the cURL from your browser with this axios call
const getProductsData = async () => {
	const response = await axios({
		method: "GET",
		url: "https://shop.amul.com/api/1/entity/ms.products",
		headers: {
			accept: "application/json, text/plain, */*",
			"accept-language": "en-US,en;q=0.9",
			base_url: "https://shop.amul.com/en/browse/protein",
			dnt: "1",
			frontend: "1",
			priority: "u=1, i",
			referer: "https://shop.amul.com/",
			"sec-ch-ua":
				'"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
			"sec-ch-ua-mobile": "?0",
			"sec-ch-ua-platform": '"macOS"',
			"sec-fetch-dest": "empty",
			"sec-fetch-mode": "cors",
			"sec-fetch-site": "same-origin",
			"user-agent":
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
		},
		params: {
			"fields[name]": 1,
			"fields[brand]": 1,
			"fields[categories]": 1,
			"fields[collections]": 1,
			"fields[alias]": 1,
			"fields[sku]": 1,
			"fields[price]": 1,
			"fields[compare_price]": 1,
			"fields[original_price]": 1,
			"fields[images]": 1,
			"fields[metafields]": 1,
			"fields[discounts]": 1,
			"fields[catalog_only]": 1,
			"fields[is_catalog]": 1,
			"fields[seller]": 1,
			"fields[available]": 1,
			"fields[inventory_quantity]": 1,
			"fields[net_quantity]": 1,
			"fields[num_reviews]": 1,
			"fields[avg_rating]": 1,
			"fields[inventory_low_stock_quantity]": 1,
			"fields[inventory_allow_out_of_stock]": 1,
			"fields[default_variant]": 1,
			"fields[variants]": 1,
			"fields[lp_seller_ids]": 1,
			"filters[0][field]": "categories",
			"filters[0][value][0]": "protein",
			"filters[0][operator]": "in",
			"filters[0][original]": 1,
			facets: true,
			facetgroup: "default_category_facet",
			limit: 32,
			total: 1,
			start: 0,
			cdc: "1m",
			substore: "66505ff06510ee3d5903fd42",
		},
	});
	return response.data.data;
};

// main logic of program
const mainExecution = async () => {
	try {
		productsData = await getProductsData();
		if (productsData.length > 0) {
			fs.writeFileSync(
				"productsData.json",
				JSON.stringify(productsData, null, 2)
			);
		}

		let prevStatus = [];
		if (fs.existsSync("currentStatus.json")) {
			prevStatus = JSON.parse(fs.readFileSync("currentStatus.json", "utf8"));
		}
		// create an array of products with only name, price, and availability
		let formattedProductsData = [];
		for (const product of productsData) {
			formattedProductsData.push({
				name: product.name,
				price: product.price,
				availability: product.available === 1 ? true : false,
			});
		}

		let currentStatus = formattedProductsData.map((product) => {
			return {
				name: product.name,
				availability: product.availability,
			};
		});
		fs.writeFileSync(
			"currentStatus.json",
			JSON.stringify(currentStatus, null, 2)
		);

		const newlyAvailable = currentStatus.filter((currentProduct) => {
			const prevProduct = prevStatus.find(
				(prev) => prev.name === currentProduct.name
			);
			return (
				prevProduct &&
				prevProduct.availability === false &&
				currentProduct.availability === true
			);
		});

		// Log timestamp with results
		const timestamp = new Date().toISOString();
		console.log(`\n[${timestamp}] Checking product availability...`);
		if (newlyAvailable.length > 0) {
			console.log("Newly available products:", newlyAvailable);
			// Send Discord notification for newly available products
			await sendDiscordNotification(newlyAvailable);
		} else {
			console.log("No new products became available");
		}
	} catch (error) {
		console.error("Error in mainExecution:", error.message);
	}
};

// Login to Discord
client
	.login(config.DISCORD_TOKEN)
	.then(() => {
		// Run immediately on start
		mainExecution();

		// Then run every half a minute
		const TEN_MINUTES = 30 * 1000;
		setInterval(mainExecution, TEN_MINUTES);

		// Log that the monitoring has started
		console.log(
			"Product availability monitoring started. Checking every 10 minutes..."
		);
	})
	.catch((error) => {
		console.error("Error logging into Discord:", error);
	});
