# Use a newer, supported Python version to avoid Google API warnings
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Copy the requirements file first (for caching)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port Render uses
EXPOSE 10000

# Start the application using Gunicorn (production server)
CMD ["gunicorn", "-b", "0.0.0.0:10000", "app:app"]
