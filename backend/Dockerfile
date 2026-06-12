# Use official Python runtime as a parent image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory
WORKDIR /app

# Install system libraries required for OpenCV and YOLO
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and configure timeout parameters
RUN pip install --no-cache-dir --default-timeout=1000 --upgrade pip

# Install CPU-only PyTorch & Torchvision. Auto-detects architecture to pull the correct package index:
# - On AMD64 (x86_64), downloads CPU-only wheels from PyTorch wheel repository to avoid heavy CUDA wheels
# - On ARM64 (aarch64), installs CPU-only wheels directly from standard PyPI
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then \
        pip install --no-cache-dir --default-timeout=1000 \
            torch==2.2.2+cpu \
            torchvision==0.17.2+cpu \
            --index-url https://download.pytorch.org/whl/cpu; \
    else \
        pip install --no-cache-dir --default-timeout=1000 \
            torch==2.2.2 \
            torchvision==0.17.2; \
    fi

# Copy the requirements file into the container at /app
COPY requirements.txt /app/

# Install the rest of python dependencies (ultralytics will detect PyTorch is already installed)
RUN pip install --no-cache-dir --default-timeout=1000 -r requirements.txt

# Copy the rest of the application code into the container
COPY . /app/

# Expose port 8000
EXPOSE 8000

# Start the Django server and bind to 0.0.0.0
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
