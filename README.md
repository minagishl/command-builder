# Command Builder

A visual command builder for CLI tools. Build complex command-line arguments through an intuitive web interface.

## Features

### yt-dlp Builder (Available)

- **Quality & Format Selection**: Choose video quality and output format
- **Audio Options**: Audio-only downloads with quality settings
- **Subtitles**: Download and embed subtitles with language selection
- **Metadata**: Embed thumbnails, metadata, and chapters
- **Playlist Support**: Download entire playlists or specific ranges
- **Cookie Support**: Use browser cookies for authentication
- **SponsorBlock Integration**: Remove or mark sponsor segments
- **Presets**: Quick configuration with pre-defined settings
- **Copy to Clipboard**: One-click command copying

### Coming Soon

- FFmpeg converter
- ImageMagick editor
- curl request builder
- Git command helper
- Custom command builder

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **React Router** - Navigation

## Development

### Prerequisites

- [Bun](https://bun.sh) (or Node.js)

### Installation

```bash
bun install
```

### Development Server

```bash
bun run dev
```

### Build

```bash
bun run build
```

### Format Code

```bash
bun run format
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── header.tsx       # Navigation header
│   ├── home.tsx         # Tool selection page
│   └── yt-dlp-builder.tsx  # yt-dlp command builder
├── lib/
│   └── utils.ts         # Utility functions
├── App.tsx              # Main app with routing
└── main.tsx             # Entry point
```

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
