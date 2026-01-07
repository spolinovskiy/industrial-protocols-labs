FROM python:3.10-slim

WORKDIR /app
COPY dnp3_client.py /app/dnp3_client.py
COPY requirements.txt /app/requirements.txt

RUN set -eux; \
    apt-get update; \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        build-essential \
        cmake \
    ; \
    py_inc="$(python3 -c "import sysconfig; print(sysconfig.get_paths()['include'])")"; \
    if [ ! -e /usr/include/python2.7 ]; then ln -s "$py_inc" /usr/include/python2.7; fi; \
    rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir -r /app/requirements.txt

CMD ["python", "/app/dnp3_client.py"]
