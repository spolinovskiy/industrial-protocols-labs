FROM python:3.11-slim

WORKDIR /app
COPY modbus_server.py /app/modbus_server.py
COPY requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r /app/requirements.txt

CMD ["python", "/app/modbus_server.py"]
