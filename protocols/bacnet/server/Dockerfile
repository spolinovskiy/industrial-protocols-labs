FROM python:3.11-slim

WORKDIR /app
COPY bacnet_server.py /app/bacnet_server.py
COPY requirements.txt /app/requirements.txt

# Install BACnet stack explicitly to avoid stale requirements file caching.
RUN pip install --no-cache-dir bacpypes3==0.0.102 \
    && pip install --no-cache-dir -r /app/requirements.txt

CMD ["python", "/app/bacnet_server.py"]
