FROM mcr.microsoft.com/devcontainers/base:ubuntu

# Install system deps + Python + Node tooling
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-venv python3-pip \
    curl ca-certificates git \
  && rm -rf /var/lib/apt/lists/*

# Install Node 20 (via NodeSource)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get update && apt-get install -y nodejs \
  && rm -rf /var/lib/apt/lists/*

# Optional: make "python" command exist
RUN ln -sf /usr/bin/python3 /usr/local/bin/python