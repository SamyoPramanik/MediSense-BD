# Use the slim Debian-based Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for psycopg2 (Postgres connector)
# and clean up apt cache to keep the image small
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Upgrade pip to avoid metadata parsing bugs with newer package wheels
RUN pip install --no-cache-dir --upgrade pip

# Install CPU-specific PyTorch first to avoid downloading huge NVIDIA/CUDA binaries
RUN pip install --no-cache-dir torch --extra-index-url https://download.pytorch.org/whl/cpu

# --no-cache-dir keeps the container size down by not storing pip cache
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Run the FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]