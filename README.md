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

### FFmpeg Builder (Available)

- **Input & Output**: Configure input/output files and container format
- **Video Options**: Codec, CRF, preset, bitrate, resolution, frame rate, pixel format, profile/level, VSYNC, faststart
- **Audio Options**: Codec, bitrate, sample rate, channels, copy stream
- **Time Trimming**: Start time and duration
- **Global & Filters**: Log level, threads, `-vf` / `-af`, extra raw flags
- **Presets**: High quality, web optimized, audio extract, compress, quick convert
- **Generated Command**: Always-up-to-date `ffmpeg` command with copy button

### ImageMagick Builder (Available)

- **Basic Options**: Input/output, format, resize, crop, rotate, quality
- **Effects & Colors**: Flip/flop, grayscale, blur, sharpen, background color, flatten
- **Advanced**: Density (DPI), strip metadata, extra raw flags
- **Presets**: Web-optimized JPEG, thumbnail, avatar, grayscale WebP, print-ready TIFF
- **Generated Command**: `magick` command preview with copy to clipboard

### curl Builder (Available)

- **Basic Options**: Method, URL, query params, output file
- **Headers & Body**: Content-Type, multiple headers, JSON/form/raw body modes
- **Auth & Connection**: Basic auth, bearer token, proxy, timeout, retries, redirects, TLS options, compression
- **Presets**: JSON GET/POST, form POST, file download, bearer-auth API
- **Generated Command**: `curl` command preview with copy to clipboard

### Git Builder (Available)

- **Repository & Command**: `status`, `log`, `add`, `commit`, `push`, `pull`, `branch`, `checkout`, `switch`, `stash`, `diff`, `clone`, `reset`, `tag`
- **Status / Log / Diff**: `--short`, `--branch`, `--oneline`, `--graph`, `--decorate`, `--cached`, `--name-only`
- **Branch & Remote**: Remote/branch, upstream, force modes, rebase-pull
- **Stash / Reset / Tag**: Stash push options, reset modes, annotated tags
- **Presets**: Status & short log, initial commit, feature branch, sync branch, stash changes
- **Generated Command**: Git command (optionally prefixed with `cd <repo> &&`) with copy to clipboard

### Coming Soon

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
│   ├── header.tsx          # Navigation header
│   ├── home.tsx            # Tool selection page
│   ├── yt-dlp-builder.tsx  # yt-dlp command builder
│   ├── ffmpeg-builder.tsx  # FFmpeg command builder
│   ├── imagemagick-builder.tsx # ImageMagick command builder
│   ├── curl-builder.tsx    # curl command builder
│   └── git-builder.tsx     # Git command builder
├── lib/
│   └── utils.ts         # Utility functions
├── App.tsx              # Main app with routing
└── main.tsx             # Entry point
```

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
