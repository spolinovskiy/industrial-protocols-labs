FROM python:3.11-slim

WORKDIR /app
COPY opcua_client.py /app/opcua_client.py
COPY requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r /app/requirements.txt

CMD ["python", "/app/opcua_client.py"]
