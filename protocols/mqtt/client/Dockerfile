FROM python:3.11-slim

WORKDIR /app
COPY mqtt_client.py /app/mqtt_client.py
COPY requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r /app/requirements.txt

CMD ["python", "/app/mqtt_client.py"]
