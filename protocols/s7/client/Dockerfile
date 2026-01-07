FROM python:3.11-slim

WORKDIR /app
COPY s7_client.py /app/s7_client.py
COPY requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r /app/requirements.txt

CMD ["python", "/app/s7_client.py"]
