FROM python:3.11-slim

WORKDIR /app
COPY modbus_client.py /app/modbus_client.py
COPY requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r /app/requirements.txt

CMD ["python", "/app/modbus_client.py"]
