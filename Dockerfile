# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application (without hardcoded API URL)
RUN yarn build

# Production stage
FROM node:24-alpine

WORKDIR /app

# Install serve to run the built application
RUN yarn global add serve

# Install sed for text replacement
RUN apk add --no-cache sed

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create a script to inject environment variables at runtime
RUN { \
    echo '#!/bin/sh'; \
    echo 'export API_URL_ESCAPED=$(printf "%s" "$VITE_API_URL" | sed "s|/|\\/|g")'; \
    echo 'if [ -n "$VITE_API_URL" ]; then'; \
    echo '  sed -i "s|http://0.0.0.0:3000|$VITE_API_URL|g" /app/dist/index.html'; \
    echo '  # Replace API URL in all JS files in assets directory'; \
    echo '  for js_file in /app/dist/assets/*.js; do'; \
    echo '    if [ -f "$js_file" ]; then'; \
    echo '      sed -i "s|http://0.0.0.0:3000|$VITE_API_URL|g" "$js_file"'; \
    echo '    fi'; \
    echo '  done'; \
    echo '  # Create config.js with runtime environment variables'; \
    echo '  echo "window._env_ = { REACT_APP_API_URL: \"$VITE_API_URL\" };" > /app/dist/config.js'; \
    echo '  # Inject config.js script tag in head section of index.html'; \
    echo '  sed -i "s|<head>|<head>\\n    <script src=\"./config.js\"><\\/script>|" /app/dist/index.html'; \
    echo 'fi'; \
    echo 'exec "$@"'; \
    } > /inject_config.sh && chmod +x /inject_config.sh

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5173/ || exit 1

# Start the application
CMD ["sh", "-c", "/inject_config.sh && serve -s dist -l 5173"]
