FROM python:3.12-slim

# Strip docs/man/locales to keep the image small
RUN set -eux; \
    echo 'path-exclude=/usr/share/doc/*' > /etc/dpkg/dpkg.cfg.d/01_nodoc; \
    echo 'path-exclude=/usr/share/man/*' >> /etc/dpkg/dpkg.cfg.d/01_nodoc; \
    echo 'path-exclude=/usr/share/locale/*' >> /etc/dpkg/dpkg.cfg.d/01_nodoc

RUN set -eux; \
    apt-get update; \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        bash \
        ca-certificates \
        coreutils \
        curl \
        iproute2 \
        libcap2-bin \
        procps \
        tcpdump \
        termshark \
        tshark \
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

COPY entrypoint.sh /entrypoint.sh
COPY menu.sh /work/menu.sh
COPY start.sh /work/start.sh
COPY capture/ /work/capture/

RUN chmod +x /entrypoint.sh /work/menu.sh /work/start.sh /work/capture/*.sh

ENTRYPOINT ["/entrypoint.sh"]
