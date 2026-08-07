FROM python:3.11-slim

WORKDIR /app

# python:3.11-slim omits compiler tooling to stay small — some
# dependencies need to compile C extensions and fail without this.
# pycairo specifically also needs Cairo's own dev headers + pkg-config,
# since it binds to the Cairo graphics library, not just plain C.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    pkg-config \
    libcairo2-dev \
    && rm -rf /var/lib/apt/lists/*

# Existing pipeline dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# API-layer dependencies added for the FastAPI wrapper
RUN pip install --no-cache-dir fastapi uvicorn python-multipart

COPY . .

EXPOSE 8001

CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8001"]