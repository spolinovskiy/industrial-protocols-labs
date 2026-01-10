FROM python:3.10-slim

ARG WITH_PYDNP3=0

WORKDIR /app
COPY app.py /app/app.py
COPY requirements.txt /app/requirements.txt

RUN set -eux; \
    pip install --no-cache-dir -r /app/requirements.txt; \
    if [ "$WITH_PYDNP3" = "1" ]; then \
        apt-get update; \
        DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
            build-essential \
            cmake \
        ; \
        py_inc="$(python3 -c "import sysconfig; print(sysconfig.get_paths()['include'])")"; \
        if [ ! -e /usr/include/python2.7 ]; then ln -s "$py_inc" /usr/include/python2.7; fi; \
        pip install --no-cache-dir pydnp3==0.1.0; \
        apt-get purge -y --auto-remove build-essential cmake; \
        rm -rf /var/lib/apt/lists/*; \
    fi

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "9001"]
