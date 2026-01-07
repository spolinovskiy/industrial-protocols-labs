FROM python:3.12-slim

# Strip docs/man/locales to keep the image small
RUN set -eux; \
    echo 'path-exclude=/usr/share/doc/*' > /etc/dpkg/dpkg.cfg.d/01_nodoc; \
    echo 'path-exclude=/usr/share/man/*' >> /etc/dpkg/dpkg.cfg.d/01_nodoc; \
    echo 'path-exclude=/usr/share/locale/*' >> /etc/dpkg/dpkg.cfg.d/01_nodoc

# Minimal tooling for industrial protocol analysis
RUN set -eux; \
    apt-get update; \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        tcpdump \
        tshark \
        termshark \
        ca-certificates \
        libcap2-bin \
        curl \
    ; \
    arch="$(uname -m)"; \
    case "$arch" in \
      x86_64) ttyd_url="https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64" ;; \
      aarch64|arm64) ttyd_url="https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.aarch64" ;; \
      *) echo "Unsupported arch: $arch"; exit 1 ;; \
    esac; \
    curl -L -o /usr/local/bin/ttyd "$ttyd_url"; \
    chmod +x /usr/local/bin/ttyd; \
    rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir pyshark scapy

WORKDIR /work
