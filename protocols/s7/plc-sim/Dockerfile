FROM python:3.11-slim

WORKDIR /app
COPY s7_server.py /app/s7_server.py
COPY requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r /app/requirements.txt

CMD ["python", "/app/s7_server.py"]
