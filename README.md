# LyricFren

Your friendly Suno companion for creating AI-generated lyrics.

## Overview

LyricFren is a desktop application that helps you create and manage AI-generated lyrics using style prompts and templates. It provides a user-friendly interface for crafting prompts, generating lyrics, and managing your creative workflow.

## Tech Stack

- **Frontend**: Vue 3, Vuetify 3, Material Design Icons
- **Backend**: Express.js, LowDB
- **Styling**: Vuetify theming system with custom dark/light themes

For detailed information about our tech stack and styling approach, see [Tech Stack Documentation](docs/TechStack.md).

## Getting Started

### Prerequisites

- Node.js 16+
- Yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/lyricfren.git
cd lyricfren

# Install dependencies
yarn install

# Start the development server
yarn dev
```

### Configuration

Create a config file at `~/.lyricfren/config.yaml` with your API key:

```yaml
openaiApiKey: "your-openai-api-key"
```

## Documentation

- [Architecture](docs/Architecture.md) - System architecture and data models
- [Tech Stack](docs/TechStack.md) - Detailed information about our tech stack
- [MVP Bootstrap](docs/MVP_Bootstrap.md) - Initial MVP plan

## License

MIT
