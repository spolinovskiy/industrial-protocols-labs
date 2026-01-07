FROM docker:24-cli

RUN apk add --no-cache bash curl coreutils

COPY reset.sh /reset.sh
COPY policy.yaml /policy.yaml

RUN chmod +x /reset.sh

ENTRYPOINT ["/reset.sh"]
