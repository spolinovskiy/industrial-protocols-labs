FROM python:3.11-slim

WORKDIR /app
COPY device_bridge.py /app/device_bridge.py
COPY requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r /app/requirements.txt

CMD ["python", "/app/device_bridge.py"]
