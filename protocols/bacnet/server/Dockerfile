FROM python:3.11-slim

WORKDIR /app
COPY bacnet_server.py /app/bacnet_server.py
COPY requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r /app/requirements.txt

CMD ["python", "/app/bacnet_server.py"]
