# Amul Protein Stock Watcher 🥛

A Discord bot that monitors Amul's protein product availability and sends real-time notifications when products become available.

## Features 🌟

- 🔍 Monitors Amul's protein products in real-time
- 🤖 Discord slash command `/available` to check currently available products
- 📢 Automatic notifications when products become available
- 💰 Displays product prices in Indian Rupees (₹)
- ⏰ Checks availability every 30 seconds

## Setup 🚀

### Prerequisites

- Node.js (v16.x or higher)
- npm (Node Package Manager)
- A Discord account and a Discord server where you have admin permissions

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/amucron.git
   cd amucron
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `config.json` file in the root directory:
   ```json
   {
   	"DISCORD_TOKEN": "your-discord-bot-token",
   	"CLIENT_ID": "your-application-client-id",
   	"CHANNEL_ID": "your-discord-channel-id"
   }
   ```

### Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section and create a bot
4. Enable necessary Privileged Gateway Intents:
   - Server Members Intent
   - Message Content Intent
5. Copy the bot token and add it to your `config.json`
6. Go to OAuth2 → URL Generator:
   - Select scopes: `bot`, `applications.commands`
   - Select permissions: `Send Messages`, `Embed Links`, `Use Slash Commands`
7. Use the generated URL to invite the bot to your server

## Usage 💡

1. Start the bot:

   ```bash
   node index.js
   ```

2. Use the `/available` command in your Discord server to see currently available products

3. The bot will automatically send notifications to the configured channel when new products become available

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## Security Note 🔒

- Never commit your `config.json` file to version control
- Keep your Discord bot token private
- Regenerate your token if it gets exposed

## License 📄

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer ⚠️

This project is not officially affiliated with Amul. It's an independent tool created to help users track product availability.
