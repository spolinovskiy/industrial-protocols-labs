FROM python:3.11-slim

WORKDIR /app
COPY cip_server.py /app/cip_server.py
COPY requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r /app/requirements.txt

CMD ["python", "/app/cip_server.py"]
