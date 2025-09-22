FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:24

# Install additional packages if needed
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        git \
        curl \
        wget \
        nano \
        vim \
    && apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install live-server globally for serving HTML files
RUN npm install -g live-server

# Create workspace directory
WORKDIR /workspace

# Copy package files if they exist
COPY package*.json ./

# Install npm dependencies if package.json exists
RUN if [ -f package.json ]; then npm install; fi

USER vscode