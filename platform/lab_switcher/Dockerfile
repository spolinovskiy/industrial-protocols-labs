FROM docker:26-cli

RUN apk add --no-cache bash python3 docker-cli-compose

WORKDIR /lab

CMD ["python3", "scripts/lab_switcher_server.py"]
