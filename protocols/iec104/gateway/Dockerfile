FROM python:3.10-slim

WORKDIR /app
COPY app.py /app/app.py
COPY requirements.txt /app/requirements.txt

RUN set -eux; \
    pip install --no-cache-dir -r /app/requirements.txt

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "9002"]
