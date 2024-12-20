# Fartone

A fast, Bun-powered API for checking and comparing web content using HTMLRewriter and Elysia.

## Features

- Check for presence of HTML elements
- Compare specific content within elements
- Built with Bun's native HTMLRewriter for performance
- OpenAPI documentation with Swagger generated by Elysia
- Error handling and validation
- Type-safe with TypeScript

## Installation

```bash
# Install dependencies
bun install
```

## Usage

Start the server in development mode:
```bash
bun run dev
```

Server runs at http://localhost:3000 for now.

### Endpoints

#### Check Element Presence

```bash
POST /check
{
  "url": "https://example.com",
  "selector": "H1"
}
```

#### Compare Content

```bash
POST /compare
{
  "url": "https://example.com",
  "selector": "H2",
  "expectedContent": "Expected text"
}
```

### Response Codes

- 200: Success
- 400: Invalid URL
- 404: Element/Content not found
- 500: Internal server error

## Documentation

OpenAPI documentation available at `/swagger`

## Technologies

- Bun
- Elysia
- HTMLRewriter (Bun's native HTML parser)
- TypeScript

## TODO

- [ ] Add rate limiting
- [ ] Implement authentication
- [ ] Add metrics collection
- [ ] Add request logging
- [ ] Add tests
- [ ] Separate classes into separate files
- [ ] SEparate utils into separate files
- [ ] Load the server port from an environment variable
