# Fiber Network Node (FNN) — use for platform fee collection, or as a reference image for self-hosting.
# See README.md for Railway and local compose.

FROM debian:bookworm-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl \
  && rm -rf /var/lib/apt/lists/*

ARG FIBER_VERSION=v0.8.0
ARG FIBER_ARCH=x86_64-linux-portable
ARG FIBER_TARBALL="fnn_${FIBER_VERSION}-${FIBER_ARCH}.tar.gz"
ARG FIBER_URL="https://github.com/nervosnetwork/fiber/releases/download/${FIBER_VERSION}/${FIBER_TARBALL}"

WORKDIR /opt/fiber

RUN curl -fsSL "$FIBER_URL" -o "/tmp/${FIBER_TARBALL}" \
  && mkdir -p /tmp/fnn-extract \
  && tar -xzf "/tmp/${FIBER_TARBALL}" -C /tmp/fnn-extract \
  && install -m755 /tmp/fnn-extract/fnn /tmp/fnn-extract/fnn-cli /tmp/fnn-extract/fnn-migrate /usr/local/bin/ \
  && cp /tmp/fnn-extract/config/testnet/config.yml /opt/fiber/config.yml \
  && sed -i 's/listening_addr: "127.0.0.1:8227"/listening_addr: "0.0.0.0:8227"/' /opt/fiber/config.yml \
  && rm -rf "/tmp/${FIBER_TARBALL}" /tmp/fnn-extract

ENV RUST_LOG=info
ENV FIBER_DATA_DIR=/data

EXPOSE 8227
EXPOSE 8228

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

VOLUME ["/data"]

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
